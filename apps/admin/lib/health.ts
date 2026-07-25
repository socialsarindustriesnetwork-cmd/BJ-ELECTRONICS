import { checkCommerceDatabase } from "@bje/database";
import { getReleaseMetadata, logEvent, validateRuntime } from "@bje/config";
import { checkDatabase } from "@/lib/db";
import { getOAuthConfigurationStatus } from "@/lib/oauth";

const service = "bj-electronics-admin";

export function getAdminLiveness() {
  return {
    status: "alive" as const,
    service,
    uptimeSeconds: Math.floor(process.uptime()),
    release: getReleaseMetadata(),
    timestamp: new Date().toISOString(),
  };
}

export async function getAdminReadiness() {
  const runtime = validateRuntime("admin");
  const [authenticationDatabase, commerceDatabase] = await Promise.all([
    checkDatabase(),
    checkCommerceDatabase(),
  ]);
  const oauth = getOAuthConfigurationStatus();
  const oauthHealthy = oauth.facebook !== "misconfigured";
  const healthy = runtime.ok && authenticationDatabase.ok && commerceDatabase.ok && oauthHealthy;
  const payload = {
    status: healthy ? ("healthy" as const) : ("degraded" as const),
    service,
    checks: {
      runtime: runtime.ok ? "configured" : "misconfigured",
      authenticationDatabase: authenticationDatabase.ok ? "up" : "down",
      commerceDatabase: commerceDatabase.ok ? "up" : "down",
      oauth,
      realtimePublishing: "enabled" as const,
    },
    diagnostics: {
      errors: runtime.errors,
      warnings: runtime.warnings,
      commerceDatabaseLatencyMs: commerceDatabase.latencyMs,
    },
    release: getReleaseMetadata(),
    timestamp: new Date().toISOString(),
  };
  if (!healthy) {
    logEvent("warn", service, "readiness.degraded", {
      runtimeErrors: runtime.errors,
      authenticationDatabaseUp: authenticationDatabase.ok,
      commerceDatabaseUp: commerceDatabase.ok,
      oauth,
    });
  }
  return { healthy, payload };
}
