import { withTransaction } from "@/lib/db";
import { recordAuditEvent } from "@/lib/auth";
import type { OAuthProvider } from "@/lib/oauth";

function providerDatabaseName(provider: OAuthProvider): "GOOGLE" | "FACEBOOK" {
  return provider === "google" ? "GOOGLE" : "FACEBOOK";
}

export type AuthenticationMethods = {
  password: boolean;
  google: boolean;
  facebook: boolean;
};

export async function getAuthenticationMethods(userId: string): Promise<AuthenticationMethods> {
  return withTransaction(async (client) => {
    const user = await client.query<{ password_hash: string | null }>(
      "SELECT password_hash FROM auth_users WHERE id = $1 LIMIT 1",
      [userId],
    );
    const accounts = await client.query<{ provider: "GOOGLE" | "FACEBOOK" }>(
      "SELECT provider FROM auth_accounts WHERE user_id = $1",
      [userId],
    );
    return {
      password: Boolean(user.rows[0]?.password_hash),
      google: accounts.rows.some((account) => account.provider === "GOOGLE"),
      facebook: accounts.rows.some((account) => account.provider === "FACEBOOK"),
    };
  });
}

export async function unlinkOAuthProvider(input: {
  userId: string;
  provider: OAuthProvider;
  ip: string;
}): Promise<void> {
  await withTransaction(async (client) => {
    const user = await client.query<{ password_hash: string | null; status: string }>(
      "SELECT password_hash, status FROM auth_users WHERE id = $1 LIMIT 1 FOR UPDATE",
      [input.userId],
    );
    if (!user.rows[0] || user.rows[0].status !== "ACTIVE") {
      const error = new Error("The account is unavailable.");
      error.name = "AccountUnavailableError";
      throw error;
    }

    const accounts = await client.query<{ id: string; provider: "GOOGLE" | "FACEBOOK" }>(
      "SELECT id, provider FROM auth_accounts WHERE user_id = $1 FOR UPDATE",
      [input.userId],
    );
    const targetProvider = providerDatabaseName(input.provider);
    const target = accounts.rows.find((account) => account.provider === targetProvider);
    if (!target) return;

    const hasAlternative =
      Boolean(user.rows[0].password_hash) ||
      accounts.rows.some((account) => account.provider !== targetProvider);
    if (!hasAlternative) {
      const error = new Error(
        "Add a password or connect another provider before removing your only sign-in method.",
      );
      error.name = "LastAuthenticationMethodError";
      throw error;
    }

    await client.query("DELETE FROM auth_accounts WHERE id = $1", [target.id]);
    await recordAuditEvent(client, {
      actorUserId: input.userId,
      action: "AUTH.PROVIDER_UNLINK",
      targetType: "AUTH_ACCOUNT",
      targetId: target.id,
      metadata: { provider: targetProvider },
      ip: input.ip,
    });
  });
}
