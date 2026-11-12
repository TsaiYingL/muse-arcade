// Server-sent events: every phone gets the full live state whenever it changes.
import { S, subscribe } from "@/lib/server/store";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET(req: Request) {
  const enc = new TextEncoder();
  let unsub = () => {};
  let ping: ReturnType<typeof setInterval>;
  const stream = new ReadableStream({
    start(ctrl) {
      const send = (data: unknown) => {
        try { ctrl.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`)); } catch {}
      };
      send(S());
      unsub = subscribe(send) as unknown as () => void;
      ping = setInterval(() => { try { ctrl.enqueue(enc.encode(": ping\n\n")); } catch {} }, 15000);
      req.signal.addEventListener("abort", () => {
        unsub();
        clearInterval(ping);
        try { ctrl.close(); } catch {}
      });
    },
    cancel() {
      unsub();
      clearInterval(ping);
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" },
  });
}
