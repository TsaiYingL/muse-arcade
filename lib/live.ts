"use client";
// Client side of the live state: one SSE connection per tab, shared by every component.
import { useSyncExternalStore } from "react";
import type { LiveState, PersonaId } from "./types";
import { PERSONAS } from "./world";

let state: LiveState | null = null;
const subs = new Set<() => void>();
let es: EventSource | null = null;

function connect() {
  if (es || typeof window === "undefined") return;
  es = new EventSource("/api/stream");
  es.onmessage = (e) => {
    state = JSON.parse(e.data) as LiveState;
    for (const s of subs) s();
  };
  es.onerror = () => {
    es?.close();
    es = null;
    setTimeout(connect, 1500);
  };
}

export function useLive(): LiveState | null {
  return useSyncExternalStore(
    (fn) => {
      subs.add(fn);
      connect();
      return () => subs.delete(fn);
    },
    () => state,
    () => null,
  );
}

export async function act(body: Record<string, unknown>) {
  await fetch("/api/action", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
}

let cachedMe: PersonaId | null = null;
export function me(): PersonaId {
  if (cachedMe) return cachedMe;
  if (typeof window === "undefined") return "alex";
  const as = new URLSearchParams(window.location.search).get("as") as PersonaId | null;
  cachedMe = as && as in PERSONAS ? as : "alex";
  return cachedMe;
}

export const fmtAgo = (ts: number) => {
  const s = Math.max(1, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return "now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d`;
};
