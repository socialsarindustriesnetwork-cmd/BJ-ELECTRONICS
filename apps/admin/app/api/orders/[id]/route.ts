import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus, type OrderStatus } from "@bje/database/transactions";
import { assertJsonRequest, assertSameOrigin } from "@/lib/request-security";
import { commerceMutationError, requireCommerceApiUser } from "@admin/lib/admin-api";

const statuses = new Set<OrderStatus>([
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const authorization = await requireCommerceApiUser();
  if (authorization.response) return authorization.response;
  try {
    assertSameOrigin(request);
    assertJsonRequest(request);
    const body = await request.json() as { status?: unknown };
    if (typeof body.status !== "string" || !statuses.has(body.status as OrderStatus)) {
      return NextResponse.json({ error: "A valid order status is required." }, { status: 400 });
    }
    const { id } = await context.params;
    const order = await updateOrderStatus(id, body.status as OrderStatus, authorization.user.id);
    return NextResponse.json({ order }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return commerceMutationError(error);
  }
}
