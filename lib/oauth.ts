import { cookies } from "next/headers";
import {
  createHash,
  createHmac,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import type { PoolClient } from "pg";
import {
  createSession,
  recordAuditEvent,
  resolveRoleForNewUser,
} from "@/lib/auth";
import type { AuthUser, UserRole } from "@/lib/auth-types";
import { withTransaction } from "@/lib/db";
import {
  ConfigurationError,
  getAppUrl,
  getAuthSecret,
  getFacebookOAuthCredentials,
  getGoogleOAuthCredentials,
  isProduction,
  isPublicSignupEnabled,
} from "@/lib/env";

export const OAUTH_PROVIDERS = ["google", "facebook"] as const;
export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];
export type OAuthMode = "sign-in" | "link";

const OAUTH_COOKIE_MAX_AGE_SECONDS = 10 * 60;
const GOOGLE_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

type OAuthTransaction = {
  provider: OAuthProvider;
  state: string;
  codeVerifier: string | null;
  nextPath: string;
  mode: OAuthMode;
  linkUserId: string | null;
  createdAt: number;
};

type OAuthProfile = {
  provider: OAuthProvider;
  providerAccountId: string;
  email: string;
  emailVerified: boolean;
  name: string;
  avatarUrl: string | null;
  rawProfile: Record<string, unknown>;
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string | null;
  role: UserRole;
  status: "ACTIVE" | "SUSPENDED";
  avatar_url: string | null;
  email_verified_at: Date | null;
  created_at: Date;
  last_login_at: Date | null;
};

type AccountUserRow = UserRow & {
  account_id: string;
};

function oauthCookieName(provider: OAuthProvider): string {
  return `bje_oauth_${provider}`;
}

function sign(value: string): string {
  return createHmac("sha256", getAuthSecret()).update(value).digest("base64url");
}

function encodeTransaction(transaction: OAuthTransaction): string {
  const payload = Buffer.from(JSON.stringify(transaction), "utf8").toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decodeTransaction(value: string): OAuthTransaction | null {
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const transaction = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as OAuthTransaction;
    if (!isOAuthProvider(transaction.provider)) return null;
    if (!transaction.state || !transaction.nextPath || !transaction.createdAt) return null;
    if (Date.now() - transaction.createdAt > OAUTH_COOKIE_MAX_AGE_SECONDS * 1000) return null;
    if (transaction.mode !== "sign-in" && transaction.mode !== "link") return null;
    return transaction;
  } catch {
    return null;
  }
}

function codeChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function sanitizeAvatarUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 2048) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function toAuthUser(row: UserRow): AuthUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    avatarUrl: row.avatar_url,
    emailVerified: Boolean(row.email_verified_at),
    createdAt: row.created_at.toISOString(),
    lastLoginAt: row.last_login_at?.toISOString() ?? null,
  };
}

function providerDatabaseName(provider: OAuthProvider): "GOOGLE" | "FACEBOOK" {
  return provider === "google" ? "GOOGLE" : "FACEBOOK";
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });
  const payload = (await response.json().catch(() => null)) as T | null;
  if (!response.ok || !payload) {
    const error = new Error("The identity provider returned an invalid response.");
    error.name = "OAuthProviderResponseError";
    throw error;
  }
  return payload;
}

export function isOAuthProvider(value: string): value is OAuthProvider {
  return OAUTH_PROVIDERS.includes(value as OAuthProvider);
}

export function safeAdminNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/admin";
  if (value.includes("\\") || /[\r\n]/.test(value)) return "/admin";
  try {
    const parsed = new URL(value, "https://admin.local");
    if (parsed.origin !== "https://admin.local") return "/admin";
    if (parsed.pathname !== "/admin" && !parsed.pathname.startsWith("/admin/")) {
      return "/admin";
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "/admin";
  }
}

export function getOAuthProviderAvailability(): Record<OAuthProvider, boolean> {
  let facebook = false;
  try {
    facebook = Boolean(getFacebookOAuthCredentials());
  } catch {
    facebook = false;
  }
  return {
    google: Boolean(getGoogleOAuthCredentials()),
    facebook,
  };
}

export function getOAuthConfigurationStatus(): Record<
  OAuthProvider,
  "configured" | "disabled" | "misconfigured"
> {
  let facebook: "configured" | "disabled" | "misconfigured" = "disabled";
  try {
    facebook = getFacebookOAuthCredentials() ? "configured" : "disabled";
  } catch {
    facebook = "misconfigured";
  }
  return {
    google: getGoogleOAuthCredentials() ? "configured" : "disabled",
    facebook,
  };
}

export function getOAuthCallbackUrl(provider: OAuthProvider): string {
  return new URL(`/api/auth/oauth/${provider}/callback`, getAppUrl()).toString();
}

export function createOAuthTransaction(input: {
  provider: OAuthProvider;
  nextPath?: string | null;
  mode?: OAuthMode;
  linkUserId?: string | null;
}): OAuthTransaction {
  return {
    provider: input.provider,
    state: randomBytes(32).toString("base64url"),
    codeVerifier:
      input.provider === "google" ? randomBytes(64).toString("base64url") : null,
    nextPath: safeAdminNextPath(input.nextPath),
    mode: input.mode ?? "sign-in",
    linkUserId: input.linkUserId ?? null,
    createdAt: Date.now(),
  };
}

export async function writeOAuthTransaction(transaction: OAuthTransaction): Promise<void> {
  const store = await cookies();
  store.set(oauthCookieName(transaction.provider), encodeTransaction(transaction), {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: `/api/auth/oauth/${transaction.provider}`,
    maxAge: OAUTH_COOKIE_MAX_AGE_SECONDS,
    priority: "high",
  });
}

export async function consumeOAuthTransaction(
  provider: OAuthProvider,
): Promise<OAuthTransaction | null> {
  const store = await cookies();
  const cookieName = oauthCookieName(provider);
  const value = store.get(cookieName)?.value;
  store.set(cookieName, "", {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: `/api/auth/oauth/${provider}`,
    expires: new Date(0),
    priority: "high",
  });
  return value ? decodeTransaction(value) : null;
}

export function buildOAuthAuthorizationUrl(transaction: OAuthTransaction): string {
  const redirectUri = getOAuthCallbackUrl(transaction.provider);

  if (transaction.provider === "google") {
    const credentials = getGoogleOAuthCredentials();
    if (!credentials) {
      throw new ConfigurationError("Google authentication is not configured.");
    }
    if (!transaction.codeVerifier) {
      throw new ConfigurationError("Google PKCE transaction is incomplete.");
    }
    const url = new URL(GOOGLE_AUTHORIZE_URL);
    url.searchParams.set("client_id", credentials.clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("state", transaction.state);
    url.searchParams.set("code_challenge", codeChallenge(transaction.codeVerifier));
    url.searchParams.set("code_challenge_method", "S256");
    url.searchParams.set("prompt", "select_account");
    return url.toString();
  }

  const credentials = getFacebookOAuthCredentials();
  if (!credentials) {
    throw new ConfigurationError("Facebook authentication is not configured.");
  }
  const url = new URL(
    `https://www.facebook.com/${credentials.graphVersion}/dialog/oauth`,
  );
  url.searchParams.set("client_id", credentials.clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "email,public_profile");
  url.searchParams.set("state", transaction.state);
  return url.toString();
}

async function exchangeGoogleCode(
  code: string,
  transaction: OAuthTransaction,
): Promise<OAuthProfile> {
  const credentials = getGoogleOAuthCredentials();
  if (!credentials || !transaction.codeVerifier) {
    throw new ConfigurationError("Google authentication is not configured.");
  }

  const token = await fetchJson<{
    access_token?: string;
    token_type?: string;
  }>(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      redirect_uri: getOAuthCallbackUrl("google"),
      grant_type: "authorization_code",
      code_verifier: transaction.codeVerifier,
    }),
  });
  if (!token.access_token || token.token_type?.toLowerCase() !== "bearer") {
    const error = new Error("Google did not return a usable access token.");
    error.name = "OAuthProviderResponseError";
    throw error;
  }

  const profile = await fetchJson<{
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
  }>(GOOGLE_USERINFO_URL, {
    headers: { authorization: `Bearer ${token.access_token}` },
  });
  if (!profile.sub || !profile.email) {
    const error = new Error("Google did not return the required profile fields.");
    error.name = "OAuthProfileMissingEmailError";
    throw error;
  }
  if (profile.email_verified !== true) {
    const error = new Error("The Google email address is not verified.");
    error.name = "OAuthEmailNotVerifiedError";
    throw error;
  }

  return {
    provider: "google",
    providerAccountId: profile.sub,
    email: normalizeEmail(profile.email),
    emailVerified: true,
    name: profile.name?.trim() || profile.email.split("@")[0] || "Google user",
    avatarUrl: sanitizeAvatarUrl(profile.picture),
    rawProfile: {
      sub: profile.sub,
      name: profile.name ?? null,
      picture: sanitizeAvatarUrl(profile.picture),
    },
  };
}

async function exchangeFacebookCode(
  code: string,
  transaction: OAuthTransaction,
): Promise<OAuthProfile> {
  const credentials = getFacebookOAuthCredentials();
  if (!credentials) {
    throw new ConfigurationError("Facebook authentication is not configured.");
  }

  const token = await fetchJson<{ access_token?: string; token_type?: string }>(
    `https://graph.facebook.com/${credentials.graphVersion}/oauth/access_token`,
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        redirect_uri: getOAuthCallbackUrl("facebook"),
        code,
      }),
    },
  );
  if (!token.access_token) {
    const error = new Error("Facebook did not return a usable access token.");
    error.name = "OAuthProviderResponseError";
    throw error;
  }

  const debugUrl = new URL(
    `https://graph.facebook.com/${credentials.graphVersion}/debug_token`,
  );
  debugUrl.searchParams.set("input_token", token.access_token);
  debugUrl.searchParams.set(
    "access_token",
    `${credentials.clientId}|${credentials.clientSecret}`,
  );
  const debug = await fetchJson<{
    data?: { is_valid?: boolean; app_id?: string; user_id?: string };
  }>(debugUrl.toString());
  if (
    debug.data?.is_valid !== true ||
    debug.data.app_id !== credentials.clientId ||
    !debug.data.user_id
  ) {
    const error = new Error("Facebook token validation failed.");
    error.name = "OAuthProviderResponseError";
    throw error;
  }

  const proof = createHmac("sha256", credentials.clientSecret)
    .update(token.access_token)
    .digest("hex");
  const profileUrl = new URL(
    `https://graph.facebook.com/${credentials.graphVersion}/me`,
  );
  profileUrl.searchParams.set("fields", "id,name,email,picture.width(256).height(256)");
  profileUrl.searchParams.set("access_token", token.access_token);
  profileUrl.searchParams.set("appsecret_proof", proof);
  const profile = await fetchJson<{
    id?: string;
    name?: string;
    email?: string;
    picture?: { data?: { url?: string } };
  }>(profileUrl.toString());
  if (!profile.id || profile.id !== debug.data.user_id || !profile.email) {
    const error = new Error("Facebook did not return an email address for this account.");
    error.name = "OAuthProfileMissingEmailError";
    throw error;
  }

  return {
    provider: "facebook",
    providerAccountId: profile.id,
    email: normalizeEmail(profile.email),
    emailVerified: false,
    name: profile.name?.trim() || profile.email.split("@")[0] || "Facebook user",
    avatarUrl: sanitizeAvatarUrl(profile.picture?.data?.url),
    rawProfile: {
      id: profile.id,
      name: profile.name ?? null,
      picture: sanitizeAvatarUrl(profile.picture?.data?.url),
    },
  };
}

export async function exchangeOAuthCode(
  provider: OAuthProvider,
  code: string,
  transaction: OAuthTransaction,
): Promise<OAuthProfile> {
  if (provider !== transaction.provider) {
    const error = new Error("OAuth provider mismatch.");
    error.name = "OAuthInvalidStateError";
    throw error;
  }
  return provider === "google"
    ? exchangeGoogleCode(code, transaction)
    : exchangeFacebookCode(code, transaction);
}

async function loadUserForProviderAccount(
  client: PoolClient,
  profile: OAuthProfile,
): Promise<AccountUserRow | null> {
  const result = await client.query<AccountUserRow>(
    `SELECT
       a.id AS account_id,
       u.id,
       u.name,
       u.email,
       u.password_hash,
       u.role,
       u.status,
       u.avatar_url,
       u.email_verified_at,
       u.created_at,
       u.last_login_at
     FROM auth_accounts a
     JOIN auth_users u ON u.id = a.user_id
     WHERE a.provider = $1 AND a.provider_account_id = $2
     LIMIT 1`,
    [providerDatabaseName(profile.provider), profile.providerAccountId],
  );
  return result.rows[0] ?? null;
}

async function loadUserByEmail(client: PoolClient, email: string): Promise<UserRow | null> {
  const result = await client.query<UserRow>(
    `SELECT id, name, email, password_hash, role, status, avatar_url,
            email_verified_at, created_at, last_login_at
     FROM auth_users
     WHERE LOWER(email) = LOWER($1)
     LIMIT 1`,
    [email],
  );
  return result.rows[0] ?? null;
}

async function insertProviderAccount(
  client: PoolClient,
  userId: string,
  profile: OAuthProfile,
): Promise<void> {
  try {
    await client.query(
      `INSERT INTO auth_accounts
        (id, user_id, provider, provider_account_id, provider_email,
         provider_email_verified, profile, last_login_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, NOW())`,
      [
        randomUUID(),
        userId,
        providerDatabaseName(profile.provider),
        profile.providerAccountId,
        profile.email,
        profile.emailVerified,
        JSON.stringify(profile.rawProfile),
      ],
    );
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "23505") {
      const conflict = new Error("This provider account is already connected to another user.");
      conflict.name = "OAuthAccountConflictError";
      throw conflict;
    }
    throw error;
  }
}

export async function completeOAuthAuthentication(input: {
  profile: OAuthProfile;
  userAgent: string | null;
  ip: string;
  linkUserId?: string | null;
}): Promise<{ user: AuthUser; token: string; expiresAt: Date }> {
  return withTransaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(78315295)");
    const existingAccount = await loadUserForProviderAccount(client, input.profile);
    let user: UserRow;
    let created = false;
    let linked = false;

    if (input.linkUserId) {
      const linkTarget = await client.query<UserRow>(
        `SELECT id, name, email, password_hash, role, status, avatar_url,
                email_verified_at, created_at, last_login_at
         FROM auth_users WHERE id = $1 LIMIT 1`,
        [input.linkUserId],
      );
      user = linkTarget.rows[0];
      if (!user || user.status !== "ACTIVE") {
        const error = new Error("The account being linked is unavailable.");
        error.name = "OAuthAccountSuspendedError";
        throw error;
      }
      if (existingAccount && existingAccount.id !== user.id) {
        const error = new Error("This provider account is already connected to another user.");
        error.name = "OAuthAccountConflictError";
        throw error;
      }
      if (!existingAccount) {
        await insertProviderAccount(client, user.id, input.profile);
        linked = true;
      }
    } else if (existingAccount) {
      user = existingAccount;
    } else {
      const emailUser = await loadUserByEmail(client, input.profile.email);
      if (emailUser) {
        if (emailUser.status !== "ACTIVE") {
          const error = new Error("This account is suspended.");
          error.name = "OAuthAccountSuspendedError";
          throw error;
        }
        if (!input.profile.emailVerified && !emailUser.email_verified_at) {
          const error = new Error(
            "Sign in with your password first, then connect this Facebook account from security settings.",
          );
          error.name = "OAuthAccountLinkRequiredError";
          throw error;
        }
        user = emailUser;
        await insertProviderAccount(client, user.id, input.profile);
        linked = true;
      } else {
        if (!isPublicSignupEnabled()) {
          const error = new Error("New account creation is disabled.");
          error.name = "OAuthSignupDisabledError";
          throw error;
        }
        const role = await resolveRoleForNewUser(client, input.profile.email);
        const inserted = await client.query<UserRow>(
          `INSERT INTO auth_users
            (id, name, email, password_hash, role, status, avatar_url,
             email_verified_at, last_login_at)
           VALUES ($1, $2, $3, NULL, $4, 'ACTIVE', $5,
                   CASE WHEN $6 THEN NOW() ELSE NULL END, NOW())
           RETURNING id, name, email, password_hash, role, status, avatar_url,
                     email_verified_at, created_at, last_login_at`,
          [
            randomUUID(),
            input.profile.name,
            input.profile.email,
            role,
            input.profile.avatarUrl,
            input.profile.emailVerified,
          ],
        );
        user = inserted.rows[0];
        await insertProviderAccount(client, user.id, input.profile);
        created = true;
        linked = true;
      }
    }

    if (user.status !== "ACTIVE") {
      const error = new Error("This account is suspended.");
      error.name = "OAuthAccountSuspendedError";
      throw error;
    }

    await client.query(
      `UPDATE auth_accounts
       SET provider_email = $3,
           provider_email_verified = $4,
           profile = $5::jsonb,
           last_login_at = NOW(),
           updated_at = NOW()
       WHERE provider = $1 AND provider_account_id = $2`,
      [
        providerDatabaseName(input.profile.provider),
        input.profile.providerAccountId,
        input.profile.email,
        input.profile.emailVerified,
        JSON.stringify(input.profile.rawProfile),
      ],
    );

    const refreshed = await client.query<UserRow>(
      `UPDATE auth_users
       SET avatar_url = COALESCE(avatar_url, $2),
           email_verified_at = CASE
             WHEN email_verified_at IS NULL AND $3 THEN NOW()
             ELSE email_verified_at
           END,
           last_login_at = NOW(),
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, name, email, password_hash, role, status, avatar_url,
                 email_verified_at, created_at, last_login_at`,
      [user.id, input.profile.avatarUrl, input.profile.emailVerified],
    );
    user = refreshed.rows[0];

    const session = await createSession(client, user.id, true, {
      userAgent: input.userAgent,
      ip: input.ip,
    });
    await recordAuditEvent(client, {
      actorUserId: user.id,
      action: input.linkUserId ? "AUTH.PROVIDER_LINK" : "AUTH.SIGN_IN",
      targetType: "AUTH_ACCOUNT",
      targetId: input.profile.providerAccountId,
      metadata: {
        provider: providerDatabaseName(input.profile.provider),
        created,
        linked,
        method: "OAUTH",
      },
      ip: input.ip,
    });

    return {
      user: toAuthUser(user),
      token: session.token,
      expiresAt: session.expiresAt,
    };
  });
}

export function oauthErrorCode(error: unknown): string {
  if (!(error instanceof Error)) return "oauth_failed";
  const mapping: Record<string, string> = {
    ConfigurationError: "configuration",
    OAuthInvalidStateError: "invalid_state",
    OAuthProviderResponseError: "provider_response",
    OAuthProfileMissingEmailError: "missing_email",
    OAuthEmailNotVerifiedError: "email_not_verified",
    OAuthAccountLinkRequiredError: "account_link_required",
    OAuthSignupDisabledError: "signup_disabled",
    OAuthAccountSuspendedError: "account_suspended",
    OAuthAccountConflictError: "account_conflict",
    BootstrapEmailNotAllowedError: "bootstrap_not_allowed",
  };
  return mapping[error.name] ?? "oauth_failed";
}

export function oauthErrorMessage(code: string | string[] | undefined): string | null {
  const value = Array.isArray(code) ? code[0] : code;
  const messages: Record<string, string> = {
    access_denied: "The identity provider sign-in was cancelled.",
    invalid_state: "The sign-in request expired or could not be verified. Please try again.",
    provider_response: "The identity provider could not verify this sign-in.",
    missing_email: "The selected account did not provide an email address.",
    email_not_verified: "The selected Google email address is not verified.",
    account_link_required:
      "An account already uses this email. Sign in with your password before linking Facebook.",
    signup_disabled: "New account creation is disabled. Ask an administrator for access.",
    account_suspended: "This administration account is suspended.",
    account_conflict: "That provider account is already connected to another user.",
    bootstrap_not_allowed: "This email is not approved to create the first administrator account.",
    configuration: "This sign-in provider is not configured correctly.",
    oauth_failed: "Social sign-in could not be completed. Please try again.",
  };
  return value ? messages[value] ?? messages.oauth_failed : null;
}
