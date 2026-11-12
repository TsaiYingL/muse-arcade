"use client";
// Runs a game Muse wrote. Sandbox: scripts only (no same-origin, so no cookies, storage or our API),
// plus a CSP that blocks all network. The game talks to us only through postMessage.
import { useEffect, useMemo, useRef } from "react";

const SHIM = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:">
<script>window.addEventListener("load",function(){parent.postMessage({type:"ready"},"*")});</script>`;

export function GameFrame({ html, player, best, onScore }: { html: string; player: string; best: number; onScore: (n: number) => void }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const doc = useMemo(() => SHIM + html, [html]);
  const latest = useRef({ player, best, onScore });
  latest.current = { player, best, onScore };

  useEffect(() => {
    const init = () => ref.current?.contentWindow?.postMessage({ type: "init", player: { name: latest.current.player }, best: latest.current.best }, "*");
    const onMsg = (e: MessageEvent) => {
      if (e.source !== ref.current?.contentWindow) return;
      const d = e.data as { type?: string; score?: number };
      if (d?.type === "ready") init();
      else if (d?.type === "score" && typeof d.score === "number" && Number.isFinite(d.score)) latest.current.onScore(d.score);
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  return <iframe ref={ref} sandbox="allow-scripts" srcDoc={doc} title="game" className="block h-full w-full border-0 bg-white" />;
}
