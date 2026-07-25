import { NextResponse } from "next/server";
import { getCart } from "@bje/database/transactions";
import { getOrCreateCartCredential, rotateCartCredential } from "@/lib/cart-session";
import { storefrontCommerceError } from "@/lib/commerce-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const credential = await getOrCreateCartCredential();
    const cart = await getCart(credential.tokenHash);
    return NextResponse.json({ cart }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof Error && ["CartExpiredError", "CartUnavailableError"].includes(error.name)) {
      const credential = await rotateCartCredential();
      const cart = await getCart(credential.tokenHash);
      return NextResponse.json({ cart }, { headers: { "Cache-Control": "private, no-store" } });
    }
    return storefrontCommerceError(error);
  }
}
