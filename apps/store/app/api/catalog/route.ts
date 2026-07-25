import { NextRequest, NextResponse } from "next/server";
import { getDashboardSummary, listPublishedProducts } from "@bje/database";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("q")?.slice(0, 120) ?? "";
  const [products, summary] = await Promise.all([
    listPublishedProducts({ search, limit: 100 }),
    getDashboardSummary(),
  ]);
  return NextResponse.json(
    { products, latestEventId: summary.latestEventId },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
