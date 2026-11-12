"use client";
import { CHATS, NOTES, person } from "@/lib/data";
import {
  ChatsTabIcon, ComposeIcon, FacebookCircle, MenuIcon, MetaAIRing, StoriesTabIcon, VerifiedBadge, WaveIcon,
} from "../icons";
import { useNav } from "../nav";
import { Avatar, GroupAvatar, Tap } from "../ui";
import { fmtAgo, me, useLive } from "@/lib/live";
import type { LiveState, Message } from "@/lib/types";
import { first } from "../live/bits";

function preview(m: Message | undefined, state: LiveState) {
  if (!m) return "";
  const who = m.author === me() ? "You" : first(m.author);
  const g = state.games.find((x) => x.id === m.gameId);
  switch (m.kind) {
    case "text": return `${who}: ${m.text}`;
    case "game": return g?.status === "ready" ? `Muse made ${g.title} ${g.emoji}` : "Muse is making a game…";
    case "score": return `${who} scored ${m.score} in ${g?.title}`;
    case "published": return `${who} published a game`;
    case "challenge": return `${who} sent a challenge ⚔️`;
    case "fan": return "Muse: someone's been playing your game a lot";
    case "requests": return "Muse: players are asking for…";
    default: return `Muse: ${m.text ?? ""}`;
  }
}

export function MessengerInbox() {
  const nav = useNav();
  const state = useLive();
  const viewer = me();
  const live = (state?.chats ?? []).filter((c) => c.members.includes(viewer)).sort((a, b) => (b.messages.at(-1)?.ts ?? 0) - (a.messages.at(-1)?.ts ?? 0));
  const statics = viewer === "alex" ? CHATS : [];
  const unreadCount = statics.filter((c) => c.unread).length + live.filter((c) => c.request).length;
  return (
    <div className="absolute inset-0 bg-white">
      <div className="no-scrollbar h-full overflow-y-auto pb-[90px] pt-[54px]">
        {/* Header */}
        <header className="flex h-[44px] items-center pl-4 pr-[16px]">
          <span className="wordmark text-[28px] text-fb-blue" style={{ letterSpacing: "-0.9px" }}>messenger</span>
          <div className="ml-auto flex items-center gap-[20px] text-black">
            <Tap label="New message"><ComposeIcon size={25} /></Tap>
            {/* Goes back to the Facebook app: acts as this screen's back button. */}
            <Tap label="Facebook" onPress={nav.pop}><FacebookCircle size={26} /></Tap>
          </div>
        </header>

        {/* Search */}
        <Tap
          variant="soft"
          className="mx-4 mt-[6px] flex h-[40px] w-[calc(100%-32px)] items-center rounded-full bg-msgr-fill pl-[10px] pr-[12px] text-left"
        >
          <MetaAIRing size={22} />
          <span className="ml-[8px] flex-1 text-[17px] text-fb-secondary">Ask Meta AI or Search</span>
          <span className="text-fb-secondary"><WaveIcon size={20} /></span>
        </Tap>

        {/* Notes */}
        <div className="no-scrollbar flex overflow-x-auto px-[6px] pb-[4px] pt-[4px]">
          {NOTES.map((n) => {
            const p = person(n.id);
            const mine = n.id === "me";
            return (
              <Tap key={n.id} variant="soft" className="relative flex w-[88px] shrink-0 flex-col items-center">
                <div className="flex h-[30px] w-full items-end justify-center">
                  {n.note && (
                    <div className="relative z-10 -mb-[18px] max-w-[84px] rounded-[14px] bg-white px-[8px] py-[5px] text-center shadow-[0_1px_4px_rgba(0,0,0,0.16)]">
                      <span
                        className={`line-clamp-2 text-[12px] leading-[14px] ${mine ? "text-fb-secondary" : "text-fb-text"}`}
                      >
                        {n.note}
                      </span>
                      <span className="absolute -bottom-[5px] left-[14px] h-[7px] w-[7px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.12)]" />
                    </div>
                  )}
                </div>
                <Avatar id={n.id} size={68} active={!mine && p.active} />
                <span className="mt-[6px] w-full truncate text-center text-[13px] leading-[16px] text-fb-secondary">
                  {mine ? "Create note" : p.first}
                </span>
              </Tap>
            );
          })}
        </div>

        {/* Chat list */}
        <ul className="pt-[4px]">
          {state && live.map((c) => {
            const last = c.messages.at(-1);
            const others = c.members.filter((x) => x !== viewer);
            return (
              <li key={c.id}>
                <Tap variant="row" onPress={() => nav.push({ screen: "live", chatId: c.id })} className="flex h-[76px] w-full items-center pl-4 pr-[20px] text-left">
                  <GroupAvatar ids={others.slice(0, 2)} size={60} active />
                  <div className="ml-[12px] min-w-0 flex-1">
                    <div className="flex items-center gap-[6px] text-[17px] font-semibold leading-[22px] text-fb-text">
                      <span className="truncate">{c.title}</span>
                      {c.request && <span className="shrink-0 rounded-[4px] bg-[#F0F2F5] px-[5px] text-[11px] font-semibold text-fb-secondary">Request</span>}
                    </div>
                    <div className="flex text-[15px] leading-[20px] text-fb-secondary">
                      <span className="truncate">{preview(last, state)}</span>
                      {last && <span className="shrink-0 whitespace-pre"> · {fmtAgo(last.ts)}</span>}
                    </div>
                  </div>
                </Tap>
              </li>
            );
          })}
          {statics.map((c) => {
            const anyActive = c.members.some((m) => person(m).active);
            return (
              <li key={c.id}>
                <Tap
                  variant="row"
                  onPress={() => nav.push({ screen: "thread", chatId: c.id })}
                  className="flex h-[76px] w-full items-center pl-4 pr-[20px] text-left"
                >
                  {c.kind === "group" ? (
                    <GroupAvatar ids={c.members} size={60} active={anyActive} />
                  ) : (
                    <Avatar id={c.members[0]} size={60} active={anyActive} />
                  )}
                  <div className="ml-[12px] min-w-0 flex-1">
                    <div className={`flex items-center gap-[4px] text-[17px] leading-[22px] text-fb-text ${c.unread ? "font-semibold" : ""}`}>
                      <span className="truncate">{c.name}</span>
                      {c.verified && <VerifiedBadge size={16} />}
                    </div>
                    <div className={`flex text-[15px] leading-[20px] ${c.unread ? "font-semibold text-fb-text" : "text-fb-secondary"}`}>
                      <span className="truncate">{c.preview}</span>
                      <span className="shrink-0 whitespace-pre"> · {c.time}</span>
                    </div>
                  </div>
                  {c.unread && <span className="ml-[10px] h-[10px] w-[10px] shrink-0 rounded-full bg-fb-blue" />}
                </Tap>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Tab bar: Chats · Stories · Menu */}
      <nav className="absolute inset-x-0 bottom-0 z-10 h-[84px] border-t-[0.5px] border-[#E4E6EB] bg-white/95 backdrop-blur-xl">
        <div className="grid grid-cols-3">
          {[
            { label: "Chats", icon: <ChatsTabIcon size={27} />, sel: true, badge: unreadCount },
            { label: "Stories", icon: <StoriesTabIcon size={26} /> },
            { label: "Menu", icon: <MenuIcon size={27} /> },
          ].map((t) => (
            <Tap
              key={t.label}
              variant="soft"
              className={`flex h-[50px] flex-col items-center justify-end ${t.sel ? "text-fb-blue" : "text-[#65686C]"}`}
            >
              <span className="relative grid h-[28px] place-items-center">
                {t.icon}
                {!!t.badge && (
                  <span className="absolute -right-[10px] -top-[4px] grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#DD2334] px-[5px] text-[11px] font-bold text-white ring-2 ring-white">
                    {t.badge}
                  </span>
                )}
              </span>
              <span className="mt-[2px] text-[11px] font-medium leading-[13px]">{t.label}</span>
            </Tap>
          ))}
        </div>
      </nav>
    </div>
  );
}
