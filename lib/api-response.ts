import { NextResponse } from "next/server";
import { ConfigurationError } from "@/lib/env";
import { RequestSecurityError } from "@/lib/request-security";

export function apiError(error: unknown, fallback = "Unable to complete the request.") {
  if (error instanceof RequestSecurityError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof ConfigurationError) {
    console.error(error);
    return NextResponse.json(
      { error: "Authentication service is not configured." },
      { status: 503 },
    );
  }
  if (error instanceof Error && error.name === "RateLimitError") {
    return NextResponse.json({ error: error.message }, { status: 429 });
  }
  console.error(error);
  return NextResponse.json({ error: fallback }, { status: 500 });
}
