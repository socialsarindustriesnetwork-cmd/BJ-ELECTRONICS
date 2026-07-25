export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

function trimmed(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export function getDatabaseUrl(): string {
  const value = trimmed("DATABASE_URL");
  if (!value) {
    throw new ConfigurationError("DATABASE_URL is not configured.");
  }
  return value;
}

export function getAuthSecret(): string {
  const value = trimmed("AUTH_SECRET");
  if (!value || value.length < 32) {
    throw new ConfigurationError("AUTH_SECRET must be configured with at least 32 characters.");
  }
  return value;
}

export function getAppUrl(): string {
  const value = trimmed("NEXT_PUBLIC_APP_URL") || "http://localhost:3000";
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new ConfigurationError("NEXT_PUBLIC_APP_URL must be a valid absolute URL.");
  }
  if (isProduction() && url.protocol !== "https:") {
    throw new ConfigurationError("NEXT_PUBLIC_APP_URL must use HTTPS in production.");
  }
  return url.origin;
}

export function isPublicSignupEnabled(): boolean {
  return (process.env.ALLOW_PUBLIC_SIGNUP ?? "true").toLowerCase() !== "false";
}

export function getAdminBootstrapEmails(): string[] {
  return (process.env.ADMIN_BOOTSTRAP_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function getGoogleOAuthCredentials(): { clientId: string; clientSecret: string } | null {
  const clientId = trimmed("GOOGLE_CLIENT_ID");
  const clientSecret = trimmed("GOOGLE_CLIENT_SECRET");
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}

export function getFacebookOAuthCredentials(): {
  clientId: string;
  clientSecret: string;
  graphVersion: string;
} | null {
  const clientId = trimmed("FACEBOOK_CLIENT_ID");
  const clientSecret = trimmed("FACEBOOK_CLIENT_SECRET");
  const graphVersion = trimmed("FACEBOOK_GRAPH_API_VERSION");
  if (!clientId || !clientSecret) return null;
  if (!graphVersion || !/^v\d+\.\d+$/.test(graphVersion)) {
    throw new ConfigurationError(
      "FACEBOOK_GRAPH_API_VERSION must be configured in vNN.N format when Facebook login is enabled.",
    );
  }
  return { clientId, clientSecret, graphVersion };
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}
