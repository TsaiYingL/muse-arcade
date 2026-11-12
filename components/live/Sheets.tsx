"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { act, me, useLive } from "@/lib/live";
import type { Audience, LiveState } from "@/lib/types";
import { AUDIENCES, audienceLabel, fmtReach } from "@/lib/world";
import { useNav } from "../nav";
import { Tap } from "../ui";
import { bestFor, first, MuseAvatar, Sparkle, type Overlay } from "./bits";
import { GameFrame } from "./GameFrame";

export function Overlays({ overlay, close }: { overlay: Overlay; close: () => void }) {
  return (
    <AnimatePresence>
      {overlay && (
        <motion.div key="scrim" className="absolute inset-0 z-[70] bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} />
      )}
      {overlay && (
        <motion.div
          key={overlay.kind}
          className="absolute inset-x-0 bottom-0 z-[75] flex flex-col overflow-hidden rounded-t-[14px] bg-white"
          style={{ top: overlay.kind === "import" ? 360 : 58 }}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 380, damping: 40 }}
        >
          <div className="mx-auto mt-[6px] h-[5px] w-[36px] shrink-0 rounded-full bg-[#D0D3D8]" />
          {overlay.kind === "play" && <PlaySheet o={overlay} close={close} />}
          {overlay.kind === "publish" && <PublishSheet gameId={overlay.gameId} close={close} />}
          {overlay.kind === "import" && <ImportSheet pubId={overlay.pubId} version={overlay.version} close={close} />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SheetHeader({ title, sub, close, right }: { title: ReactNode; sub?: ReactNode; close: () => void; right?: ReactNode }) {
  return (
    <div className="flex shrink-0 items-center border-b border-[#E4E6EB] px-[14px] pb-[10px] pt-[8px]">
      <div className="min-w-0 flex-1">
        <div className="truncate text-[17px] font-bold leading-[22px]">{title}</div>
        {sub && <div className="truncate text-[13px] leading-[17px] text-fb-secondary">{sub}</div>}
      </div>
      {right}
      <Tap label="Close" onPress={close} className="ml-[10px] grid h-[32px] w-[32px] place-items-center rounded-full bg-[#E4E6EB]">
        <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 2l10 10M12 2L2 12" stroke="#050505" strokeWidth="2.2" strokeLinecap="round" /></svg>
      </Tap>
    </div>
  );
}

// ---------- play ----------

function resolvePlay(state: LiveState, o: Extract<Overlay, { kind: "play" }>) {
  if (o.gameId) {
    const g = state.games.find((x) => x.id === o.gameId);
    return g ? { html: g.html, sub: g.origin ? `Your copy · adapted from ${g.origin.title}` : "Only this chat can see this version", best: g.best?.score ?? 0 } : null;
  }
  const p = state.pubs.find((x) => x.id === o.pubId);
  const v = p?.versions.find((x) => x.v === o.version) ?? p?.versions.at(-1);
  if (!p || !v) return null;
  return { html: v.html, sub: `v${v.v} · published by ${state.chats.find((c) => c.id === p.chatId)?.title}`, best: bestFor(state, p.id, v.v, me()) };
}

function PlaySheet({ o, close }: { o: Extract<Overlay, { kind: "play" }>; close: () => void }) {
  const state = useLive();
  // Freeze the html we opened with so a new version never swaps the game mid-round.
  const opened = useRef<string | null>(null);
  const [last, setLast] = useState<number | null>(null);
  if (!state) return null;
  const r = resolvePlay(state, o);
  if (!r) return null;
  opened.current ??= r.html;
  const onScore = (n: number) => {
    setLast(n);
    void act({ type: "score", gameId: o.gameId, pubId: o.pubId, version: o.version, challengeMsg: o.challengeMsg, player: me(), score: n });
  };
  return (
    <>
      <SheetHeader title={o.title} sub={last !== null ? `Scored ${last.toLocaleString()} · posted` : r.sub} close={close} />
      <div className="min-h-0 flex-1">
        <GameFrame html={opened.current} player={first(me())} best={r.best} onScore={onScore} />
      </div>
    </>
  );
}

// ---------- publish ----------

const PHASES = ["Finding names and inside jokes", "Rewriting private details", "Writing the post", "Checking it's safe to share"];

function PublishSheet({ gameId, close }: { gameId: string; close: () => void }) {
  const state = useLive();
  const g = state?.games.find((x) => x.id === gameId);
  const d = state?.drafts.find((x) => x.gameId === gameId);
  const p = g?.pubId ? state?.pubs.find((x) => x.id === g.pubId) : undefined;
  const nextV = (p?.versions.length ?? 0) + 1;
  const [aud, setAud] = useState<Audience | null>(null);
  const [preview, setPreview] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (!g || started.current) return;
    if (!d || d.rev !== g.rev || d.status === "error") {
      started.current = true;
      void act({ type: "startPublish", gameId });
    }
  }, [g, d, gameId]);

  if (!state || !g) return null;
  const ready = d && d.status === "ready" && d.rev === g.rev;
  const chosen = aud ?? d?.audience ?? "city";
  const phaseIdx = d?.status === "working" ? Math.max(0, PHASES.indexOf(d.phase)) : 0;

  return (
    <>
      <SheetHeader title={`Publish ${g.title}`} sub={nextV > 1 ? `New version v${nextV} · v${nextV - 1} stays playable, unchanged` : "Share a copy on Facebook. Your chat's version stays private."} close={close} />
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto pb-[110px]">
        {!ready ? (
          <div className="px-[18px] pt-[26px]">
            <div className="flex items-center gap-[10px]">
              <MuseAvatar size={36} />
              <div className="text-[15px] font-semibold">Muse is making a public copy</div>
            </div>
            <div className="mt-[18px] space-y-[14px]">
              {PHASES.map((ph, i) => (
                <div key={ph} className={`flex items-center gap-[10px] text-[15px] ${i <= phaseIdx ? "text-fb-text" : "text-[#BCC0C4]"}`}>
                  <span className={`grid h-[22px] w-[22px] place-items-center rounded-full ${i < phaseIdx ? "bg-[#31A24C]" : i === phaseIdx ? "bg-fb-blue" : "bg-[#E4E6EB]"}`}>
                    {i < phaseIdx ? (
                      <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2.5 6.2l2.3 2.3 4.7-5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
                    ) : i === phaseIdx ? (
                      <span className="h-[8px] w-[8px] animate-pulse rounded-full bg-white" />
                    ) : null}
                  </span>
                  {ph}
                </div>
              ))}
            </div>
            <p className="mt-[22px] text-[13px] leading-[18px] text-fb-secondary">
              Your chat&apos;s game is full of things only you get. Muse rewrites those before anyone outside sees it, then you approve every change.
            </p>
          </div>
        ) : (
          <>
            <Section title="What Muse changed" hint="Private to the public version">
              <div className="space-y-[8px]">
                {(d.changes ?? []).map((c, i) => (
                  <div key={i} className="rounded-[10px] bg-[#F7F8FA] px-[12px] py-[9px]">
                    <div className="flex flex-wrap items-center gap-x-[6px] text-[15px] leading-[20px]">
                      <span className="text-[#C9302C] line-through decoration-[1.5px]">{c.before}</span>
                      <span className="text-fb-secondary">→</span>
                      <span className="font-semibold text-[#1F7A35]">{c.after}</span>
                    </div>
                    <div className="mt-[2px] text-[13px] leading-[17px] text-fb-secondary">{c.why}</div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="The post">
              <div className="overflow-hidden rounded-[10px] ring-1 ring-[#E4E6EB]">
                <div className="px-[12px] pb-[10px] pt-[10px]">
                  <div className="text-[15px] font-bold">{g.emoji} {d.title}</div>
                  <div className="mt-[3px] text-[14px] leading-[19px] text-[#3A3B3C]">{d.description}</div>
                </div>
                {preview ? (
                  <div className="h-[330px] border-t border-[#E4E6EB]">
                    <GameFrame html={d.html!} player={first(me())} best={0} onScore={() => {}} />
                  </div>
                ) : (
                  <Tap variant="soft" onPress={() => setPreview(true)} className="flex w-full items-center justify-center gap-[6px] border-t border-[#E4E6EB] py-[10px] text-[15px] font-semibold text-fb-blue">
                    ▶ Try the public version
                  </Tap>
                )}
              </div>
            </Section>

            <Section title="Who can see it">
              {d.audienceReason && (
                <div className="mb-[10px] flex gap-[8px] rounded-[10px] bg-[#EBF5FF] px-[12px] py-[9px] text-[13px] leading-[18px] text-[#0B3A80]">
                  <Sparkle size={16} className="mt-[1px] shrink-0 text-fb-blue" />
                  <span><b>Muse suggests {audienceLabel(d.audience!)}.</b> {d.audienceReason}</span>
                </div>
              )}
              <div className="overflow-hidden rounded-[10px] ring-1 ring-[#E4E6EB]">
                {AUDIENCES.map((a) => (
                  <Tap key={a.id} variant="row" onPress={() => setAud(a.id)} className="flex w-full items-center gap-[10px] border-b border-[#E4E6EB] px-[12px] py-[9px] text-left last:border-0">
                    <span className={`grid h-[20px] w-[20px] shrink-0 place-items-center rounded-full ${chosen === a.id ? "bg-fb-blue" : "ring-2 ring-inset ring-[#BCC0C4]"}`}>
                      {chosen === a.id && <span className="h-[8px] w-[8px] rounded-full bg-white" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-[6px] text-[15px] font-semibold">
                        {a.label}
                        {d.audience === a.id && <span className="rounded-[4px] bg-[#EBF5FF] px-[5px] py-[1px] text-[11px] font-bold text-fb-blue">MUSE PICK</span>}
                      </span>
                      <span className="block text-[13px] text-fb-secondary">{a.detail}</span>
                    </span>
                    <span className="text-[12px] text-fb-secondary">{fmtReach(a.reach)}</span>
                  </Tap>
                ))}
              </div>
            </Section>

            <Section title="Safety check">
              <div className={`flex items-start gap-[8px] text-[14px] leading-[19px] ${d.safety?.ok ? "text-[#1F7A35]" : "text-[#C9302C]"}`}>
                <span className="text-[16px]">{d.safety?.ok ? "✓" : "!"}</span>
                {d.safety?.notes}
              </div>
            </Section>
          </>
        )}
      </div>
      {ready && (
        <div className="absolute inset-x-0 bottom-0 border-t border-[#E4E6EB] bg-white px-[14px] pb-[30px] pt-[10px]">
          <Tap
            variant="soft"
            onPress={() => {
              void act({ type: "confirmPublish", gameId, by: me(), audience: chosen });
              close();
            }}
            className={`flex h-[44px] w-full items-center justify-center rounded-[8px] text-[16px] font-semibold text-white ${d.safety?.ok === false ? "pointer-events-none bg-[#BCC0C4]" : "bg-fb-blue"}`}
          >
            Publish v{nextV} to {audienceLabel(chosen)}
          </Tap>
          <div className="mt-[6px] text-center text-[12px] text-fb-secondary">Published versions never change. Others can import a copy to edit.</div>
        </div>
      )}
    </>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="px-[14px] pt-[16px]">
      <div className="mb-[8px] flex items-baseline justify-between">
        <h3 className="text-[15px] font-bold">{title}</h3>
        {hint && <span className="text-[12px] text-fb-secondary">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

// ---------- import ----------

function ImportSheet({ pubId, version, close }: { pubId: string; version: number; close: () => void }) {
  const state = useLive();
  const nav = useNav();
  if (!state) return null;
  const p = state.pubs.find((x) => x.id === pubId);
  const v = p?.versions.find((x) => x.v === version);
  const mine = state.chats.filter((c) => c.members.includes(me()) && !c.request && c.id !== p?.chatId);
  return (
    <>
      <SheetHeader title={`Import ${v?.title ?? "game"} v${version}`} sub="Muse rebuilds it for your chat. The original stays the same." close={close} />
      <div className="px-[14px] pt-[12px]">
        {mine.length === 0 && <div className="py-[20px] text-center text-[15px] text-fb-secondary">You&apos;re not in any group chats yet.</div>}
        {mine.map((c) => (
          <Tap
            key={c.id}
            variant="row"
            onPress={() => {
              void act({ type: "import", pubId, version, chatId: c.id, by: me() });
              close();
              nav.push({ screen: "live", chatId: c.id });
            }}
            className="flex w-full items-center gap-[12px] rounded-[10px] px-[6px] py-[10px] text-left"
          >
            <span className="grid h-[44px] w-[44px] place-items-center rounded-full bg-[#F0F2F5] text-[22px]">{c.title.match(/\p{Extended_Pictographic}/u)?.[0] ?? "💬"}</span>
            <span className="flex-1">
              <span className="block text-[16px] font-semibold">{c.title}</span>
              <span className="block text-[13px] text-fb-secondary">{c.members.length} members</span>
            </span>
            <span className="text-[15px] font-semibold text-fb-blue">Import</span>
          </Tap>
        ))}
      </div>
    </>
  );
}
