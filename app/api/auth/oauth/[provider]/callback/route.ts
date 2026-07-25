import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, writeSessionCookie } from "@/lib/auth";
import { getAppUrl } from "@/lib/env";
import {
  completeOAuthAuthentication,
  consumeOAuthTransaction,
  exchangeOAuthCode,
  isOAuthProvider,
  oauthErrorCode,
} from "@/lib/oauth";
import { requestIp } from "@/lib/request-security";

export const dynamic = "force-dynamic";

function signInErrorRedirect(code: string): NextResponse {
  const url = new URL("/sign-in", getAppUrl());
  url.searchParams.set("oauth_error", code);
  return NextResponse.redirect(url, 302);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider } = await context.params;
  if (!isOAuthProvider(provider)) return signInErrorRedirect("configuration");

  const transaction = await consumeOAuthTransaction(provider);
  if (!transaction) return signInErrorRedirect("invalid_state");

  const providerError = request.nextUrl.searchParams.get("error");
  if (providerError) return signInErrorRedirect("access_denied");

  const state = request.nextUrl.searchParams.get("state");
  const code = request.nextUrl.searchParams.get("code");
  if (!state || state !== transaction.state || !code) {
    return signInErrorRedirect("invalid_state");
  }

  try {
    if (transaction.mode === "link") {
      const currentUser = await getCurrentUser();
      if (!currentUser || currentUser.id !== transaction.linkUserId) {
        return signInErrorRedirect("invalid_state");
      }
    }

    const profile = await exchangeOAuthCode(provider, code, transaction);
    const result = await completeOAuthAuthentication({
      profile,
      userAgent: request.headers.get("user-agent"),
      ip: requestIp(request),
      linkUserId: transaction.mode === "link" ? transaction.linkUserId : null,
    });
    await writeSessionCookie(result.token, result.expiresAt);

    const destination = new URL(transaction.nextPath, getAppUrl());
    if (transaction.mode === "link") destination.searchParams.set("linked", provider);
    return NextResponse.redirect(destination, 302);
  } catch (error) {
    return signInErrorRedirect(oauthErrorCode(error));
  }
}
