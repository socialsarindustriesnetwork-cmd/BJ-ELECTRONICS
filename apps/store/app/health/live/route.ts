import { NextResponse } from "next/server";
import { getStoreLiveness } from "@/lib/health";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(getStoreLiveness(), {
    status: 200,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
