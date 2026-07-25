import { NextRequest, NextResponse } from "next/server";
import { getStoreUrl } from "@bje/config";

export function assertStoreMutation(request: NextRequest): void {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    const error = new Error("Requests must use application/json.");
    error.name = "UnsupportedMediaTypeError";
    throw error;
  }

  const origin = request.headers.get("origin");
  if (!origin || new URL(origin).origin !== getStoreUrl()) {
    const error = new Error("The request origin is not allowed.");
    error.name = "InvalidOriginError";
    throw error;
  }
}

export function storefrontCommerceError(error: unknown): NextResponse {
  if (error instanceof Error) {
    if (error.name === "InvalidOriginError") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error.name === "UnsupportedMediaTypeError") {
      return NextResponse.json({ error: error.message }, { status: 415 });
    }
    if ([
      "CartValidationError",
      "CartUnavailableError",
      "CartExpiredError",
      "EmptyCartError",
      "ProductUnavailableError",
      "InventoryUnavailableError",
      "CartCurrencyError",
    ].includes(error.name)) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
  }
  console.error("Storefront commerce operation failed", error);
  return NextResponse.json({ error: "The commerce operation could not be completed." }, { status: 500 });
}

export function cleanString(value: unknown, maximum: number): string {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}
