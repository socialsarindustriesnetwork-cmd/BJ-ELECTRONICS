import { createHash } from "node:crypto";
import { getAppUrl, getAuthSecret } from "@/lib/env";

export class RequestSecurityError extends Error {
  constructor(message: string, public readonly status = 403) {
    super(message);
    this.name = "RequestSecurityError";
  }
}

export function assertJsonRequest(request: Request): void {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new RequestSecurityError("JSON content type is required.", 415);
  }
}

export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (!origin) return;

  const allowedOrigins = new Set<string>();
  allowedOrigins.add(new URL(getAppUrl()).origin);
  allowedOrigins.add(new URL(request.url).origin);

  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost) {
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    allowedOrigins.add(`${protocol}://${forwardedHost}`);
  }

  let actual: string;
  try {
    actual = new URL(origin).origin;
  } catch {
    throw new RequestSecurityError("Invalid request origin.");
  }

  if (!allowedOrigins.has(actual)) {
    throw new RequestSecurityError("Cross-origin request blocked.");
  }
}

export function requestIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export function privacyHash(value: string): string {
  return createHash("sha256")
    .update(`${getAuthSecret()}:${value.trim().toLowerCase()}`)
    .digest("hex");
}
