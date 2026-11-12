"use client";
import { CHATS, setMe } from "@/lib/data";
import { me } from "@/lib/live";
import { Director } from "./live/Director";
import { LiveThread } from "./live/LiveThread";
import { GamePage } from "./live/GamePost";
import { Overlays } from "./live/Sheets";
import { OverlayCtx, type Overlay } from "./live/bits";
import { useEffect, useState } from "react";
import { NavStack, type Route } from "./nav";
import { FacebookHome } from "./screens/FacebookHome";
import { MessengerInbox } from "./screens/MessengerInbox";
import { MessengerThread } from "./screens/MessengerThread";

const W = 393;
const H = 852;
const BEZEL = 14;

function StatusBar() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[80] flex h-[54px] items-center text-black">
      <div className="flex flex-1 justify-center pt-[4px]">
        <span className="text-[17px] font-semibold tracking-[-0.2px]">9:41</span>
      </div>
      <div className="w-[125px]" />
      <div className="flex flex-1 items-center justify-center gap-[6px] pr-[10px] pt-[4px]">
        <svg width="19" height="12" viewBox="0 0 19 12" aria-hidden>
          {[0, 1, 2, 3].map((i) => <rect key={i} x={i * 5.2} y={9 - i * 3} width="3.3" height={3 + i * 3} rx="1" fill="currentColor" />)}
        </svg>
        <svg width="17" height="12" viewBox="0 0 17 12" aria-hidden>
          <path d="M8.5 2.3c2.4 0 4.6.9 6.3 2.5l1.2-1.2A10.6 10.6 0 0 0 8.5.6 10.6 10.6 0 0 0 1 3.6l1.2 1.2a9 9 0 0 1 6.3-2.5z" fill="currentColor" />
          <path d="M8.5 5.6c1.5 0 2.9.6 4 1.6l1.2-1.2a7.3 7.3 0 0 0-10.4 0l1.2 1.2c1.1-1 2.5-1.6 4-1.6z" fill="currentColor" />
          <path d="M8.5 8.9c.6 0 1.2.2 1.6.6L8.5 11.2 6.9 9.5c.4-.4 1-.6 1.6-.6z" fill="currentColor" />
        </svg>
        <svg width="27" height="13" viewBox="0 0 27 13" aria-hidden>
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.8" fill="none" stroke="currentColor" opacity="0.35" />
          <rect x="2" y="2" width="20" height="9" rx="2.5" fill="currentColor" />
          <path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2z" fill="currentColor" opacity="0.4" />
        </svg>
      </div>
    </div>
  );
}

function initialStack(params: URLSearchParams): Route[] {
  const s: Route[] = [{ key: "home", screen: "home" }];
  const screen = params.get("screen");
  const chat = params.get("chat");
  const game = params.get("game");
  if (screen === "inbox" || screen === "thread" || chat) s.push({ key: "inbox", screen: "inbox" });
  if (chat) s.push({ key: `thread-${chat}`, screen: CHATS.some((c) => c.id === chat) ? "thread" : "live", chatId: chat });
  if (game) s.push({ key: `game-${game}`, screen: "game", pubId: game });
  return s;
}

export function Phone() {
  const [params, setParams] = useState<URLSearchParams | null>(null);
  const [scale, setScale] = useState(1);
  const [overlay, setOverlay] = useState<Overlay>(null);
  useEffect(() => {
    setMe(me());
    setParams(new URLSearchParams(window.location.search));
    const side = new URLSearchParams(window.location.search).get("director") === "1" ? 370 : 0; // room for the director panel
    const fit = () => setScale(Math.min(1.15, (window.innerHeight - 32) / (H + BEZEL * 2), (window.innerWidth - 32 - side) / (W + BEZEL * 2)));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  if (!params) return null;

  const shot = params.has("shot"); // bare 393x852 screen for Playwright captures
  const director = params.get("director") === "1";

  const screen = (
    <OverlayCtx.Provider value={{ open: setOverlay }}>
    <div data-screen-root className="relative overflow-hidden bg-white" style={{ width: W, height: H, borderRadius: shot ? 0 : 55 }}>
      <NavStack
        initial={initialStack(params)}
        render={(r) =>
          r.screen === "home" ? (
            <FacebookHome />
          ) : r.screen === "inbox" ? (
            <MessengerInbox />
          ) : r.screen === "live" ? (
            <LiveThread chatId={r.chatId!} />
          ) : r.screen === "game" ? (
            <GamePage pubId={r.pubId!} />
          ) : (
            <MessengerThread chatId={r.chatId!} />
          )
        }
      >
        <Overlays overlay={overlay} close={() => setOverlay(null)} />
        <StatusBar />
      </NavStack>
      {/* Dynamic Island + home indicator */}
      <div className="pointer-events-none absolute left-1/2 top-[11px] z-[90] h-[37px] w-[125px] -translate-x-1/2 rounded-full bg-black" />
      <div className="pointer-events-none absolute bottom-[8px] left-1/2 z-[90] h-[5px] w-[139px] -translate-x-1/2 rounded-full bg-black" />
    </div>
    </OverlayCtx.Provider>
  );

  if (shot) return screen;

  return (
    <div className="flex h-dvh w-full items-center justify-center gap-[24px] overflow-hidden bg-[#E9EBEE]">
      <div style={{ transform: `scale(${scale})`, transformOrigin: director ? "right center" : undefined }} className="relative">
        <div
          className="relative rounded-[69px] bg-[#1C1C1E] shadow-[0_0_0_2px_#3A3A3C,0_30px_80px_rgba(0,0,0,0.35)]"
          style={{ padding: BEZEL }}
        >
          {screen}
        </div>
        {/* side buttons */}
        <div className="absolute -left-[3px] top-[180px] h-[32px] w-[3px] rounded-l bg-[#2C2C2E]" />
        <div className="absolute -left-[3px] top-[240px] h-[62px] w-[3px] rounded-l bg-[#2C2C2E]" />
        <div className="absolute -left-[3px] top-[312px] h-[62px] w-[3px] rounded-l bg-[#2C2C2E]" />
        <div className="absolute -right-[3px] top-[260px] h-[96px] w-[3px] rounded-r bg-[#2C2C2E]" />
      </div>
      {director && <Director />}
    </div>
  );
}
