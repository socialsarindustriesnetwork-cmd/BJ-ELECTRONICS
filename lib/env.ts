export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

export function getDatabaseUrl(): string {
  const value = process.env.DATABASE_URL?.trim();
  if (!value) {
    throw new ConfigurationError("DATABASE_URL is not configured.");
  }
  return value;
}

export function getAuthSecret(): string {
  const value = process.env.AUTH_SECRET?.trim();
  if (!value || value.length < 32) {
    throw new ConfigurationError("AUTH_SECRET must be configured with at least 32 characters.");
  }
  return value;
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
}

export function isPublicSignupEnabled(): boolean {
  return (process.env.ALLOW_PUBLIC_SIGNUP ?? "true").toLowerCase() !== "false";
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}
