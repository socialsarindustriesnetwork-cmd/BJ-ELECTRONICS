import { NextResponse } from "next/server";
import { checkDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const database = await checkDatabase();
  const healthy = database.ok && Boolean(process.env.AUTH_SECRET);

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "degraded",
      service: "bj-electronics-admin",
      environment: process.env.NODE_ENV ?? "unknown",
      checks: {
        database: database.ok ? "up" : "down",
        authenticationSecret: process.env.AUTH_SECRET ? "configured" : "missing",
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
