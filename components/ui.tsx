"use client";
import type { CSSProperties, ReactNode } from "react";
import { AvatarArt } from "./art";
import { person } from "@/lib/data";

/**
 * THE shared stub handler. Every control that is not the Messenger icon, an inbox row,
 * or a back button routes here: it gets the press animation (CSS .tap) and does nothing.
 */
export function stubPress() {
  /* intentionally no action */
}

type TapProps = {
  onPress?: () => void;
  label?: string;
  variant?: "icon" | "row" | "soft";
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};
export function Tap({ onPress, label, variant = "icon", className = "", style, children }: TapProps) {
  return (
    <button
      type="button"
      aria-label={label}
      data-stub={onPress ? undefined : ""}
      onClick={onPress ?? stubPress}
      className={`tap tap-${variant} ${className}`}
      style={style}
    >
      {children}
    </button>
  );
}

export function Avatar({
  id,
  size,
  active,
  ring,
  className = "",
}: {
  id: string;
  size: number;
  active?: boolean;
  ring?: string; // ring color around the avatar (story ring / white separator)
  className?: string;
}) {
  const p = person(id);
  const dot = Math.max(10, Math.round(size * 0.27));
  return (
    <span className={`relative inline-block shrink-0 ${className}`} style={{ width: size, height: size }}>
      <span
        className="block h-full w-full overflow-hidden rounded-full"
        style={ring ? { boxShadow: `0 0 0 ${size > 40 ? 3 : 2}px ${ring}` } : undefined}
      >
        <AvatarArt seed={p?.seed ?? 1} />
      </span>
      {active && (
        <span
          className="absolute rounded-full"
          style={{
            width: dot,
            height: dot,
            right: size > 50 ? 0 : -1,
            bottom: size > 50 ? 0 : -1,
            background: "var(--active)",
            boxShadow: `0 0 0 ${size > 40 ? 3 : 2}px #fff`,
          }}
        />
      )}
    </span>
  );
}

/** Messenger-style group icon: two overlapping member avatars. */
export function GroupAvatar({ ids, size, active }: { ids: string[]; size: number; active?: boolean }) {
  const s = Math.round(size * 0.7);
  const dot = Math.max(10, Math.round(size * 0.27));
  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      <span className="absolute right-0 top-0 overflow-hidden rounded-full" style={{ width: s, height: s }}>
        <AvatarArt seed={person(ids[1])?.seed ?? 2} />
      </span>
      <span
        className="absolute bottom-0 left-0 overflow-hidden rounded-full"
        style={{ width: s, height: s, boxShadow: `0 0 0 ${size > 40 ? 2.5 : 1.5}px #fff` }}
      >
        <AvatarArt seed={person(ids[0])?.seed ?? 3} />
      </span>
      {active && (
        <span
          className="absolute rounded-full"
          style={{ width: dot, height: dot, right: 0, bottom: 0, background: "var(--active)", boxShadow: "0 0 0 3px #fff" }}
        />
      )}
    </span>
  );
}

/** Empty, named slot rendered just under the thread header. Reserved for a future feature. */
export function PinnedCardSlot({ chatId }: { chatId: string }) {
  return <div data-slot="PinnedCardSlot" data-chat={chatId} />;
}
/** Empty, named slot rendered just above the thread composer. Reserved for a future feature. */
export function ComposerPlusMenuSlot({ chatId }: { chatId: string }) {
  return <div data-slot="ComposerPlusMenuSlot" data-chat={chatId} />;
}
