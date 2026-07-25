import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

const CART_COOKIE = "bje_cart";
const CART_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function hashCartToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function createToken(): string {
  return randomBytes(32).toString("hex");
}

function validToken(value: string | undefined): value is string {
  return Boolean(value && /^[a-f0-9]{64}$/.test(value));
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: CART_MAX_AGE_SECONDS,
  };
}

export async function getOrCreateCartCredential(): Promise<{ token: string; tokenHash: string }> {
  const jar = await cookies();
  const existing = jar.get(CART_COOKIE)?.value;
  const token = validToken(existing) ? existing : createToken();
  if (token !== existing) jar.set(CART_COOKIE, token, cookieOptions());
  return { token, tokenHash: hashCartToken(token) };
}

export async function rotateCartCredential(): Promise<{ token: string; tokenHash: string }> {
  const jar = await cookies();
  const token = createToken();
  jar.set(CART_COOKIE, token, cookieOptions());
  return { token, tokenHash: hashCartToken(token) };
}
