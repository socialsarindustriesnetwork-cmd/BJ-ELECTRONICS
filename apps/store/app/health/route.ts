import { NextResponse } from "next/server";
import { getStoreReadiness } from "@/lib/health";

export const dynamic = "force-dynamic";

export async function GET() {
  const { healthy, payload } = await getStoreReadiness();
  return NextResponse.json(payload, {
    status: healthy ? 200 : 503,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
