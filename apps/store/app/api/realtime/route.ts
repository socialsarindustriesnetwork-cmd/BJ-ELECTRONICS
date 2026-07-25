import { NextRequest } from "next/server";
import { getCommerceEvents } from "@bje/database";
import { encodeSseEvent, encodeSseHeartbeat } from "@bje/realtime";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  const headerCursor = Number(request.headers.get("last-event-id") ?? 0);
  const queryCursor = Number(request.nextUrl.searchParams.get("after") ?? 0);
  let cursor = Number.isFinite(headerCursor) && headerCursor > 0 ? headerCursor : queryCursor;
  if (!Number.isFinite(cursor) || cursor < 0) cursor = 0;

  const pollInterval = Math.min(
    Math.max(Number(process.env.REALTIME_POLL_INTERVAL_MS ?? 1500), 750),
    10_000,
  );
  let cancelled = false;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const abort = () => {
        cancelled = true;
        try { controller.close(); } catch { /* already closed */ }
      };
      request.signal.addEventListener("abort", abort, { once: true });

      void (async () => {
        controller.enqueue(encoder.encode(encodeSseHeartbeat()));
        while (!cancelled) {
          try {
            const events = await getCommerceEvents(cursor, 100);
            for (const event of events) {
              if (cancelled) break;
              cursor = event.id;
              controller.enqueue(encoder.encode(encodeSseEvent(event)));
            }
            if (!events.length) controller.enqueue(encoder.encode(encodeSseHeartbeat()));
          } catch {
            controller.enqueue(
              encoder.encode(`event: reconnect\ndata: ${JSON.stringify({ retry: pollInterval })}\n\n`),
            );
          }
          await wait(pollInterval);
        }
      })();
    },
    cancel() {
      cancelled = true;
    },
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
