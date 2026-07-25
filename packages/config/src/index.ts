const DEFAULT_STORE_URL = "https://www.bjelectronics.shop";
const DEFAULT_ADMIN_URL = "https://admin.bjelectronics.shop";

export type PlatformService = "store" | "admin";

export type RuntimeValidation = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

export type ReleaseMetadata = {
  commit: string;
  version: string;
  environment: string;
  deployedAt: string | null;
};

function origin(value: string | undefined, fallback: string): string {
  const candidate = value?.trim() || fallback;
  const parsed = new URL(candidate);
  if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") {
    throw new Error(`Production origin must use HTTPS: ${candidate}`);
  }
  return parsed.origin;
}

function requiredOrigin(
  name: string,
  fallback: string,
  expectedHostname: string,
  errors: string[],
): string | null {
  const value = process.env[name]?.trim() || fallback;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:") errors.push(`${name} must use HTTPS in production.`);
    if (parsed.hostname.toLowerCase() !== expectedHostname) {
      errors.push(`${name} must use ${expectedHostname}.`);
    }
    if (parsed.pathname !== "/" || parsed.search || parsed.hash) {
      errors.push(`${name} must be an origin without a path, query, or fragment.`);
    }
    return parsed.origin;
  } catch {
    errors.push(`${name} must be a valid absolute URL.`);
    return null;
  }
}

function parseInteger(
  name: string,
  fallback: number,
  minimum: number,
  maximum: number,
  errors: string[],
): number {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    errors.push(`${name} must be an integer between ${minimum} and ${maximum}.`);
    return fallback;
  }
  return value;
}

function configuredPair(first: string, second: string, errors: string[]): boolean {
  const firstConfigured = Boolean(process.env[first]?.trim());
  const secondConfigured = Boolean(process.env[second]?.trim());
  if (firstConfigured !== secondConfigured) {
    errors.push(`${first} and ${second} must be configured together.`);
  }
  return firstConfigured && secondConfigured;
}

export function getStoreUrl(): string {
  return origin(process.env.NEXT_PUBLIC_STORE_URL, DEFAULT_STORE_URL);
}

export function getAdminUrl(): string {
  return origin(process.env.NEXT_PUBLIC_ADMIN_URL ?? process.env.NEXT_PUBLIC_APP_URL, DEFAULT_ADMIN_URL);
}

export function getReleaseMetadata(): ReleaseMetadata {
  const commit =
    process.env.RELEASE_SHA?.trim() ||
    process.env.GIT_COMMIT_SHA?.trim() ||
    process.env.HOSTINGER_GIT_COMMIT?.trim() ||
    process.env.GITHUB_SHA?.trim() ||
    "unknown";
  const deployedAt = process.env.RELEASE_DEPLOYED_AT?.trim() || null;
  return {
    commit,
    version: process.env.RELEASE_VERSION?.trim() || "1.0.0",
    environment: process.env.NODE_ENV?.trim() || "development",
    deployedAt,
  };
}

export function validateRuntime(service: PlatformService): RuntimeValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const production = process.env.NODE_ENV === "production";

  requiredOrigin("NEXT_PUBLIC_STORE_URL", DEFAULT_STORE_URL, "www.bjelectronics.shop", errors);
  requiredOrigin("NEXT_PUBLIC_ADMIN_URL", DEFAULT_ADMIN_URL, "admin.bjelectronics.shop", errors);

  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    errors.push("DATABASE_URL is required.");
  } else {
    try {
      const parsed = new URL(databaseUrl);
      if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
        errors.push("DATABASE_URL must use the postgres or postgresql protocol.");
      }
      if (!parsed.hostname || !parsed.pathname || parsed.pathname === "/") {
        errors.push("DATABASE_URL must include a host and database name.");
      }
    } catch {
      errors.push("DATABASE_URL must be a valid PostgreSQL connection URL.");
    }
  }

  parseInteger("DB_POOL_MAX", 10, 1, 50, errors);
  parseInteger("REALTIME_POLL_INTERVAL_MS", 1500, 500, 30_000, errors);

  if (production && process.env.DB_SSL === "false") {
    errors.push("DB_SSL cannot be false in production.");
  }
  if (production && process.env.DB_SSL_REJECT_UNAUTHORIZED === "false") {
    warnings.push("DB_SSL_REJECT_UNAUTHORIZED=false weakens database certificate verification.");
  }

  if (service === "admin") {
    const secret = process.env.AUTH_SECRET?.trim() ?? "";
    if (secret.length < 32) errors.push("AUTH_SECRET must contain at least 32 characters.");

    const publicSignup = process.env.ALLOW_PUBLIC_SIGNUP === "true";
    const bootstrapEmails = (process.env.ADMIN_BOOTSTRAP_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);
    if (publicSignup && bootstrapEmails.length === 0) {
      errors.push("ADMIN_BOOTSTRAP_EMAILS is required while public administrator signup is enabled.");
    }
    if (production && publicSignup) {
      warnings.push("Public administrator signup is enabled; disable it after owner bootstrap.");
    }

    configuredPair("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", errors);
    const facebookConfigured = configuredPair("FACEBOOK_CLIENT_ID", "FACEBOOK_CLIENT_SECRET", errors);
    if (facebookConfigured && !/^v\d+\.\d+$/.test(process.env.FACEBOOK_GRAPH_API_VERSION?.trim() ?? "")) {
      errors.push("FACEBOOK_GRAPH_API_VERSION must use the vNN.N format when Facebook is configured.");
    }
  }

  if (!production) warnings.push("NODE_ENV is not production.");
  return { ok: errors.length === 0, errors, warnings };
}

export function logEvent(
  level: "info" | "warn" | "error",
  service: string,
  event: string,
  data: Record<string, unknown> = {},
): void {
  const payload = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    service,
    event,
    release: getReleaseMetadata().commit,
    ...data,
  });
  if (level === "error") console.error(payload);
  else if (level === "warn") console.warn(payload);
  else console.info(payload);
}

export const platformDomains = {
  store: DEFAULT_STORE_URL,
  admin: DEFAULT_ADMIN_URL,
} as const;

export function isStoreHost(hostname: string): boolean {
  return ["www.bjelectronics.shop", "bjelectronics.shop"].includes(hostname.toLowerCase());
}

export function isAdminHost(hostname: string): boolean {
  return ["admin.bjelectronics.shop", "www.admin.bjelectronics.shop"].includes(hostname.toLowerCase());
}
