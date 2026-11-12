"use client";
// A live group chat. Same visual language as MessengerThread, but messages, games and Muse cards
// come from the server over SSE and every member's phone sees the same thing.
import { useLayoutEffect, useRef, useState } from "react";
import { act, me, useLive } from "@/lib/live";
import type { Chat, Game, LiveState, Message } from "@/lib/types";
import { audienceLabel } from "@/lib/world";
import { CameraIcon, ChevronLeft, GalleryIcon, PhoneIcon, PlusCircle, VideoIcon } from "../icons";
import { useNav } from "../nav";
import { GroupAvatar, Tap } from "../ui";
import { compact, first, full, MuseAvatar, Sparkle, useOverlay, Who } from "./bits";

const R = 18;
const r = 4;

const SUGGEST: Record<string, string[]> = {
  ramen: ["@muse make us a game where you catch ramen toppings and dodge jay's mid ratings"],
  taco: ["@muse make us a game about taco night"],
};

export function LiveThread({ chatId }: { chatId: string }) {
  const nav = useNav();
  const state = useLive();
  const scroller = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const [text, setText] = useState("");
  const c = state?.chats.find((x) => x.id === chatId);
  const n = c?.messages.length ?? 0;
  const typingKey = JSON.stringify(c?.typing ?? {});

  useLayoutEffect(() => {
    const el = scroller.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [n, typingKey, state?.rev]);

  if (!state || !c) return <div className="absolute inset-0 bg-white" />;
  const viewer = me();
  const isRequest = c.request && c.members[0] === viewer;
  const games = state.games.filter((g) => g.chatId === chatId);
  const chips = games.length ? (games.some((g) => g.status === "ready") && !c.request ? [`@muse add a hard mode`] : []) : c.request ? [] : SUGGEST[chatId] ?? ["@muse make us a game"];

  const sendText = (t: string) => {
    if (!t.trim()) return;
    stick.current = true;
    void act({ type: "send", chatId, author: viewer, text: t });
    setText("");
  };

  return (
    <div className="absolute inset-0 bg-white">
      <div
        ref={scroller}
        onScroll={(e) => {
          const el = e.currentTarget;
          stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        }}
        className="no-scrollbar h-full overflow-y-auto pb-[150px] pt-[112px]"
      >
        {isRequest && (
          <div className="mx-[16px] mb-[14px] rounded-[12px] bg-[#F0F2F5] px-[14px] py-[12px] text-center">
            <div className="text-[15px] font-semibold">Message request</div>
            <div className="mt-[2px] text-[13px] leading-[18px] text-fb-secondary">
              {c.title} made a game you play. You let game creators reach out; they can&apos;t see your profile details unless you reply.
            </div>
          </div>
        )}
        {c.messages.map((m, i) => (
          <Row key={m.id} m={m} prev={c.messages[i - 1]} next={c.messages[i + 1]} chat={c} state={state} />
        ))}
        {Object.entries(c.typing).map(([who, label]) => (
          <div key={who} className="mt-[10px] flex items-end pl-[12px]">
            <span className="mr-[8px]"><Who id={who} size={28} /></span>
            <span className="flex h-[36px] items-center gap-[8px] rounded-[18px] bg-msgr-in px-[14px]">
              <span className="flex gap-[4px]">
                {[0, 1, 2].map((d) => <span key={d} className="typing-dot h-[7px] w-[7px] rounded-full bg-[#64686C]" style={{ animationDelay: `${d * 160}ms` }} />)}
              </span>
              {who === "muse" && <span className="text-[13px] text-fb-secondary">Muse is {label}</span>}
            </span>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute inset-x-0 top-0 z-20 bg-white/85 backdrop-blur-xl backdrop-saturate-150">
        <header className="box-content flex h-[52px] items-center pl-[6px] pr-[12px] pt-[54px]">
          <Tap label="Back" onPress={nav.pop} className="grid h-[44px] w-[36px] place-items-center text-msgr-icon">
            <ChevronLeft size={26} />
          </Tap>
          <div className="flex min-w-0 flex-1 items-center">
            <GroupAvatar ids={c.members.filter((x) => x !== viewer).slice(0, 2)} size={36} />
            <span className="ml-[10px] min-w-0">
              <span className="block truncate text-[17px] font-semibold leading-[21px] text-black">{c.title}</span>
              <span className="block truncate text-[12px] leading-[15px] text-fb-secondary">
                {c.members.filter((x) => x !== viewer).map(first).join(", ")} · Muse
              </span>
            </span>
          </div>
          <div className="ml-[8px] flex items-center gap-[22px] text-msgr-icon">
            <Tap label="Audio call"><PhoneIcon size={25} /></Tap>
            <Tap label="Video call"><VideoIcon size={27} /></Tap>
          </div>
        </header>
        <div className="h-[0.5px] bg-[#E4E6EB]" />
      </div>

      {/* Composer */}
      <div className="absolute inset-x-0 bottom-0 z-20 bg-white/92 pb-[30px] backdrop-blur-xl">
        {chips.length > 0 && (
          <div className="no-scrollbar flex gap-[8px] overflow-x-auto px-[12px] pb-[4px] pt-[8px]">
            {chips.map((t) => (
              <Tap key={t} variant="soft" onPress={() => setText(t)} className="flex shrink-0 items-center gap-[5px] rounded-full bg-[#EBF5FF] px-[11px] py-[6px] text-[13px] font-medium text-[#0B3A80]">
                <Sparkle size={13} className="text-fb-blue" />
                <span className="max-w-[300px] truncate">{t}</span>
              </Tap>
            ))}
          </div>
        )}
        <form
          className="flex h-[52px] items-center pl-[14px] pr-[13px] text-msgr-icon"
          onSubmit={(e) => {
            e.preventDefault();
            sendText(text);
          }}
        >
          <div className="flex items-center gap-[18px]">
            <Tap label="More actions"><PlusCircle size={24} /></Tap>
            <Tap label="Camera"><CameraIcon size={24} /></Tap>
            <Tap label="Gallery"><GalleryIcon size={24} /></Tap>
          </div>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Aa · try @muse"
            className="ml-[12px] h-[36px] min-w-0 flex-1 rounded-full bg-msgr-fill px-[12px] text-[16px] text-black outline-none placeholder:text-fb-secondary"
          />
          <button type="submit" aria-label="Send" className="tap tap-icon ml-[10px] text-msgr-icon">
            <svg width="24" height="24" viewBox="0 0 24 24"><path d="M3.4 20.4l17.4-7.5a1 1 0 000-1.8L3.4 3.6a.9.9 0 00-1.2 1.1L4.5 11 14 12l-9.5 1-2.3 6.3a.9.9 0 001.2 1.1z" fill="currentColor" /></svg>
          </button>
        </form>
      </div>
    </div>
  );
}

// ---------- rows ----------

function Row({ m, prev, next, chat, state }: { m: Message; prev?: Message; next?: Message; chat: Chat; state: LiveState }) {
  const viewer = me();
  const gap = prev && m.ts - prev.ts > 3 * 3600_000;
  const sep = gap || !prev ? (
    <div className="pb-[8px] pt-[16px] text-center text-[12px] font-medium text-fb-secondary">
      {new Date(m.ts).toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" })}
    </div>
  ) : null;

  if (m.kind === "score") {
    const g = state.games.find((x) => x.id === m.gameId);
    return (
      <>
        {sep}
        <div className="flex justify-center px-[20px] py-[6px]">
          <span className="rounded-full bg-[#F0F2F5] px-[12px] py-[5px] text-[13px] text-fb-secondary">
            {g?.emoji} <b className="text-fb-text">{m.author === viewer ? "You" : first(m.author)}</b> scored <b className="text-fb-text">{(m.score ?? 0).toLocaleString()}</b> in {g?.title}
            {m.text === "new best" && " · new best 🏆"}
          </span>
        </div>
      </>
    );
  }

  if (m.kind !== "text") {
    return (
      <>
        {sep}
        <div className="flex items-end pl-[12px] pr-[20px] pt-[10px]">
          <div className="mr-[8px] w-[28px] shrink-0"><Who id={m.author} size={28} /></div>
          <div className="min-w-0 max-w-[310px] flex-1">
            <div className="pb-[3px] pl-[4px] text-[12px] text-fb-secondary">{m.author === "muse" ? "Muse" : m.author === viewer ? "You" : first(m.author)}</div>
            <Card m={m} chat={chat} state={state} />
          </div>
        </div>
      </>
    );
  }

  const mine = m.author === viewer;
  const same = (a?: Message, b?: Message) => !!a && !!b && a.author === b.author && a.kind === "text" && b.kind === "text" && b.ts - a.ts < 3 * 3600_000;
  const joinPrev = same(prev, m);
  const joinNext = same(m, next);
  const radius = mine ? `${R}px ${joinPrev ? r : R}px ${joinNext ? r : R}px ${R}px` : `${joinPrev ? r : R}px ${R}px ${R}px ${joinNext ? r : R}px`;
  return (
    <>
      {sep}
      {!mine && !joinPrev && <div className="pb-[3px] pl-[60px] pt-[6px] text-[12px] text-fb-secondary">{first(m.author)}</div>}
      <div className={`flex items-end ${mine ? "justify-end pr-[10px]" : "pl-[12px]"}`} style={{ marginTop: joinPrev ? 2 : 6 }}>
        {!mine && <div className="mr-[8px] w-[28px] shrink-0">{!joinNext && <Who id={m.author} size={28} />}</div>}
        <span className={`block max-w-[264px] px-[12px] py-[8px] text-[17px] leading-[22px] ${mine ? "bg-msgr-out text-white" : "bg-msgr-in text-black"}`} style={{ borderRadius: radius }}>
          <Mentions text={m.text ?? ""} mine={mine} />
        </span>
      </div>
    </>
  );
}

function Mentions({ text, mine }: { text: string; mine: boolean }) {
  return (
    <>
      {text.split(/(@muse\b)/i).map((part, i) =>
        /^@muse$/i.test(part) ? <b key={i} className={mine ? "text-white" : "text-fb-blue"}>{part}</b> : <span key={i}>{part}</span>,
      )}
    </>
  );
}

// ---------- cards ----------

function Card({ m, chat, state }: { m: Message; chat: Chat; state: LiveState }) {
  const g = m.gameId ? state.games.find((x) => x.id === m.gameId) : undefined;
  switch (m.kind) {
    case "muse":
      return <div className="rounded-[18px] bg-[#F2F4F7] px-[12px] py-[8px] text-[16px] leading-[21px]">{m.text}</div>;
    case "game":
      return g ? <GameCard g={g} m={m} chat={chat} state={state} /> : null;
    case "published":
      return <PublishedCard m={m} state={state} />;
    case "requests":
      return <RequestsCard m={m} state={state} />;
    case "fan":
      return <FanCard m={m} />;
    case "challenge":
      return <ChallengeCard m={m} state={state} />;
    default:
      return null;
  }
}

const shell = "overflow-hidden rounded-[16px] bg-white ring-1 ring-[#E4E6EB] shadow-[0_1px_2px_rgba(0,0,0,0.06)]";

function Btn({ children, onPress, primary, disabled }: { children: React.ReactNode; onPress?: () => void; primary?: boolean; disabled?: boolean }) {
  return (
    <Tap
      variant="soft"
      onPress={disabled ? () => {} : onPress}
      className={`flex h-[36px] flex-1 items-center justify-center gap-[5px] rounded-[8px] text-[15px] font-semibold ${disabled ? "bg-[#E4E6EB] text-[#8A8D91]" : primary ? "bg-fb-blue text-white" : "bg-[#E4E6EB] text-fb-text"}`}
    >
      {children}
    </Tap>
  );
}

function GameCard({ g, m, chat, state }: { g: Game; m: Message; chat: Chat; state: LiveState }) {
  const { open } = useOverlay();
  const latest = [...chat.messages].reverse().find((x) => x.kind === "game" && x.gameId === g.id)?.id === m.id;
  if (g.status === "building" || (g.status === "editing" && latest)) {
    return (
      <div className={`${shell} px-[14px] py-[14px]`}>
        <div className="flex items-center gap-[10px]">
          <span className="grid h-[44px] w-[44px] place-items-center rounded-[12px] bg-[#F0F2F5] text-[24px]">{g.status === "editing" ? g.emoji : "🎮"}</span>
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-semibold">{g.status === "editing" ? `Updating ${g.title}` : g.origin ? `Making ${g.origin.title} yours` : "Making your game"}</div>
            <div className="truncate text-[13px] text-fb-secondary">{g.phase}…</div>
          </div>
        </div>
        <div className="mt-[12px] h-[4px] overflow-hidden rounded-full bg-[#E4E6EB]">
          <div className="h-full w-1/3 animate-[slide_1.2s_ease-in-out_infinite] rounded-full bg-fb-blue" />
        </div>
      </div>
    );
  }
  if (g.status === "error") return <div className={`${shell} px-[14px] py-[12px] text-[15px] text-fb-secondary`}>Muse couldn&apos;t make this game. Try asking again.</div>;
  if (!latest) {
    return (
      <div className={`${shell} flex items-center gap-[8px] px-[12px] py-[8px] text-[14px] text-fb-secondary`}>
        <span className="text-[18px]">{g.emoji}</span> {g.title} · earlier version
      </div>
    );
  }
  const p = g.pubId ? state.pubs.find((x) => x.id === g.pubId) : undefined;
  const unpublished = !!p && g.publishedRev !== g.rev;
  const canPublish = !g.origin && chat.members.includes(me());
  return (
    <div className={shell}>
      <div className="flex items-center gap-[12px] px-[14px] pb-[10px] pt-[14px]" style={{ background: "linear-gradient(135deg,#FFF4E6,#FFE3E8 60%,#EBF0FF)" }}>
        <span className="grid h-[56px] w-[56px] place-items-center rounded-[14px] bg-white text-[32px] shadow-[0_1px_3px_rgba(0,0,0,0.12)]">{g.emoji}</span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[18px] font-bold leading-[22px]">{g.title}</div>
          <div className="text-[13px] leading-[17px] text-[#3A3B3C]">{g.tagline}</div>
          <div className="mt-[3px] text-[12px] text-fb-secondary">
            {p ? `v${p.versions.length} live on Facebook${unpublished ? " · new changes" : ""}` : g.origin ? `Your copy of ${g.origin.title} from ${g.origin.fromChat}` : "Only this chat can see it"}
          </div>
        </div>
      </div>
      {(g.origin?.changes.length ? g.origin.changes.map((c) => `${c.after}: ${c.why}`) : g.touches).length > 0 && (
        <div className="border-t border-[#E4E6EB] px-[14px] py-[9px]">
          <div className="mb-[5px] flex items-center gap-[5px] text-[12px] font-semibold text-fb-secondary">
            <Sparkle size={12} className="text-fb-blue" /> {g.origin ? "What Muse changed for this chat" : "Made from your chat"}
          </div>
          <ul className="space-y-[3px] text-[14px] leading-[19px]">
            {(g.origin?.changes.length ? g.origin.changes.map((c) => `${c.before} → ${c.after}`) : g.touches).slice(0, 4).map((t) => (
              <li key={t} className="flex gap-[6px]"><span className="text-fb-secondary">•</span>{t}</li>
            ))}
          </ul>
        </div>
      )}
      {g.edits.length > 0 && (
        <div className="border-t border-[#E4E6EB] px-[14px] py-[8px] text-[13px] text-fb-secondary">Latest change: {g.edits.at(-1)!.summary}</div>
      )}
      <div className="flex gap-[8px] border-t border-[#E4E6EB] px-[12px] py-[10px]">
        <Btn primary onPress={() => open({ kind: "play", title: g.title, gameId: g.id })}>▶ Play</Btn>
        {canPublish && (
          <Btn onPress={() => open({ kind: "publish", gameId: g.id })} disabled={!!p && !unpublished}>
            {!p ? "Publish" : unpublished ? `Publish v${p.versions.length + 1}` : `v${p.versions.length} published`}
          </Btn>
        )}
      </div>
      {g.best && <div className="px-[14px] pb-[10px] text-[12px] text-fb-secondary">Chat best: {first(g.best.by)} · {g.best.score.toLocaleString()}</div>}
    </div>
  );
}

function PublishedCard({ m, state }: { m: Message; state: LiveState }) {
  const nav = useNav();
  const p = state.pubs.find((x) => x.id === m.pubId);
  const v = p?.versions.find((x) => x.v === m.version);
  if (!p || !v) return null;
  return (
    <div className={shell}>
      <div className="px-[14px] pt-[12px]">
        <div className="text-[15px] leading-[20px]">
          <b>{m.author === me() ? "You" : first(m.author)}</b> published <b>{v.title} v{v.v}</b>
        </div>
        <div className="mt-[2px] text-[13px] text-fb-secondary">
          Visible to {audienceLabel(v.audience)} · this snapshot never changes
        </div>
        {v.notes.length > 0 && <div className="mt-[6px] text-[13px] text-[#3A3B3C]">New: {v.notes.join("; ")}</div>}
        <div className="mt-[10px] flex gap-[16px] text-[13px] text-fb-secondary">
          <span><b className="text-fb-text">{compact(v.plays.length)}</b> plays</span>
          <span><b className="text-fb-text">{v.comments.length}</b> comments</span>
          {v.v === 1 && p.imports.length > 0 && <span><b className="text-fb-text">{p.imports.length}</b> imported</span>}
        </div>
      </div>
      <div className="flex px-[12px] py-[10px]">
        <Btn onPress={() => nav.push({ screen: "game", pubId: p.id })}>View post</Btn>
      </div>
    </div>
  );
}

function RequestsCard({ m, state }: { m: Message; state: LiveState }) {
  const g = state.games.find((x) => x.id === m.gameId);
  const isCreatorChat = !!g && !g.origin;
  return (
    <div className={shell}>
      <div className="px-[14px] pt-[12px] text-[15px] leading-[20px]">{m.text}</div>
      <div className="px-[10px] pb-[8px] pt-[6px]">
        {m.requests?.map((rq) => (
          <div key={rq.label} className="flex items-center gap-[10px] rounded-[10px] px-[4px] py-[7px]">
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold">{rq.label}</div>
              <div className="text-[12px] text-fb-secondary">asked by {rq.count} player{rq.count === 1 ? "" : "s"}</div>
            </div>
            {rq.status === "added" ? (
              <span className="text-[14px] font-semibold text-[#1F7A35]">✓ Added</span>
            ) : rq.status === "adding" ? (
              <span className="text-[14px] text-fb-secondary">Adding…</span>
            ) : (
              <Tap variant="soft" onPress={() => void act({ type: "addRequest", msgId: m.id, label: rq.label, by: me() })} className="rounded-[8px] bg-[#EBF5FF] px-[12px] py-[6px] text-[14px] font-semibold text-fb-blue">
                {isCreatorChat ? "Add to next version" : "Add to ours"}
              </Tap>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function FanCard({ m }: { m: Message }) {
  const f = m.fan!;
  return (
    <div className={shell}>
      <div className="px-[14px] pt-[12px] text-[15px] leading-[20px]">{f.intro}</div>
      <div className="mx-[12px] mt-[10px] flex items-center gap-[10px] rounded-[12px] bg-[#F7F8FA] px-[10px] py-[9px]">
        <Who id={f.player} size={44} />
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold">{full(f.player)}</div>
          <div className="text-[13px] leading-[17px] text-fb-secondary">{f.why}</div>
        </div>
      </div>
      <div className="px-[14px] pt-[6px] text-[11px] leading-[15px] text-fb-secondary">
        {first(f.player)} turned on &quot;Let creators of games I play reach out&quot;. Muse only shares what&apos;s on this card.
      </div>
      {f.status === "open" ? (
        <div className="flex gap-[8px] px-[12px] py-[10px]">
          <Btn primary onPress={() => void act({ type: "fan", msgId: m.id, action: "challenge", by: me() })}>⚔️ Challenge</Btn>
          <Btn onPress={() => void act({ type: "fan", msgId: m.id, action: "hi", by: me() })}>👋 Say hi</Btn>
        </div>
      ) : (
        <div className="px-[14px] py-[10px] text-[14px] font-semibold text-[#1F7A35]">{f.status === "challenged" ? "✓ Challenge sent" : "✓ Said hi"}</div>
      )}
    </div>
  );
}

function ChallengeCard({ m, state }: { m: Message; state: LiveState }) {
  const { open } = useOverlay();
  const ch = m.challenge!;
  const p = state.pubs.find((x) => x.id === ch.pubId);
  const v = p?.versions.find((x) => x.v === ch.version);
  const isTarget = me() !== m.author && !state.chats.find((c) => c.id === ch.fromChat)?.members.includes(me());
  return (
    <div className={shell}>
      <div className="flex items-center gap-[12px] px-[14px] py-[12px]" style={{ background: "linear-gradient(135deg,#FFF4E6,#FFE3E8)" }}>
        <span className="text-[34px]">⚔️</span>
        <div>
          <div className="text-[16px] font-bold leading-[20px]">Beat {ch.target.toLocaleString()} in {v?.title}</div>
          <div className="text-[13px] text-[#3A3B3C]">Challenge from {state.chats.find((c) => c.id === ch.fromChat)?.title}</div>
        </div>
      </div>
      {ch.result !== undefined ? (
        <div className="px-[14px] py-[10px] text-[15px]">
          Result: <b>{ch.result.toLocaleString()}</b> {ch.result > ch.target ? "· you won 🏆" : "· so close"}
        </div>
      ) : isTarget ? (
        <div className="px-[12px] py-[10px]">
          <Btn primary onPress={() => {
            void act({ type: "acceptChallenge", msgId: m.id });
            open({ kind: "play", title: v?.title ?? "Game", pubId: ch.pubId, version: ch.version, challengeMsg: m.id });
          }}>Accept and play</Btn>
        </div>
      ) : (
        <div className="px-[14px] py-[10px] text-[14px] text-fb-secondary">Waiting for {first(state.chats.find((c) => c.id === m.chatId)?.members[0] ?? "")}…</div>
      )}
    </div>
  );
}

export { MuseAvatar };
