import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAppUrl } from "@/lib/env";
import {
  buildOAuthAuthorizationUrl,
  createOAuthTransaction,
  isOAuthProvider,
  oauthErrorCode,
  safeAdminNextPath,
  writeOAuthTransaction,
} from "@/lib/oauth";

export const dynamic = "force-dynamic";

function errorRedirect(code: string): NextResponse {
  const url = new URL("/sign-in", getAppUrl());
  url.searchParams.set("oauth_error", code);
  return NextResponse.redirect(url, 302);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> },
) {
  try {
    const { provider } = await context.params;
    if (!isOAuthProvider(provider)) return errorRedirect("configuration");

    const requestedMode = request.nextUrl.searchParams.get("mode");
    const mode = requestedMode === "link" ? "link" : "sign-in";
    const currentUser = mode === "link" ? await getCurrentUser() : null;
    if (mode === "link" && !currentUser) {
      const signIn = new URL("/sign-in", getAppUrl());
      signIn.searchParams.set("next", "/admin/security");
      return NextResponse.redirect(signIn, 302);
    }

    const transaction = createOAuthTransaction({
      provider,
      nextPath: safeAdminNextPath(request.nextUrl.searchParams.get("next")),
      mode,
      linkUserId: currentUser?.id ?? null,
    });
    await writeOAuthTransaction(transaction);

    return NextResponse.redirect(buildOAuthAuthorizationUrl(transaction), 302);
  } catch (error) {
    return errorRedirect(oauthErrorCode(error));
  }
}
