// What happens when someone taps or types. Every step that needs judgment goes through Muse (ai.ts).
import type { Audience, Comment, Game, Message, Published, PubVersion } from "../types";
import { PERSONAS } from "../world";
import { adaptImport, classify, makeGame, nameOf, pickFans, publishPass, readComments, revise, type Candidate } from "./ai";
import { S, addChat, addGame, addPub, changed, chat, draft, epoch, findMsg, game, newId, post, pub, setDraft, typing } from "./store";

const guard = () => {
  const e = epoch();
  return () => e === epoch();
};

// ---------- chat ----------

export async function send(chatId: string, author: string, text: string) {
  const c = chat(chatId);
  if (!c || !text.trim()) return;
  post(chatId, { author, kind: "text", text: text.trim() });
  if (!/@muse\b/i.test(text)) return;
  const ok = guard();
  typing(chatId, "muse", "thinking");
  const games = S().games.filter((g) => g.chatId === chatId).map((g) => ({ id: g.id, title: g.title }));
  const { data: intent } = await classify(text, author, games, c.messages);
  if (!ok()) return;
  typing(chatId, "muse", null);
  if (intent.action === "make_game") void buildGame(chatId, intent.request || text, author);
  else if (intent.action === "edit_game" && intent.game_id && game(intent.game_id)) void editGame(intent.game_id, intent.request || text, author);
  else post(chatId, { author: "muse", kind: "muse", text: intent.reply || "i'm here! ask me to make the chat a game." });
}

export async function buildGame(chatId: string, request: string, by: string) {
  const c = chat(chatId)!;
  const ok = guard();
  const g: Game = {
    id: newId("g"), chatId, title: "New game", emoji: "🎮", tagline: "", html: "", status: "building", phase: "Reading your chat for inside jokes",
    createdBy: by, createdAt: Date.now(), rev: 1, edits: [], touches: [],
  };
  addGame(g);
  post(chatId, { author: "muse", kind: "game", gameId: g.id });
  typing(chatId, "muse", "making a game");
  const t = setTimeout(() => { if (g.status === "building") { g.phase = "Writing the game code"; changed(); } }, 2200);
  const { data, offline } = await makeGame(chatId, request, by, c.messages, c.members);
  clearTimeout(t);
  if (!ok()) return;
  Object.assign(g, { title: data.title, emoji: data.emoji, tagline: data.tagline, touches: data.touches, html: data.html, cfg: data.cfg, status: "ready", phase: "", offline });
  typing(chatId, "muse", null);
  changed();
}

export async function editGame(gameId: string, request: string, by: string, fromMsg?: { id: string; label: string }) {
  const g = game(gameId);
  if (!g || g.status !== "ready") return;
  const ok = guard();
  g.status = "editing";
  g.phase = `Adding ${request}`;
  typing(g.chatId, "muse", "editing the game");
  changed();
  const { data, offline } = await revise(g, request);
  if (!ok()) return;
  const changedHtml = data.html !== g.html;
  Object.assign(g, { html: data.html, cfg: data.cfg ?? g.cfg, status: "ready", phase: "", offline: g.offline || offline });
  if (changedHtml) {
    g.rev++;
    g.edits.push({ request, summary: data.summary, ts: Date.now() });
  }
  typing(g.chatId, "muse", null);
  if (fromMsg) {
    const m = findMsg(fromMsg.id);
    const r = m?.requests?.find((x) => x.label === fromMsg.label);
    if (r) r.status = changedHtml ? "added" : "open";
  }
  post(g.chatId, { author: "muse", kind: "muse", gameId: g.id, text: changedHtml ? `updated ${g.title.toLowerCase()}: ${data.summary}.${g.pubId ? " only this chat has it so far. publish it as a new version when you're ready." : ""}` : data.summary });
  if (changedHtml) post(g.chatId, { author: "muse", kind: "game", gameId: g.id });
}

// ---------- scores ----------

export function score(where: { gameId?: string; pubId?: string; version?: number; challengeMsg?: string }, player: string, value: number) {
  const n = Math.max(0, Math.round(Number(value) || 0));
  if (where.gameId) {
    const g = game(where.gameId);
    if (!g) return;
    const isBest = !g.best || n > g.best.score;
    if (isBest) g.best = { by: player, score: n };
    post(g.chatId, { author: player, kind: "score", gameId: g.id, score: n, text: isBest ? "new best" : undefined });
    return;
  }
  const p = where.pubId ? pub(where.pubId) : undefined;
  const v = p?.versions.find((x) => x.v === where.version) ?? p?.versions.at(-1);
  if (!p || !v) return;
  v.plays.push({ player, score: n, ts: Date.now() });
  changed();
  if (where.challengeMsg) {
    const m = findMsg(where.challengeMsg);
    if (m?.challenge && m.challenge.result === undefined) {
      m.challenge.result = n;
      changed();
      const won = n > m.challenge.target;
      post(m.challenge.fromChat, {
        author: "muse",
        kind: "muse",
        text: `${nameOf(player).toLowerCase()} took your challenge in ${v.title.toLowerCase()} v${v.v}: ${n.toLocaleString()} vs your best ${m.challenge.target.toLocaleString()}. ${won ? "they won 👀 rematch?" : "you held on. for now."}`,
      });
    }
  }
}

// ---------- publish ----------

export async function startPublish(gameId: string) {
  const g = game(gameId);
  if (!g || g.status !== "ready") return;
  const c = chat(g.chatId)!;
  const ok = guard();
  const rev = g.rev;
  setDraft({ gameId, rev, status: "working", phase: "Finding names and inside jokes" });
  const steps = ["Rewriting private details", "Writing the post", "Checking it's safe to share"];
  let i = 0;
  const tick = setInterval(() => {
    const d = draft(gameId);
    if (!d || d.status !== "working" || i >= steps.length) return clearInterval(tick);
    d.phase = steps[i++];
    changed();
  }, 1100);
  const { data } = await publishPass(g, c.members, c.messages);
  clearInterval(tick);
  if (!ok()) return;
  const prev = g.pubId ? pub(g.pubId)?.versions.at(-1) : undefined;
  setDraft({
    gameId, rev, status: "ready", phase: "",
    title: data.title, description: data.description, html: data.html, changes: data.changes,
    audience: prev?.audience ?? data.audience,
    audienceReason: prev ? `Same audience as v${prev.v}. ${data.audience_reason}` : data.audience_reason,
    safety: { ok: data.safety_ok, notes: data.safety_notes },
  });
}

export function confirmPublish(gameId: string, by: string, audience: Audience) {
  const g = game(gameId);
  const d = draft(gameId);
  if (!g || !d || d.status !== "ready" || !d.html || d.safety?.ok === false) return;
  let p = g.pubId ? pub(g.pubId) : undefined;
  if (!p) {
    p = { id: newId("p"), gameId, chatId: g.chatId, emoji: g.emoji, versions: [], imports: [], requests: [], requestsStatus: "idle", offered: [], fansShown: [] } satisfies Published;
    addPub(p);
    g.pubId = p.id;
  }
  const v: PubVersion = {
    v: p.versions.length + 1, title: d.title ?? g.title, description: d.description ?? "", html: d.html, changes: d.changes ?? [],
    notes: g.edits.filter((e) => p!.versions.length && e.ts > (p!.versions.at(-1)?.publishedAt ?? 0)).map((e) => e.summary),
    audience, publishedAt: Date.now(), publishedBy: by, plays: [], comments: [],
  };
  p.versions.push(v); // frozen from here on: nothing below ever edits a published version's html
  g.publishedRev = g.rev;
  S().drafts = S().drafts.filter((x) => x.gameId !== gameId);
  post(g.chatId, { author: by, kind: "published", pubId: p.id, version: v.v, gameId });
}

// ---------- comments, requests, fans ----------

const commentTimers = new Map<string, ReturnType<typeof setTimeout>>();

export function comment(pubId: string, version: number, author: string, text: string) {
  const p = pub(pubId);
  const v = p?.versions.find((x) => x.v === version);
  if (!p || !v || !text.trim()) return;
  v.comments.push({ id: newId("c"), author, text: text.trim().slice(0, 300), ts: Date.now() });
  changed();
  clearTimeout(commentTimers.get(pubId));
  commentTimers.set(pubId, setTimeout(() => void runRequests(pubId), 1200));
}

export async function runRequests(pubId: string) {
  const p = pub(pubId);
  if (!p) return;
  const all: Comment[] = p.versions.flatMap((v) => v.comments);
  if (!all.length) return;
  const ok = guard();
  p.requestsStatus = "reading";
  changed();
  const { data } = await readComments(all);
  if (!ok()) return;
  p.requests = data;
  p.requestsStatus = "ready";
  changed();
  // Offer the creators anything new that at least 3 players asked for.
  const fresh = data.filter((r) => r.count >= 3 && !p.offered.includes(r.label));
  if (!fresh.length) return;
  p.offered.push(...fresh.map((r) => r.label));
  const g = game(p.gameId)!;
  post(p.chatId, {
    author: "muse",
    kind: "requests",
    gameId: g.id,
    pubId: p.id,
    text: `people are commenting on ${g.title.toLowerCase()}. here's what they keep asking for. want any of it in your next version?`,
    requests: fresh.map((r) => ({ label: r.label, count: r.count, status: "open" as const })),
  });
}

export async function runFans(pubId: string) {
  const p = pub(pubId);
  if (!p) return;
  const c = chat(p.chatId)!;
  const g = game(p.gameId)!;
  const plays = p.versions.flatMap((v) => v.plays);
  const by = new Map<string, { plays: number; best: number }>();
  for (const x of plays) {
    const s = by.get(x.player) ?? { plays: 0, best: 0 };
    s.plays++;
    s.best = Math.max(s.best, x.score);
    by.set(x.player, s);
  }
  const ranked = [...by.entries()].sort((a, b) => b[1].best - a[1].best).map(([id]) => id);
  // Privacy: only players who opted in, never the chat's own members, never someone already introduced.
  const cands: Candidate[] = S().players
    .filter((pl) => pl.optIn && by.has(pl.id) && !c.members.includes(pl.id) && !p.fansShown.includes(pl.id))
    .map((pl) => ({
      id: pl.id, name: pl.name, city: pl.city, plays: by.get(pl.id)!.plays, best: by.get(pl.id)!.best, rank: ranked.indexOf(pl.id) + 1, likes: pl.likes,
      comments: p.versions.flatMap((v) => v.comments).filter((x) => x.author === pl.id).map((x) => x.text).slice(0, 3),
    }))
    .sort((a, b) => b.plays - a.plays)
    .slice(0, 8);
  if (!cands.length) return;
  const ok = guard();
  const { data } = await pickFans(g.title, c.title, c.messages, cands);
  if (!ok()) return;
  for (const f of data) {
    const cand = cands.find((x) => x.id === f.player)!;
    p.fansShown.push(f.player);
    post(p.chatId, { author: "muse", kind: "fan", pubId: p.id, gameId: g.id, fan: { player: f.player, why: f.why, intro: f.intro, plays: cand.plays, best: cand.best, status: "open" } });
  }
}

export function fanAction(msgId: string, action: "challenge" | "hi", by: string) {
  const m = findMsg(msgId);
  if (!m?.fan || m.fan.status !== "open" || !m.pubId) return;
  const p = pub(m.pubId)!;
  const creators = chat(p.chatId)!;
  const v = p.versions.at(-1)!;
  const g = game(p.gameId)!;
  m.fan.status = action === "challenge" ? "challenged" : "said_hi";
  const player = m.fan.player;
  const id = `req-${p.id}-${player}`;
  let dm = chat(id);
  if (!dm) {
    dm = { id, title: creators.title, members: [player, ...creators.members], messages: [], typing: {}, request: true };
    addChat(dm);
  }
  post(id, { author: "muse", kind: "muse", text: `${creators.title} made ${v.title}, a game you've played ${m.fan.plays} times. ${nameOf(by)} from the chat wanted to reach out. you can ignore this, they won't see anything else about you.` });
  if (action === "challenge") {
    const ours = Math.max(g.best?.score ?? 0, ...v.plays.filter((x) => creators.members.includes(x.player)).map((x) => x.score), 0);
    const target = ours || 900;
    post(id, { author: by, kind: "challenge", pubId: p.id, version: v.v, challenge: { fromChat: p.chatId, pubId: p.id, version: v.v, target, status: "open" } });
    post(p.chatId, { author: "muse", kind: "muse", text: `challenge sent. ${nameOf(player).toLowerCase()} has to beat ${target.toLocaleString()} in v${v.v}. i'll tell you how it goes.` });
  } else {
    post(id, { author: by, kind: "text", text: `hey ${nameOf(player)}! you're crushing our game 😅 we do ramen thursdays if you ever want to come` });
    post(p.chatId, { author: "muse", kind: "muse", text: `said hi to ${nameOf(player).toLowerCase()} for you. it lands in their message requests.` });
  }
}

export function acceptChallenge(msgId: string) {
  const m = findMsg(msgId);
  if (m?.challenge) {
    m.challenge.status = "accepted";
    changed();
  }
}

// ---------- import ----------

export async function importGame(pubId: string, version: number, chatId: string, by: string) {
  const p = pub(pubId);
  const v = p?.versions.find((x) => x.v === version);
  const c = chat(chatId);
  if (!p || !v || !c) return;
  const ok = guard();
  const g: Game = {
    id: newId("g"), chatId, title: v.title, emoji: p.emoji, tagline: "", html: "", status: "building", phase: "Reading your chat to make it yours",
    createdBy: by, createdAt: Date.now(), rev: 1, edits: [], touches: [], origin: { pubId, version, title: v.title, fromChat: chat(p.chatId)!.title, changes: [] },
  };
  addGame(g);
  post(chatId, { author: by, kind: "text", text: `imported ${v.title} v${v.v} from the ramen council's post` });
  post(chatId, { author: "muse", kind: "game", gameId: g.id });
  typing(chatId, "muse", "making it yours");
  const { data, offline } = await adaptImport(v.title, v.html, c.messages, c.members, chatId);
  if (!ok()) return;
  Object.assign(g, { title: data.title, emoji: data.emoji, tagline: data.tagline, touches: data.touches, html: data.html, cfg: data.cfg, status: "ready", phase: "", offline });
  g.origin!.changes = data.changes;
  p.imports.push({ chatId, title: c.title, ts: Date.now() });
  typing(chatId, "muse", null);
  changed();
  const asks = p.requests.filter((r) => r.count >= 2).slice(0, 3);
  if (asks.length)
    post(chatId, {
      author: "muse",
      kind: "requests",
      gameId: g.id,
      text: `players of the original keep asking for these. want any in your copy?`,
      requests: asks.map((r) => ({ label: r.label, count: r.count, status: "open" as const })),
    });
}

export function addRequest(msgId: string, label: string, by: string) {
  const m = findMsg(msgId);
  const r = m?.requests?.find((x) => x.label === label);
  if (!m || !r || r.status !== "open" || !m.gameId) return;
  r.status = "adding";
  changed();
  void editGame(m.gameId, label, by, { id: msgId, label });
}

// ---------- director: a day of strangers playing ----------

const DAY_COMMENTS: [string, string][] = [
  ["dana", "ok this is way too easy once you get the rhythm. hard mode please"],
  ["p_june", "the mid stamps got me 😭 need a harder version though"],
  ["p_raj", "can we get 2 player? i want to play my roommate"],
  ["p_zoe", "speedrunner here. please add a hard mode, i hit 1000 in 3 tries"],
  ["p_marisol", "golden egg is so satisfying lol"],
  ["p_ivy", "2 player mode would be perfect for date night"],
  ["p_omar", "Needs to be harder, toppings fall too slow"],
  ["p_tyler", "lol the 'mid' thing is so real"],
  ["p_luis", "would love a versus mode with friends"],
  ["p_bea", "made it to 640!!"],
  ["p_kate", "harder level pls, too easy after 5 rounds"],
  ["p_nate", "this is my new bus game"],
];

export async function simulateDay(pubId?: string) {
  const p = pubId ? pub(pubId) : S().pubs[0];
  if (!p) return;
  const v = p.versions.at(-1)!;
  const now = Date.now();
  const rand = (a: number, b: number) => Math.round(a + Math.random() * (b - a));
  const plan: [string, number, number][] = [
    ["dana", 41, 1310], ["p_zoe", 23, 1180], ["p_june", 17, 960], ["p_raj", 12, 880], ["p_omar", 9, 820], ["p_kate", 8, 790],
    ["p_marisol", 6, 700], ["p_ivy", 5, 610], ["p_bea", 5, 640], ["p_luis", 4, 520], ["p_tyler", 3, 450], ["p_nate", 3, 380],
  ];
  for (const [player, n, best] of plan) {
    for (let i = 0; i < n; i++) v.plays.push({ player, score: i === 0 ? best : rand(best * 0.35, best * 0.92), ts: now - rand(1, 20) * 3600_000 });
  }
  for (const [author, text] of DAY_COMMENTS) v.comments.push({ id: newId("c"), author, text, ts: now - rand(1, 18) * 3600_000 });
  v.comments.sort((a, b) => a.ts - b.ts);
  changed();
  await runRequests(p.id);
  await runFans(p.id);
}

export function toggleOptIn(player: string) {
  const pl = S().players.find((x) => x.id === player);
  if (pl) {
    pl.optIn = !pl.optIn;
    changed();
  }
}

export const personaExists = (id: string) => id in PERSONAS;
export type { Message };
