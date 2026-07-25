import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth-types";

const commerceManagers = new Set<AuthUser["role"]>(["SUPER_ADMIN", "ADMIN", "MANAGER"]);

export async function requireCommerceApiUser(): Promise<
  { user: AuthUser; response?: never } | { user?: never; response: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user) {
    return { response: NextResponse.json({ error: "Authentication required." }, { status: 401 }) };
  }
  if (!commerceManagers.has(user.role)) {
    return { response: NextResponse.json({ error: "Insufficient permissions." }, { status: 403 }) };
  }
  return { user };
}

export function commerceMutationError(error: unknown): NextResponse {
  if (error instanceof Error) {
    if (["ProductNotFoundError", "OrderNotFoundError"].includes(error.name)) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (["ProductVersionConflictError", "OrderTransitionError"].includes(error.name)) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if ("code" in error && error.code === "23505") {
      return NextResponse.json(
        { error: "A record already uses one of these unique values." },
        { status: 409 },
      );
    }
  }
  console.error("Commerce mutation failed", error);
  return NextResponse.json({ error: "The commerce operation could not be completed." }, { status: 500 });
}
