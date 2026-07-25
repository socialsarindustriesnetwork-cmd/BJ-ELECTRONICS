import { NextRequest, NextResponse } from "next/server";
import { archiveProduct, updateProduct } from "@bje/database";
import { assertJsonRequest, assertSameOrigin } from "@/lib/request-security";
import { commerceMutationError, requireCommerceApiUser } from "@admin/lib/admin-api";
import { productMutationSchema } from "@admin/lib/product-validation";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
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
    const { id } = await context.params;
    const product = await updateProduct(id, parsed.data, authorization.user.id);
    return NextResponse.json({ product });
  } catch (error) {
    return commerceMutationError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const authorization = await requireCommerceApiUser();
  if (authorization.response) return authorization.response;
  try {
    assertSameOrigin(request);
    const { id } = await context.params;
    await archiveProduct(id, authorization.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return commerceMutationError(error);
  }
}
