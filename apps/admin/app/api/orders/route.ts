import { NextResponse } from "next/server";
import { listOrders } from "@bje/database/transactions";
import { requireCommerceApiUser } from "@admin/lib/admin-api";

export const dynamic = "force-dynamic";

export async function GET() {
  const authorization = await requireCommerceApiUser();
  if (authorization.response) return authorization.response;
  const orders = await listOrders({ limit: 250 });
  return NextResponse.json({ orders }, { headers: { "Cache-Control": "private, no-store" } });
}
