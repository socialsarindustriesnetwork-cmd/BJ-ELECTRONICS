import { NextRequest } from "next/server";
import { getCommerceEvents } from "@bje/database";
import { encodeSseEvent, encodeSseHeartbeat } from "@bje/realtime";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export async function GET(request: NextRequest) {
  if (!(await getCurrentUser())) return new Response("Authentication required", { status: 401 });

  const encoder = new TextEncoder();
  let cursor = Number(request.headers.get("last-event-id") ?? request.nextUrl.searchParams.get("after") ?? 0);
  if (!Number.isFinite(cursor) || cursor < 0) cursor = 0;
  let cancelled = false;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      request.signal.addEventListener("abort", () => {
        cancelled = true;
        try { controller.close(); } catch { /* already closed */ }
      }, { once: true });
      void (async () => {
        controller.enqueue(encoder.encode(encodeSseHeartbeat()));
        while (!cancelled) {
          try {
            const events = await getCommerceEvents(cursor, 100);
            for (const event of events) {
              cursor = event.id;
              controller.enqueue(encoder.encode(encodeSseEvent(event)));
            }
            if (!events.length) controller.enqueue(encoder.encode(encodeSseHeartbeat()));
          } catch {
            controller.enqueue(encoder.encode("event: reconnect\ndata: {}\n\n"));
          }
          await wait(1500);
        }
      })();
    },
    cancel() { cancelled = true; },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
