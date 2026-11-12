"use client";
// Demo director beside the phone (?director=1): switch whose phone you're looking at and play scripted beats.
// Every beat still runs through the same server pipeline (and live Muse when a key is set).
import { act, me, useLive } from "@/lib/live";
import type { PersonaId } from "@/lib/types";
import { PERSONA_BLURB, PERSONAS } from "@/lib/world";
import { Who } from "./bits";

const STEPS = [
  "As Alex, open Messenger → the ramen council. Tap the suggestion chip and send it, or play beat 1.",
  "Play the game, then tap Publish. Review what Muse changed and the audience it picked. Publish v1.",
  "Switch to Dana (a stranger in Austin). The game is in her Feed. Play it and leave a comment.",
  "Play beat 2: a day of strangers playing and commenting.",
  "Back as Alex: Muse grouped the comments. Add hard mode, then publish it as v2 (v1 stays).",
  "Muse also suggests Dana as a fan. Challenge her, then switch to Dana to accept.",
  "Switch to Diego (taco tuesday). Import the game. Muse rebuilds it for his chat.",
  "Switch to Lena (Chicago): she can't see an Austin-only game.",
];

export function Director() {
  const state = useLive();
  const viewer = me();
  const go = (id: PersonaId) => {
    const u = new URL(window.location.href);
    u.searchParams.set("as", id);
    u.searchParams.delete("chat");
    u.searchParams.delete("game");
    window.location.href = u.toString();
  };
  const pub = state?.pubs[0];
  const status = state?.museOnline;
  return (
    <aside className="flex h-[min(852px,calc(100dvh-32px))] w-[330px] shrink-0 flex-col overflow-hidden rounded-[18px] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.12)]">
      <div className="border-b border-[#E4E6EB] px-[16px] py-[12px]">
        <div className="text-[17px] font-bold">Muse Arcade · demo</div>
        <div className="mt-[2px] flex items-center gap-[6px] text-[12px] text-fb-secondary">
          <span className={`h-[8px] w-[8px] rounded-full ${status === true ? "bg-[#31A24C]" : status === false ? "bg-[#F5A623]" : "bg-[#BCC0C4]"}`} />
          {status === true ? "Live Muse" : status === false ? "Muse unreachable: scripted fallback" : "Muse not called yet"}
        </div>
      </div>
      <div className="no-scrollbar flex-1 overflow-y-auto px-[16px] pb-[16px]">
        <h4 className="pb-[6px] pt-[14px] text-[12px] font-bold uppercase tracking-[0.6px] text-fb-secondary">Whose phone</h4>
        {(Object.keys(PERSONAS) as PersonaId[]).map((id) => (
          <button
            key={id}
            onClick={() => go(id)}
            className={`mb-[4px] flex w-full items-center gap-[10px] rounded-[10px] px-[8px] py-[7px] text-left ${id === viewer ? "bg-[#EBF5FF]" : "hover:bg-[#F0F2F5]"}`}
          >
            <Who id={id} size={32} />
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-semibold">{PERSONAS[id].name}</span>
              <span className="block text-[12px] text-fb-secondary">{PERSONA_BLURB[id]}</span>
            </span>
          </button>
        ))}

        <h4 className="pb-[6px] pt-[14px] text-[12px] font-bold uppercase tracking-[0.6px] text-fb-secondary">Beats</h4>
        <Beat
          n={1}
          label="Arun asks Muse for a game"
          onClick={() => act({ type: "send", chatId: "ramen", author: "arun", text: "@muse make us a game where you catch ramen toppings and dodge jay's mid ratings" })}
        />
        <Beat n={2} label="A day passes: strangers play and comment" disabled={!pub} onClick={() => act({ type: "simulateDay", pubId: pub?.id })} />
        <Beat n={3} label="Muse looks for fans again" disabled={!pub} onClick={() => act({ type: "fans", pubId: pub?.id })} />
        <button onClick={() => confirm("Reset the whole demo?") && act({ type: "reset" }).then(() => window.location.reload())} className="mt-[6px] w-full rounded-[8px] border border-[#E4E6EB] py-[7px] text-[13px] font-semibold text-[#C9302C]">
          Reset demo
        </button>

        <h4 className="pb-[6px] pt-[16px] text-[12px] font-bold uppercase tracking-[0.6px] text-fb-secondary">Run of show</h4>
        <ol className="list-decimal space-y-[6px] pl-[18px] text-[13px] leading-[18px] text-[#3A3B3C]">
          {STEPS.map((s) => <li key={s}>{s}</li>)}
        </ol>
      </div>
    </aside>
  );
}

function Beat({ n, label, onClick, disabled }: { n: number; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="mb-[6px] flex w-full items-center gap-[10px] rounded-[10px] bg-[#F0F2F5] px-[10px] py-[8px] text-left text-[14px] font-medium disabled:opacity-40"
    >
      <span className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full bg-fb-blue text-[12px] font-bold text-white">{n}</span>
      {label}
    </button>
  );
}
