import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createCheckoutOrder, type CheckoutInput } from "@bje/database/transactions";
import { getOrCreateCartCredential, hashCartToken, rotateCartCredential } from "@/lib/cart-session";
import { assertStoreMutation, cleanString, storefrontCommerceError } from "@/lib/commerce-api";

export const dynamic = "force-dynamic";

function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
  try {
    assertStoreMutation(request);
    const body = await request.json() as Record<string, unknown>;
    const paymentMethod = body.paymentMethod === "BANK_TRANSFER" ? "BANK_TRANSFER" : "CASH_ON_DELIVERY";
    const input: CheckoutInput = {
      customerName: cleanString(body.customerName, 160),
      customerEmail: cleanString(body.customerEmail, 254).toLowerCase(),
      customerPhone: cleanString(body.customerPhone, 40),
      addressLine1: cleanString(body.addressLine1, 180),
      addressLine2: cleanString(body.addressLine2, 180) || null,
      city: cleanString(body.city, 100),
      region: cleanString(body.region, 100) || null,
      postalCode: cleanString(body.postalCode, 32) || null,
      country: cleanString(body.country, 2).toUpperCase() || "BD",
      customerNote: cleanString(body.customerNote, 1000) || null,
      paymentMethod,
    };

    const fieldErrors: Record<string, string> = {};
    if (input.customerName.length < 2) fieldErrors.customerName = "Enter the customer name.";
    if (!validEmail(input.customerEmail)) fieldErrors.customerEmail = "Enter a valid email address.";
    if (input.customerPhone.length < 6) fieldErrors.customerPhone = "Enter a valid phone number.";
    if (input.addressLine1.length < 5) fieldErrors.addressLine1 = "Enter a complete delivery address.";
    if (input.city.length < 2) fieldErrors.city = "Enter the delivery city.";
    if (!/^[A-Z]{2}$/.test(input.country ?? "")) fieldErrors.country = "Use a two-letter country code.";
    if (Object.keys(fieldErrors).length) {
      return NextResponse.json({ error: "Check the checkout fields.", fields: fieldErrors }, { status: 400 });
    }

    const credential = await getOrCreateCartCredential();
    const accessToken = randomBytes(32).toString("hex");
    const order = await createCheckoutOrder(credential.tokenHash, hashCartToken(accessToken), input);
    await rotateCartCredential();
    return NextResponse.json(
      { order, accessToken, redirectUrl: `/orders/${order.orderNumber}?token=${accessToken}` },
      { status: 201, headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return storefrontCommerceError(error);
  }
}
