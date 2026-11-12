"use client";
import { createContext, useContext } from "react";
import { person } from "@/lib/data";
import type { LiveState } from "@/lib/types";
import { Avatar } from "../ui";

export function MuseAvatar({ size }: { size: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full text-white"
      style={{ width: size, height: size, background: "conic-gradient(from 210deg, #0866FF, #A033FF, #FF5C87, #FFB800, #0866FF)" }}
    >
      <Sparkle size={size * 0.55} />
    </span>
  );
}

export function Sparkle({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 2l2.2 6.2L20.5 10l-6.3 1.8L12 18l-2.2-6.2L3.5 10l6.3-1.8z" fill="currentColor" />
      <path d="M19 15l.9 2.3 2.1.7-2.1.7L19 21l-.9-2.3-2.1-.7 2.1-.7z" fill="currentColor" opacity=".8" />
    </svg>
  );
}

export function Who({ id, size }: { id: string; size: number }) {
  if (id === "muse") return <MuseAvatar size={size} />;
  return <Avatar id={id} size={size} />;
}

export const first = (id: string) => (id === "muse" ? "Muse" : person(id)?.first ?? id);
export const full = (id: string) => (id === "muse" ? "Muse" : person(id)?.name ?? id);

// ---------- overlays (sheets above the nav stack) ----------

export type Overlay =
  | { kind: "play"; title: string; gameId?: string; pubId?: string; version?: number; challengeMsg?: string }
  | { kind: "publish"; gameId: string }
  | { kind: "import"; pubId: string; version: number }
  | null;

export const OverlayCtx = createContext<{ open: (o: Overlay) => void }>({ open: () => {} });
export const useOverlay = () => useContext(OverlayCtx);

export function bestFor(state: LiveState, pubId: string, version: number, player: string) {
  const v = state.pubs.find((p) => p.id === pubId)?.versions.find((x) => x.v === version);
  return Math.max(0, ...(v?.plays.filter((x) => x.player === player).map((x) => x.score) ?? []));
}

export function leaderboard(plays: { player: string; score: number }[]) {
  const best = new Map<string, { score: number; plays: number }>();
  for (const p of plays) {
    const b = best.get(p.player) ?? { score: 0, plays: 0 };
    b.score = Math.max(b.score, p.score);
    b.plays++;
    best.set(p.player, b);
  }
  return [...best.entries()].map(([player, b]) => ({ player, ...b })).sort((a, b) => b.score - a.score);
}

export const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : String(n));
