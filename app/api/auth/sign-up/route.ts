import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-response";
import {
  assertRateLimit,
  createRegisteredUser,
  recordAuthAttempt,
  writeSessionCookie,
} from "@/lib/auth";
import { isPublicSignupEnabled } from "@/lib/env";
import { assertJsonRequest, assertSameOrigin, requestIp } from "@/lib/request-security";
import { flattenValidationError, signUpSchema } from "@/lib/auth-validation";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    assertJsonRequest(request);
    if (!isPublicSignupEnabled()) {
      return NextResponse.json(
        { error: "Public account creation is currently disabled." },
        { status: 403 },
      );
    }

    const body: unknown = await request.json();
    const parsed = signUpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Check the highlighted fields.", fields: flattenValidationError(parsed.error) },
        { status: 400 },
      );
    }

    const ip = requestIp(request);
    const { name, email, password } = parsed.data;
    await assertRateLimit("SIGN_UP", email, ip, 6);

    try {
      const result = await createRegisteredUser({
        name,
        email,
        password,
        remember: true,
        userAgent: request.headers.get("user-agent"),
        ip,
      });
      await recordAuthAttempt("SIGN_UP", email, ip, true);
      await writeSessionCookie(result.token, result.expiresAt);
      return NextResponse.json({ user: result.user }, { status: 201 });
    } catch (error) {
      await recordAuthAttempt("SIGN_UP", email, ip, false).catch(() => undefined);
      throw error;
    }
  } catch (error) {
    if (error instanceof Error && error.name === "DuplicateAccountError") {
      return NextResponse.json(
        { error: error.message, fields: { email: error.message } },
        { status: 409 },
      );
    }
    return apiError(error, "Unable to create the account.");
  }
}
