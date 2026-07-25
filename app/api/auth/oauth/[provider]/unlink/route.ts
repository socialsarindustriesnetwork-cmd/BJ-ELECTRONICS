import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { unlinkOAuthProvider } from "@/lib/oauth-accounts";
import { isOAuthProvider } from "@/lib/oauth";
import { assertSameOrigin, requestIp } from "@/lib/request-security";

export async function POST(
  request: Request,
  context: { params: Promise<{ provider: string }> },
) {
  try {
    assertSameOrigin(request);
    const { provider } = await context.params;
    if (!isOAuthProvider(provider)) {
      return NextResponse.json({ error: "Unknown authentication provider." }, { status: 404 });
    }

    const user = await requireUser();
    await unlinkOAuthProvider({ userId: user.id, provider, ip: requestIp(request) });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.name === "LastAuthenticationMethodError") {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return apiError(error, "Unable to disconnect the provider.");
  }
}
