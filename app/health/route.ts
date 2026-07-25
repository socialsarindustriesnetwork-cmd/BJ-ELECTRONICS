import { NextResponse } from "next/server";
import { checkDatabase } from "@/lib/db";
import { getOAuthConfigurationStatus } from "@/lib/oauth";

export const dynamic = "force-dynamic";

export async function GET() {
  const database = await checkDatabase();
  const oauth = getOAuthConfigurationStatus();
  const authenticationSecretConfigured = Boolean(process.env.AUTH_SECRET);
  const oauthConfigurationValid = oauth.facebook !== "misconfigured";
  const healthy = database.ok && authenticationSecretConfigured && oauthConfigurationValid;

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "degraded",
      service: "bj-electronics-commerce",
      environment: process.env.NODE_ENV ?? "unknown",
      checks: {
        database: database.ok ? "up" : "down",
        authenticationSecret: authenticationSecretConfigured ? "configured" : "missing",
        oauth,
      },
      databaseLatencyMs: database.latencyMs,
      timestamp: new Date().toISOString(),
    },
    {
      status: healthy ? 200 : 503,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
}
