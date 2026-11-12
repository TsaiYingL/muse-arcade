"use client";
// A published game as Facebook sees it: the Feed card, and the full post page with versions,
// leaderboard, comments, what players are asking for, and import.
import { useState } from "react";
import { act, fmtAgo, me, useLive } from "@/lib/live";
import type { LiveState, Published } from "@/lib/types";
import { audienceLabel, canSee, PERSONAS } from "@/lib/world";
import { ChevronLeft, CommentOutline, MoreIcon, ShareOutline } from "../icons";
import { useNav } from "../nav";
import { GroupAvatar, Tap } from "../ui";
import { compact, first, full, leaderboard, Sparkle, useOverlay, Who } from "./bits";

export function visiblePubs(state: LiveState) {
  const p = PERSONAS[me()];
  return state.pubs
    .map((pub) => {
      const c = state.chats.find((x) => x.id === pub.chatId)!;
      const versions = pub.versions.filter((v) => canSee(p, v.audience, pub.chatId, c.members));
      return versions.length ? { pub, versions, chat: c } : null;
    })
    .filter((x): x is NonNullable<typeof x> => !!x)
    .reverse();
}

function Hero({ emoji, title, onPlay, hard }: { emoji: string; title: string; onPlay: () => void; hard?: boolean }) {
  return (
    <div className="relative flex h-[230px] w-full flex-col items-center justify-center overflow-hidden" style={{ background: "linear-gradient(160deg,#FFF4E6 0%,#FFE0C2 55%,#FFD1DC 100%)" }}>
      <div className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: "radial-gradient(circle at 20% 25%,#fff 0 6px,transparent 7px),radial-gradient(circle at 80% 70%,#fff 0 5px,transparent 6px),radial-gradient(circle at 70% 20%,#fff 0 4px,transparent 5px)" }} />
      {hard && <span className="absolute left-[12px] top-[12px] rounded-[6px] bg-black px-[8px] py-[3px] text-[11px] font-extrabold tracking-[1px] text-white">HARD MODE</span>}
      <div className="text-[72px] leading-none drop-shadow-sm">{emoji}</div>
      <div className="mt-[6px] text-[24px] font-extrabold tracking-[-0.4px] text-[#050505]">{title}</div>
      <Tap variant="soft" onPress={onPlay} className="mt-[12px] flex items-center gap-[6px] rounded-full bg-[#050505] px-[22px] py-[9px] text-[15px] font-bold text-white">
        ▶ Play now
      </Tap>
    </div>
  );
}

export function FeedGameCard({ pub, versions, chat }: { pub: Published; versions: Published["versions"]; chat: LiveState["chats"][number] }) {
  const nav = useNav();
  const { open } = useOverlay();
  const v = versions.at(-1)!;
  const allPlays = versions.flatMap((x) => x.plays);
  const lb = leaderboard(v.plays).slice(0, 3);
  const comments = versions.reduce((n, x) => n + x.comments.length, 0);
  const isNew = versions.length > 1 && Date.now() - v.publishedAt < 6 * 3600_000;
  return (
    <article className="pb-[2px]">
      <div className="flex items-center gap-[10px] px-4 pt-[12px]">
        <GroupAvatar ids={chat.members.slice(1, 3)} size={40} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-semibold leading-[20px] text-fb-text">{chat.title}</div>
          <div className="flex items-center gap-[4px] text-[13px] leading-[17px] text-fb-secondary">
            {fmtAgo(v.publishedAt)} · {audienceLabel(v.audience)} · <Sparkle size={11} className="text-fb-blue" /> Made with Muse
          </div>
        </div>
        <Tap label="More" className="text-fb-secondary"><MoreIcon size={20} /></Tap>
      </div>
      <p className="px-4 pb-[10px] pt-[8px] text-[15px] leading-[20px] text-fb-text">
        {isNew && <span className="mr-[6px] rounded-[4px] bg-fb-blue px-[5px] py-[1px] text-[11px] font-bold text-white">NEW v{v.v}</span>}
        {v.description}
      </p>
      <Hero emoji={pub.emoji} title={v.title} hard={/hard/i.test(v.notes.join(" ") + v.description)} onPlay={() => open({ kind: "play", title: v.title, pubId: pub.id, version: v.v })} />
      <Tap variant="soft" onPress={() => nav.push({ screen: "game", pubId: pub.id })} className="flex w-full items-center gap-[8px] px-4 pt-[10px] text-left text-[13px] text-fb-secondary">
        {lb.length > 0 ? (
          <>
            <span className="flex">{lb.map((x, i) => <span key={x.player} className="-ml-[6px] rounded-full ring-2 ring-white first:ml-0" style={{ zIndex: 3 - i }}><Who id={x.player} size={22} /></span>)}</span>
            <span className="min-w-0 flex-1 truncate">🏆 {lb[0].player === me() ? "You lead" : `${first(lb[0].player)} leads`} with {lb[0].score.toLocaleString()}</span>
          </>
        ) : (
          <span className="flex-1">Be the first to set a score</span>
        )}
        <span>{compact(allPlays.length)} plays · {comments} comments</span>
      </Tap>
      {versions.length > 1 && (
        <div className="flex gap-[6px] px-4 pt-[8px]">
          {[...versions].reverse().map((x) => (
            <Tap key={x.v} variant="soft" onPress={() => open({ kind: "play", title: x.title, pubId: pub.id, version: x.v })} className="rounded-full bg-[#F0F2F5] px-[10px] py-[4px] text-[12px] font-semibold text-fb-text">
              Play v{x.v}
            </Tap>
          ))}
        </div>
      )}
      <div className="mt-[8px] flex items-center border-t border-[#E4E6EB] px-4 py-[6px] text-[15px] font-medium text-fb-secondary">
        <Tap variant="soft" onPress={() => open({ kind: "play", title: v.title, pubId: pub.id, version: v.v })} className="flex flex-1 items-center justify-center gap-[6px] py-[4px]">▶ Play</Tap>
        <Tap variant="soft" onPress={() => nav.push({ screen: "game", pubId: pub.id })} className="flex flex-1 items-center justify-center gap-[6px] py-[4px]"><CommentOutline size={20} />Comment</Tap>
        {!chat.members.includes(me()) && (
          <Tap variant="soft" onPress={() => open({ kind: "import", pubId: pub.id, version: v.v })} className="flex flex-1 items-center justify-center gap-[6px] py-[4px]"><ShareOutline size={20} />Import</Tap>
        )}
      </div>
      <div className="h-[4px] bg-fb-band" />
    </article>
  );
}

export function GamePage({ pubId }: { pubId: string }) {
  const nav = useNav();
  const state = useLive();
  const { open } = useOverlay();
  const [sel, setSel] = useState<number | null>(null);
  const [text, setText] = useState("");
  if (!state) return <div className="absolute inset-0 bg-white" />;
  const vis = visiblePubs(state).find((x) => x.pub.id === pubId);
  const pub = state.pubs.find((x) => x.id === pubId);
  const chat = pub && state.chats.find((c) => c.id === pub.chatId);
  if (!pub || !chat) return <div className="absolute inset-0 bg-white" />;
  const versions = vis?.versions ?? pub.versions;
  const v = versions.find((x) => x.v === sel) ?? versions.at(-1)!;
  const lb = leaderboard(v.plays);
  const viewer = me();
  const creator = chat.members.includes(viewer);
  const player = state.players.find((p) => p.id === viewer);

  return (
    <div className="absolute inset-0 bg-white">
      <div className="no-scrollbar h-full overflow-y-auto pb-[100px] pt-[98px]">
        <Hero emoji={pub.emoji} title={v.title} hard={/hard/i.test(v.notes.join(" ") + v.description)} onPlay={() => open({ kind: "play", title: v.title, pubId: pub.id, version: v.v })} />

        {/* versions */}
        <div className="flex items-center gap-[6px] px-4 pt-[12px]">
          {[...versions].reverse().map((x) => (
            <Tap key={x.v} variant="soft" onPress={() => setSel(x.v)} className={`rounded-full px-[12px] py-[5px] text-[13px] font-semibold ${x.v === v.v ? "bg-fb-blue text-white" : "bg-[#F0F2F5] text-fb-text"}`}>
              v{x.v}{x.v === versions.at(-1)!.v ? " · latest" : ""}
            </Tap>
          ))}
          <span className="ml-auto text-[12px] text-fb-secondary">published {fmtAgo(v.publishedAt) === "now" ? "just now" : `${fmtAgo(v.publishedAt)} ago`} · never changes</span>
        </div>

        <div className="px-4 pt-[10px]">
          <div className="text-[15px] leading-[20px]">{v.description}</div>
          {v.notes.length > 0 && (
            <div className="mt-[8px] rounded-[10px] bg-[#F7F8FA] px-[12px] py-[8px] text-[13px] leading-[18px]">
              <b>What&apos;s new in v{v.v}</b>
              {v.notes.map((n) => <div key={n}>• {n}</div>)}
            </div>
          )}
          <div className="mt-[8px] text-[13px] text-fb-secondary">
            By <b className="text-fb-text">{chat.title}</b> · {audienceLabel(v.audience)}
            {pub.imports.length > 0 && <> · imported into {pub.imports.length} chat{pub.imports.length > 1 ? "s" : ""}</>}
          </div>
        </div>

        <div className="flex gap-[8px] px-4 pt-[12px]">
          <Tap variant="soft" onPress={() => open({ kind: "play", title: v.title, pubId: pub.id, version: v.v })} className="flex h-[38px] flex-1 items-center justify-center rounded-[8px] bg-fb-blue text-[15px] font-semibold text-white">▶ Play v{v.v}</Tap>
          {!creator && (
            <Tap variant="soft" onPress={() => open({ kind: "import", pubId: pub.id, version: v.v })} className="flex h-[38px] flex-1 items-center justify-center rounded-[8px] bg-[#E4E6EB] text-[15px] font-semibold">Import to a chat</Tap>
          )}
        </div>
        {creator && <div className="px-4 pt-[6px] text-[12px] text-fb-secondary">Only your chat can publish new versions. Earlier versions stay exactly as they were.</div>}

        {/* what players want */}
        {(pub.requests.length > 0 || pub.requestsStatus === "reading") && (
          <div className="mx-4 mt-[14px] rounded-[12px] bg-[#EBF5FF] px-[12px] py-[10px]">
            <div className="flex items-center gap-[6px] text-[14px] font-bold text-[#0B3A80]">
              <Sparkle size={14} className="text-fb-blue" /> What players are asking for
              {pub.requestsStatus === "reading" && <span className="font-normal text-fb-secondary">· reading comments…</span>}
            </div>
            {pub.requests.map((r) => (
              <div key={r.label} className="mt-[6px] text-[14px] leading-[19px]">
                <b>{r.label}</b> <span className="text-fb-secondary">· {r.count} players</span>
                <div className="text-[13px] italic text-fb-secondary">&ldquo;{r.quote}&rdquo;</div>
              </div>
            ))}
            {!creator && pub.requests.length > 0 && <div className="mt-[6px] text-[12px] text-[#0B3A80]">Import a copy and Muse will offer to add these to it.</div>}
          </div>
        )}

        {/* leaderboard */}
        <h3 className="px-4 pb-[6px] pt-[16px] text-[17px] font-bold">Leaderboard · v{v.v}</h3>
        {lb.length === 0 && <div className="px-4 text-[14px] text-fb-secondary">No scores yet.</div>}
        {lb.slice(0, 5).map((x, i) => (
          <div key={x.player} className={`flex items-center gap-[10px] px-4 py-[6px] ${x.player === viewer ? "bg-[#EBF5FF]" : ""}`}>
            <span className="w-[18px] text-center text-[15px] font-bold text-fb-secondary">{i + 1}</span>
            <Who id={x.player} size={32} />
            <span className="flex-1 text-[15px] font-medium">{x.player === viewer ? "You" : full(x.player)}<span className="ml-[6px] text-[12px] text-fb-secondary">{x.plays} plays</span></span>
            <span className="text-[15px] font-bold">{x.score.toLocaleString()}</span>
          </div>
        ))}

        {!creator && player && (
          <Tap variant="row" onPress={() => void act({ type: "optIn", player: viewer })} className="mx-4 mt-[12px] flex w-[calc(100%-32px)] items-center gap-[10px] rounded-[10px] bg-[#F7F8FA] px-[12px] py-[10px] text-left">
            <span className="flex-1 text-[13px] leading-[17px]">
              <b className="text-[14px]">Let creators of games I play reach out</b>
              <br />
              <span className="text-fb-secondary">Muse may suggest you to a game&apos;s creators. They only see your name, city and stats for that game.</span>
            </span>
            <span className={`relative h-[26px] w-[44px] shrink-0 rounded-full transition-colors ${player.optIn ? "bg-[#31A24C]" : "bg-[#BCC0C4]"}`}>
              <span className={`absolute top-[3px] h-[20px] w-[20px] rounded-full bg-white shadow transition-all ${player.optIn ? "left-[21px]" : "left-[3px]"}`} />
            </span>
          </Tap>
        )}

        {/* comments */}
        <h3 className="px-4 pb-[4px] pt-[18px] text-[17px] font-bold">Comments · v{v.v}</h3>
        {v.comments.length === 0 && <div className="px-4 text-[14px] text-fb-secondary">No comments yet. Tell the creators what you want next.</div>}
        {[...v.comments].reverse().map((c) => (
          <div key={c.id} className="flex gap-[8px] px-4 py-[5px]">
            <Who id={c.author} size={32} />
            <div className="min-w-0">
              <div className="rounded-[16px] bg-[#F0F2F5] px-[12px] py-[7px]">
                <div className="text-[13px] font-semibold">{c.author === viewer ? "You" : full(c.author)}</div>
                <div className="text-[15px] leading-[20px]">{c.text}</div>
              </div>
              <div className="pl-[12px] pt-[2px] text-[12px] text-fb-secondary">{fmtAgo(c.ts)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* header */}
      <div className="absolute inset-x-0 top-0 z-20 border-b border-[#E4E6EB] bg-white">
        <header className="box-content flex h-[44px] items-center pl-[6px] pr-[12px] pt-[54px]">
          <Tap label="Back" onPress={nav.pop} className="grid h-[44px] w-[36px] place-items-center text-fb-text"><ChevronLeft size={26} /></Tap>
          <div className="min-w-0 flex-1 text-center text-[17px] font-semibold">{v.title}</div>
          <span className="w-[36px]" />
        </header>
      </div>

      {/* comment composer */}
      <form
        className="absolute inset-x-0 bottom-0 z-20 flex items-center gap-[8px] border-t border-[#E4E6EB] bg-white px-[12px] pb-[30px] pt-[8px]"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          void act({ type: "comment", pubId: pub.id, version: v.v, author: viewer, text });
          setText("");
        }}
      >
        <Who id={viewer} size={32} />
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Comment on v${v.v}…`} className="h-[36px] min-w-0 flex-1 rounded-full bg-[#F0F2F5] px-[14px] text-[15px] outline-none" />
        <button type="submit" className="text-[15px] font-semibold text-fb-blue">Post</button>
      </form>
    </div>
  );
}
