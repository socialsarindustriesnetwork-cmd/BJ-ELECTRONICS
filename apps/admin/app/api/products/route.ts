import { NextRequest, NextResponse } from "next/server";
import { createProduct, listAdminProducts } from "@bje/database";
import { assertJsonRequest, assertSameOrigin } from "@/lib/request-security";
import { commerceMutationError, requireCommerceApiUser } from "@admin/lib/admin-api";
import { productMutationSchema } from "@admin/lib/product-validation";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authorization = await requireCommerceApiUser();
  if (authorization.response) return authorization.response;
  const search = request.nextUrl.searchParams.get("q")?.slice(0, 120) ?? "";
  const products = await listAdminProducts({ search, limit: 200 });
  return NextResponse.json({ products }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const authorization = await requireCommerceApiUser();
  if (authorization.response) return authorization.response;
  try {
    assertSameOrigin(request);
    assertJsonRequest(request);
    const parsed = productMutationSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Check the product fields.", fields: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const product = await createProduct(parsed.data, authorization.user.id);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return commerceMutationError(error);
  }
}
