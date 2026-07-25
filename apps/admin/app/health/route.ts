import { NextResponse } from "next/server";
import { checkCommerceDatabase } from "@bje/database";
import { checkDatabase } from "@/lib/db";
import { getOAuthConfigurationStatus } from "@/lib/oauth";

export const dynamic = "force-dynamic";

export async function GET() {
  const [authenticationDatabase, commerceDatabase] = await Promise.all([
    checkDatabase(),
    checkCommerceDatabase(),
  ]);
  const oauth = getOAuthConfigurationStatus();
  const authenticationSecret = Boolean(process.env.AUTH_SECRET);
  const healthy =
    authenticationDatabase.ok &&
    commerceDatabase.ok &&
    authenticationSecret &&
    oauth.facebook !== "misconfigured";

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "degraded",
      service: "bj-electronics-admin",
      checks: {
        authenticationDatabase: authenticationDatabase.ok ? "up" : "down",
        commerceDatabase: commerceDatabase.ok ? "up" : "down",
        authenticationSecret: authenticationSecret ? "configured" : "missing",
        oauth,
        realtimePublishing: "enabled",
      },
      timestamp: new Date().toISOString(),
    },
    {
      status: healthy ? 200 : 503,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
}
