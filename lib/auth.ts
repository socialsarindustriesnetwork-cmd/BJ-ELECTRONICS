import { compare, hash } from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { query, withTransaction } from "@/lib/db";
import { getAuthSecret, isProduction } from "@/lib/env";
import type { AuthUser, SessionUserRow, UserRole } from "@/lib/auth-types";
import { privacyHash } from "@/lib/request-security";

export const SESSION_COOKIE_NAME = "bje_session";
const SESSION_DAYS = 30;
const SHORT_SESSION_HOURS = 12;

function hashSessionToken(token: string): string {
  return createHash("sha256").update(`${getAuthSecret()}:${token}`).digest("hex");
}

function toAuthUser(row: SessionUserRow): AuthUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    createdAt: row.created_at.toISOString(),
    lastLoginAt: row.last_login_at?.toISOString() ?? null,
  };
}

export function createSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function sessionExpiry(remember: boolean): Date {
  const expiresAt = new Date();
  if (remember) {
    expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);
  } else {
    expiresAt.setHours(expiresAt.getHours() + SHORT_SESSION_HOURS);
  }
  return expiresAt;
}

export async function writeSessionCookie(token: string, expiresAt: Date): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
    priority: "high",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
    priority: "high",
  });
}

export async function createSession(
  client: PoolClient,
  userId: string,
  remember: boolean,
  requestMeta: { userAgent: string | null; ip: string },
): Promise<{ token: string; expiresAt: Date }> {
  const token = createSessionToken();
  const expiresAt = sessionExpiry(remember);
  await client.query(
    `INSERT INTO auth_sessions
      (id, user_id, token_hash, expires_at, user_agent, ip_hash)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      randomUUID(),
      userId,
      hashSessionToken(token),
      expiresAt,
      requestMeta.userAgent?.slice(0, 500) ?? null,
      privacyHash(requestMeta.ip),
    ],
  );
  return { token, expiresAt };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const rows = await query<SessionUserRow>(
    `SELECT
       s.id AS session_id,
       s.expires_at AS session_expires_at,
       s.last_seen_at AS session_last_seen_at,
       u.id,
       u.name,
       u.email,
       u.role,
       u.status,
       u.created_at,
       u.last_login_at
     FROM auth_sessions s
     JOIN auth_users u ON u.id = s.user_id
     WHERE s.token_hash = $1
       AND s.expires_at > NOW()
       AND u.status = 'ACTIVE'
     LIMIT 1`,
    [hashSessionToken(token)],
  );

  const row = rows[0];
  if (!row) return null;

  if (Date.now() - row.session_last_seen_at.getTime() > 5 * 60 * 1000) {
    await query(
      "UPDATE auth_sessions SET last_seen_at = NOW() WHERE id = $1",
      [row.session_id],
    );
  }

  return toAuthUser(row);
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return user;
}

export function hasRole(user: AuthUser, allowed: readonly UserRole[]): boolean {
  return allowed.includes(user.role);
}

export async function requireRole(allowed: readonly UserRole[]): Promise<AuthUser> {
  const user = await requireUser();
  if (!hasRole(user, allowed)) redirect("/?access=denied");
  return user;
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return compare(password, passwordHash);
}

export async function destroyCurrentSession(): Promise<void> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    await query("DELETE FROM auth_sessions WHERE token_hash = $1", [hashSessionToken(token)]);
  }
  await clearSessionCookie();
}

export async function recordAuditEvent(
  client: PoolClient,
  input: {
    actorUserId?: string | null;
    action: string;
    targetType?: string | null;
    targetId?: string | null;
    metadata?: Record<string, unknown>;
    ip?: string;
  },
): Promise<void> {
  await client.query(
    `INSERT INTO auth_audit_log
      (id, actor_user_id, action, target_type, target_id, metadata, ip_hash)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)`,
    [
      randomUUID(),
      input.actorUserId ?? null,
      input.action,
      input.targetType ?? null,
      input.targetId ?? null,
      JSON.stringify(input.metadata ?? {}),
      input.ip ? privacyHash(input.ip) : null,
    ],
  );
}

export async function assertRateLimit(
  action: "SIGN_IN" | "SIGN_UP",
  identifier: string,
  ip: string,
  maxAttempts = 10,
): Promise<void> {
  const rows = await query<{ attempt_count: string }>(
    `SELECT COUNT(*)::text AS attempt_count
     FROM auth_attempts
     WHERE action = $1
       AND success = FALSE
       AND created_at > NOW() - INTERVAL '15 minutes'
       AND (identifier_hash = $2 OR ip_hash = $3)`,
    [action, privacyHash(identifier), privacyHash(ip)],
  );
  if (Number(rows[0]?.attempt_count ?? 0) >= maxAttempts) {
    const error = new Error("Too many attempts. Try again in 15 minutes.");
    error.name = "RateLimitError";
    throw error;
  }
}

export async function recordAuthAttempt(
  action: "SIGN_IN" | "SIGN_UP",
  identifier: string,
  ip: string,
  success: boolean,
): Promise<void> {
  await query(
    `INSERT INTO auth_attempts (action, identifier_hash, ip_hash, success)
     VALUES ($1, $2, $3, $4)`,
    [action, privacyHash(identifier), privacyHash(ip), success],
  );
}

export async function createRegisteredUser(input: {
  name: string;
  email: string;
  password: string;
  remember: boolean;
  userAgent: string | null;
  ip: string;
}): Promise<{ user: AuthUser; token: string; expiresAt: Date }> {
  return withTransaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(78315294)");
    const existing = await client.query<{ id: string }>(
      "SELECT id FROM auth_users WHERE LOWER(email) = LOWER($1) LIMIT 1",
      [input.email],
    );
    if (existing.rowCount) {
      const error = new Error("An account already exists for this email.");
      error.name = "DuplicateAccountError";
      throw error;
    }

    const countResult = await client.query<{ count: string }>(
      "SELECT COUNT(*)::text AS count FROM auth_users WHERE status = 'ACTIVE'",
    );
    const role: UserRole = Number(countResult.rows[0]?.count ?? 0) === 0 ? "SUPER_ADMIN" : "STAFF";
    const userId = randomUUID();
    const passwordHash = await hashPassword(input.password);
    const inserted = await client.query<{
      id: string;
      name: string;
      email: string;
      role: UserRole;
      status: "ACTIVE" | "SUSPENDED";
      created_at: Date;
      last_login_at: Date | null;
    }>(
      `INSERT INTO auth_users
        (id, name, email, password_hash, role, status, last_login_at)
       VALUES ($1, $2, $3, $4, $5, 'ACTIVE', NOW())
       RETURNING id, name, email, role, status, created_at, last_login_at`,
      [userId, input.name, input.email, passwordHash, role],
    );

    const session = await createSession(client, userId, input.remember, {
      userAgent: input.userAgent,
      ip: input.ip,
    });
    await recordAuditEvent(client, {
      actorUserId: userId,
      action: "AUTH.SIGN_UP",
      targetType: "USER",
      targetId: userId,
      metadata: { role },
      ip: input.ip,
    });

    const userRow = inserted.rows[0];
    return {
      user: {
        id: userRow.id,
        name: userRow.name,
        email: userRow.email,
        role: userRow.role,
        status: userRow.status,
        createdAt: userRow.created_at.toISOString(),
        lastLoginAt: userRow.last_login_at?.toISOString() ?? null,
      },
      token: session.token,
      expiresAt: session.expiresAt,
    };
  });
}
