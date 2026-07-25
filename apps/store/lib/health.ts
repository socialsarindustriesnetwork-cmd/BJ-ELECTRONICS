import { checkCommerceDatabase } from "@bje/database";
import { getReleaseMetadata, logEvent, validateRuntime } from "@bje/config";

const service = "bj-electronics-store";

export function getStoreLiveness() {
  return {
    status: "alive" as const,
    service,
    uptimeSeconds: Math.floor(process.uptime()),
    release: getReleaseMetadata(),
    timestamp: new Date().toISOString(),
  };
}

export async function getStoreReadiness() {
  const runtime = validateRuntime("store");
  const database = await checkCommerceDatabase();
  const healthy = runtime.ok && database.ok;
  const payload = {
    status: healthy ? ("healthy" as const) : ("degraded" as const),
    service,
    checks: {
      runtime: runtime.ok ? "configured" : "misconfigured",
      database: database.ok ? "up" : "down",
      realtime: "enabled" as const,
    },
    diagnostics: {
      errors: runtime.errors,
      warnings: runtime.warnings,
      databaseLatencyMs: database.latencyMs,
    },
    release: getReleaseMetadata(),
    timestamp: new Date().toISOString(),
  };
  if (!healthy) {
    logEvent("warn", service, "readiness.degraded", {
      runtimeErrors: runtime.errors,
      databaseUp: database.ok,
      databaseLatencyMs: database.latencyMs,
    });
  }
  return { healthy, payload };
}
