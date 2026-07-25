import { NextResponse } from "next/server";
import { checkCommerceDatabase } from "@bje/database";

export const dynamic = "force-dynamic";

export async function GET() {
  const database = await checkCommerceDatabase();
  return NextResponse.json(
    {
      status: database.ok ? "healthy" : "degraded",
      service: "bj-electronics-store",
      checks: { database: database.ok ? "up" : "down", realtime: "enabled" },
      databaseLatencyMs: database.latencyMs,
      timestamp: new Date().toISOString(),
    },
    {
      status: database.ok ? 200 : 503,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
}
