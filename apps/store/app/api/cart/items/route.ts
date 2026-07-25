import { NextRequest, NextResponse } from "next/server";
import { setCartItem } from "@bje/database/transactions";
import { getOrCreateCartCredential } from "@/lib/cart-session";
import { assertStoreMutation, cleanString, storefrontCommerceError } from "@/lib/commerce-api";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    assertStoreMutation(request);
    const body = await request.json() as Record<string, unknown>;
    const productId = cleanString(body.productId, 64);
    const quantity = Number(body.quantity);
    if (!/^[0-9a-f-]{36}$/i.test(productId) || !Number.isInteger(quantity)) {
      return NextResponse.json({ error: "A valid product and quantity are required." }, { status: 400 });
    }
    const credential = await getOrCreateCartCredential();
    const cart = await setCartItem(credential.tokenHash, productId, quantity);
    return NextResponse.json({ cart }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return storefrontCommerceError(error);
  }
}
