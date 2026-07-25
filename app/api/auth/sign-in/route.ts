import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-response";
import {
  assertRateLimit,
  createSession,
  recordAuditEvent,
  recordAuthAttempt,
  verifyPassword,
  writeSessionCookie,
} from "@/lib/auth";
import type { UserRole } from "@/lib/auth-types";
import { withTransaction } from "@/lib/db";
import { assertJsonRequest, assertSameOrigin, requestIp } from "@/lib/request-security";
import { flattenValidationError, signInSchema } from "@/lib/auth-validation";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  status: "ACTIVE" | "SUSPENDED";
};

export async function POST(request: Request) {
  let attemptedEmail: string | null = null;
  const ip = requestIp(request);

  try {
    assertSameOrigin(request);
    assertJsonRequest(request);
    const body: unknown = await request.json();
    const parsed = signInSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Check the highlighted fields.", fields: flattenValidationError(parsed.error) },
        { status: 400 },
      );
    }

    const { email, password, remember } = parsed.data;
    attemptedEmail = email;
    const userAgent = request.headers.get("user-agent");
    await assertRateLimit("SIGN_IN", email, ip);

    const result = await withTransaction(async (client) => {
      const users = await client.query<UserRecord>(
        `SELECT id, name, email, password_hash, role, status
         FROM auth_users
         WHERE LOWER(email) = LOWER($1)
         LIMIT 1`,
        [email],
      );
      const user = users.rows[0];
      const valid =
        user?.status === "ACTIVE" && (await verifyPassword(password, user.password_hash));

      if (!valid || !user) {
        const error = new Error("Invalid email or password.");
        error.name = "InvalidCredentialsError";
        throw error;
      }

      const session = await createSession(client, user.id, remember, { userAgent, ip });
      await client.query(
        "UPDATE auth_users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1",
        [user.id],
      );
      await recordAuditEvent(client, {
        actorUserId: user.id,
        action: "AUTH.SIGN_IN",
        targetType: "SESSION",
        targetId: user.id,
        metadata: { remember },
        ip,
      });

      return {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        ...session,
      };
    });

    await recordAuthAttempt("SIGN_IN", email, ip, true);
    await writeSessionCookie(result.token, result.expiresAt);
    return NextResponse.json({ user: result.user });
  } catch (error) {
    if (attemptedEmail) {
      await recordAuthAttempt("SIGN_IN", attemptedEmail, ip, false).catch(() => undefined);
    }
    if (error instanceof Error && error.name === "InvalidCredentialsError") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return apiError(error, "Unable to sign in.");
  }
}
