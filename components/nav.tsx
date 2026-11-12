"use client";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

export type Route = { key: string; screen: "home" | "inbox" | "thread" | "live" | "game"; chatId?: string; pubId?: string };

const W = 393;
// iOS-like push: near-critically damped spring.
const SPRING = { type: "spring" as const, stiffness: 340, damping: 38, mass: 1 };

type Nav = { push: (r: Omit<Route, "key">) => void; pop: () => void; top: Route };
const NavCtx = createContext<Nav | null>(null);
export const useNav = () => useContext(NavCtx)!;

export function NavStack({
  initial,
  render,
  children,
}: {
  initial: Route[];
  render: (r: Route) => ReactNode;
  children?: ReactNode; // overlays that need nav state (status bar, dev overlay)
}) {
  const [stack, setStack] = useState<Route[]>(initial);
  const busy = useRef(false);
  const topX = useMotionValue(0);
  const underX = useTransform(topX, [0, W], [-W * 0.3, 0]);
  const dim = useTransform(topX, [0, W], [0.1, 0]);
  const shadowAlpha = useTransform(topX, [0, W * 0.98, W], [0.18, 0.06, 0]);
  const shadow = useTransform(shadowAlpha, (o) => `-6px 0 24px rgba(0,0,0,${o})`);

  const push = useCallback(
    (r: Omit<Route, "key">) => {
      if (busy.current) return;
      busy.current = true;
      topX.set(W);
      setStack((s) => [...s, { ...r, key: `${r.screen}-${r.chatId ?? r.pubId ?? ""}-${Date.now()}` }]);
      animate(topX, 0, SPRING).then(() => (busy.current = false));
    },
    [topX],
  );

  const finishPop = useCallback(
    (velocity = 0) => {
      busy.current = true;
      animate(topX, W, { ...SPRING, velocity }).then(() => {
        setStack((s) => s.slice(0, -1));
        topX.set(0);
        busy.current = false;
      });
    },
    [topX],
  );
  const pop = useCallback(() => {
    if (busy.current || stack.length < 2) return;
    finishPop();
  }, [finishPop, stack.length]);

  // Interactive edge-swipe back (like UINavigationController).
  const drag = useRef<{ x0: number; t: number; x: number; v: number } | null>(null);
  const onEdgeDown = (e: React.PointerEvent) => {
    if (busy.current || stack.length < 2) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    drag.current = { x0: e.clientX, t: performance.now(), x: 0, v: 0 };
  };
  const scale = () => {
    const el = document.querySelector("[data-screen-root]") as HTMLElement | null;
    return el ? el.getBoundingClientRect().width / W : 1;
  };
  const onEdgeMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const x = Math.max(0, (e.clientX - d.x0) / scale());
    const now = performance.now();
    d.v = ((x - d.x) / Math.max(1, now - d.t)) * 1000;
    d.x = x;
    d.t = now;
    topX.set(x);
  };
  const onEdgeUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.x > W * 0.35 || d.v > 500) finishPop(d.v);
    else animate(topX, 0, SPRING);
  };

  const top = stack[stack.length - 1];
  return (
    <NavCtx.Provider value={{ push, pop, top }}>
      {stack.map((r, i) => {
        const isTop = i === stack.length - 1;
        const isUnder = i === stack.length - 2;
        if (!isTop && !isUnder) return null;
        return (
          <motion.div
            key={r.key}
            className="absolute inset-0 overflow-hidden bg-white"
            style={{
              x: isTop ? topX : underX,
              zIndex: i,
              boxShadow: isTop && i > 0 ? shadow : undefined,
            }}
            aria-hidden={!isTop}
            inert={!isTop}
          >
            {render(r)}
            {isUnder && <motion.div className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: dim }} />}
            {isTop && i > 0 && (
              <div
                className="absolute bottom-0 left-0 top-0 z-[60] w-5 touch-none"
                onPointerDown={onEdgeDown}
                onPointerMove={onEdgeMove}
                onPointerUp={onEdgeUp}
                onPointerCancel={onEdgeUp}
              />
            )}
          </motion.div>
        );
      })}
      {children}
    </NavCtx.Provider>
  );
}
