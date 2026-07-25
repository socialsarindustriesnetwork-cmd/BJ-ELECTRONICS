import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-response";
import { destroyCurrentSession } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/request-security";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await destroyCurrentSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, "Unable to sign out.");
  }
}
