// Every Muse call the product makes. Each has a scripted fallback so a dead connection never breaks the demo,
// but the live path is the product: Muse writes the game, decides what's private, reads the comments,
// rewrites the game for another chat, and picks which stranger is worth introducing.
import type { Audience, Change, Comment, Message } from "../types";
import { person } from "../data";
import { CREATOR_CAMPUS, CREATOR_CITY, LOCAL_GROUP } from "../world";
import { hasKey, museJson, nullable } from "./muse";
import { setOnline } from "./store";
import { gameHtml, RAMEN_HARD, RAMEN_PRIVATE, RAMEN_PUBLIC, RAMEN_PUBLIC_HARD, TACO_IMPORT, type GameConfig } from "./template";

export const nameOf = (id: string) => person(id)?.first ?? id;

const day = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Chicago" });
export const line = (m: Message) => `${day(m.ts)} ${nameOf(m.author)}: ${(m.text ?? "").replace(/\n/g, " / ")}`;
const transcript = (msgs: Message[]) => msgs.filter((m) => m.kind === "text" && m.text).slice(-60).map(line).join("\n");

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Runs the live Muse call; on any failure (or no key) returns the scripted result and says so. */
async function live<T>(label: string, call: () => Promise<T>, fallback: () => T, fakeMs = 1600): Promise<{ data: T; offline: boolean }> {
  if (!hasKey()) {
    setOnline(false);
    await sleep(fakeMs);
    return { data: fallback(), offline: true };
  }
  try {
    const data = await call();
    setOnline(true);
    return { data, offline: false };
  } catch (e) {
    console.warn(`[muse] ${label} failed, using fallback: ${(e as Error).message}`);
    setOnline(false);
    return { data: fallback(), offline: true };
  }
}

const str = { type: "string" };
const obj = (props: Record<string, unknown>) => ({ type: "object", additionalProperties: false, required: Object.keys(props), properties: props });
const CHANGE = obj({ before: str, after: str, why: str });

// ---------- The game contract every generated game follows ----------

const GAME_CONTRACT = `Write ONE self-contained HTML document: inline <style> and <script> only. No external URLs, images, fonts, fetch, XMLHttpRequest, WebSocket, localStorage, alert or prompt. It runs in a sandboxed iframe about 393px wide and 560px tall on a phone.
- Touch first (pointer events), with mouse and arrow keys too. Draw art with emoji, canvas or CSS shapes.
- Start screen: big emoji, title, one line of how to play, a Play button.
- A round lasts 20 to 45 seconds and ends with an integer score. Then call parent.postMessage({type:"score", score: <integer>}, "*") exactly once per round and show the score with a Play again button.
- Listen for window "message" events {type:"init", player:{name}, best:<number>}. It may arrive any time; show "Your best: N" on the start screen when best > 0.
- Bright, fun, readable (15px+ text), 44px+ tap targets, no scrolling. Keep it under 260 lines and make sure it runs without errors.`;

const GAME_SCHEMA = obj({
  title: str,
  emoji: str,
  tagline: str,
  touches: { type: "array", items: str },
  html: str,
});

const BANNED = /\b(fetch|XMLHttpRequest|WebSocket|importScripts|eval)\s*\(|<script[^>]+src=|<link[^>]+href=|<img[^>]+src=["']https?:/i;
function checkHtml(html: string) {
  const b = BANNED.exec(html);
  if (b) throw new Error(`game uses a blocked API: ${b[0]}`);
  if (html.length > 80_000) throw new Error("game too large");
  if (!/postMessage/.test(html)) throw new Error("game never reports a score");
  return html;
}

const cleanEmoji = (e: string) => /\p{Extended_Pictographic}(️|‍\p{Extended_Pictographic})*/u.exec(e)?.[0] ?? "🎮";

export interface MadeGame {
  title: string;
  emoji: string;
  tagline: string;
  touches: string[];
  html: string;
  cfg?: string;
}

const CFGS: Record<string, GameConfig> = { RAMEN_PRIVATE, RAMEN_PUBLIC, RAMEN_HARD, RAMEN_PUBLIC_HARD, TACO_IMPORT };
export const cfgHtml = (k: string) => gameHtml(CFGS[k]);

// ---------- 1. Make a game from a sentence + the chat ----------

export async function makeGame(chatId: string, request: string, requester: string, history: Message[], members: string[]) {
  return live<MadeGame>(
    "make",
    async () => {
      const { data } = await museJson<MadeGame>({
        model: "spark",
        effort: "low",
        timeoutMs: 150_000,
        instructions: `You are Muse in a Facebook Messenger group chat. ${nameOf(requester)} asked you to make a small game for the chat.
Make it feel made for THIS group: weave in 2 to 4 real details from their chat (inside jokes, catchphrases, who likes what, their favorite places, member first names). List each one in "touches" as a short phrase ("Jay's 'mid' ratings as obstacles").
title: short and original (not an existing game's name). emoji: one emoji. tagline: one short line.
${GAME_CONTRACT}
Members: ${members.map(nameOf).join(", ")}.`,
        input: `Request: "${request}"\n\nChat (most recent last):\n${transcript(history)}`,
        schemaName: "game",
        schema: GAME_SCHEMA,
        label: "make-game",
      });
      checkHtml(data.html);
      return { ...data, emoji: cleanEmoji(data.emoji) };
    },
    () =>
      chatId === "taco"
        ? { title: TACO_IMPORT.title, emoji: "🌮", tagline: "load the taco, dodge the soap", touches: ["Kenji's cilantro = soap", "Ellie's habanero salsa bonus", "Veracruz on the taco"], html: cfgHtml("TACO_IMPORT"), cfg: "TACO_IMPORT" }
        : {
            title: RAMEN_PRIVATE.title,
            emoji: "🍜",
            tagline: "catch toppings, dodge Jay's \"mid\"",
            touches: ["Jay's \"mid\" ratings are the obstacles", "Priya's 11/10 egg is the bonus", "Arun's Tatsu-ya bowl", "Mia's spicy order in the end lines"],
            html: cfgHtml("RAMEN_PRIVATE"),
            cfg: "RAMEN_PRIVATE",
          },
    2600,
  );
}

// ---------- 2. Publish pass: strip what's private, write the listing, pick an audience ----------

export interface PublishPass {
  title: string;
  description: string;
  html: string;
  changes: Change[];
  audience: Audience;
  audience_reason: string;
  safety_ok: boolean;
  safety_notes: string;
}

const AUDIENCE_IDS: Audience[] = ["friends", "fof", "city", "campus", "group", "everyone"];

export async function publishPass(g: { title: string; html: string; touches: string[]; cfg?: string }, members: string[], history: Message[]) {
  const names = members.map(nameOf);
  return live<PublishPass>(
    "publish",
    async () => {
      const { data } = await museJson<PublishPass>({
        model: "spark",
        effort: "low",
        timeoutMs: 150_000,
        instructions: `A friend group chat made this game privately and now wants to publish it on Facebook, where strangers will play it.
Make the public version of the HTML:
- Remove or generalize everything personal: member names (${names.join(", ")}), nicknames, inside jokes only they would get, opinions or ratings tied to a person, anything quoted from their chat. Turn a personal joke into a general one when it's still funny ("Jay's mid stamps" -> "mid stamps").
- Keep the gameplay, difficulty, theme and the game contract exactly as they are. Public places (a restaurant's name) can stay only if no member's opinion is attached.
- changes: every concrete edit, before and after as short phrases plus why (one short clause). List the most important first.
- title: keep it unless it contains something private. description: one or two inviting sentences for the Facebook post, no private details.
- audience: the smallest audience that would genuinely enjoy it. "city" if it leans on ${CREATOR_CITY} places or culture, "campus" for ${CREATOR_CAMPUS} things, "group" if it's for a niche the "${LOCAL_GROUP}" Facebook Group shares, "everyone" if anyone anywhere gets it, "friends"/"fof" if it only makes sense to people who know the group. audience_reason: one short sentence citing what in the game made you choose it.
- safety_ok: false if the public version still mocks a real private person, or has slurs, adult or hateful content. safety_notes: one short sentence.
${GAME_CONTRACT}`,
        input: `Game: ${g.title}\nDetails Muse wove in when making it: ${g.touches.join("; ") || "unknown"}\n\nChat it came from (excerpt):\n${transcript(history.slice(-30))}\n\nHTML:\n${g.html}`,
        schemaName: "publish",
        schema: obj({
          title: str,
          description: str,
          html: str,
          changes: { type: "array", items: CHANGE },
          audience: { type: "string", enum: AUDIENCE_IDS },
          audience_reason: str,
          safety_ok: { type: "boolean" },
          safety_notes: str,
        }),
        label: "publish-pass",
      });
      checkHtml(data.html);
      return data;
    },
    () => {
      const hard = g.cfg === "RAMEN_HARD";
      const html = g.cfg ? cfgHtml(hard ? "RAMEN_PUBLIC_HARD" : "RAMEN_PUBLIC") : stripNames(g.html, names);
      return {
        title: g.title,
        description: hard
          ? "Hard mode is here: faster toppings and twice the mid stamps. Catch toppings for your ramen bowl and chase a perfect 11/10."
          : "Catch falling toppings for your ramen bowl, grab the golden egg, and dodge the \"mid\" stamps. 30 seconds. How high can you score?",
        html,
        changes: [
          { before: "Jay's \"mid\" stamps", after: "\"mid\" stamps", why: "Jay's catchphrase points at a real person" },
          { before: "Priya's 11/10 egg", after: "golden egg", why: "a friend's rating, not public" },
          { before: "Arun's Tatsu-ya bowl", after: "your bowl", why: "ties a member to a place" },
          { before: "\"Mia would still order the spicy one\"", after: "\"Your regulars approve\"", why: "inside joke about a member" },
        ],
        audience: "city",
        audience_reason: `It's about ramen and the "mid" joke lands with local food people, so ${CREATOR_CITY} is the right size to start.`,
        safety_ok: true,
        safety_notes: "No names, no private ratings, nothing mean about a real person.",
      };
    },
    3200,
  );
}

function stripNames(html: string, names: string[]) {
  let out = html;
  for (const n of names) out = out.replace(new RegExp(`\\b${n}'s\\b`, "gi"), "your").replace(new RegExp(`\\b${n}\\b`, "gi"), "a friend");
  return out;
}

// ---------- 3. Read the comments: group them into what players are asking for ----------

export interface Ask {
  label: string;
  count: number;
  quote: string;
  players: string[];
}

export async function readComments(comments: Comment[]) {
  return live<Ask[]>(
    "comments",
    async () => {
      const { data } = await museJson<{ requests: Ask[] }>({
        model: "ember",
        effort: "low",
        instructions: `These are comments on a game published on Facebook. Group the ones that ask for a change or a new feature into requests (ignore praise, scores and chatter). label: a short lowercase noun phrase ("a hard mode", "2-player mode"). count: how many distinct players asked. quote: one representative comment copied exactly, cut to 12 words max. players: the player ids who asked. Most-asked first, at most 4.`,
        input: comments.map((c) => `[${c.author}] ${c.text}`).join("\n"),
        schemaName: "requests",
        schema: obj({ requests: { type: "array", items: obj({ label: str, count: { type: "integer" }, quote: str, players: { type: "array", items: str } }) } }),
        label: "read-comments",
      });
      return data.requests;
    },
    () => keywordAsks(comments),
    1400,
  );
}

function keywordAsks(comments: Comment[]): Ask[] {
  const buckets: { label: string; re: RegExp }[] = [
    { label: "a hard mode", re: /hard|harder|too easy|faster|difficult|challenge/i },
    { label: "2-player mode", re: /2.?player|two.?player|versus|\bvs\b|multiplayer|play with/i },
    { label: "more bonus eggs", re: /egg|bonus|golden/i },
  ];
  const out: Ask[] = [];
  for (const b of buckets) {
    const hits = comments.filter((c) => b.re.test(c.text));
    const players = [...new Set(hits.map((c) => c.author))];
    if (players.length) out.push({ label: b.label, count: players.length, quote: hits[0].text.split(" ").slice(0, 12).join(" "), players });
  }
  return out.sort((a, b) => b.count - a.count);
}

// ---------- 4. Revise: the owners' own copy, by asking ----------

export async function revise(g: { title: string; html: string; cfg?: string }, request: string) {
  return live<{ html: string; summary: string; notes: string[]; cfg?: string }>(
    "revise",
    async () => {
      const { data } = await museJson<{ html: string; summary: string; notes: string[] }>({
        model: "spark",
        effort: "low",
        timeoutMs: 150_000,
        instructions: `You are editing a game that lives in a group chat. Change only what the request needs and keep everything else (personal touches, style, contract). If the request is a mode (like hard mode), make it the default way the game plays now and say so on the start screen. summary: one short lowercase sentence of what changed. notes: 1 to 3 short patch notes players will read.
${GAME_CONTRACT}`,
        input: `Game: ${g.title}\nRequest: "${request}"\n\nHTML:\n${g.html}`,
        schemaName: "revise",
        schema: obj({ html: str, summary: str, notes: { type: "array", items: str } }),
        label: "revise",
      });
      checkHtml(data.html);
      return data;
    },
    () => {
      if (/hard|fast|difficult/i.test(request) && g.cfg?.startsWith("RAMEN"))
        return { html: cfgHtml("RAMEN_HARD"), summary: "added hard mode: toppings fall 70% faster and there are twice as many mid stamps", notes: ["Hard mode: toppings fall 70% faster", "Twice as many mid stamps", "Same 30 seconds"], cfg: "RAMEN_HARD" };
      if (/hard|fast|difficult/i.test(request) && g.cfg === "TACO_IMPORT")
        return { html: gameHtml({ ...TACO_IMPORT, hard: true, subtitle: "HARD MODE: faster fillings, twice the soap stamps." }), summary: "added hard mode to your copy", notes: ["Hard mode"], cfg: g.cfg };
      return { html: g.html, summary: `couldn't reach Muse to make that change ("${request}")`, notes: [], cfg: g.cfg };
    },
    2400,
  );
}

// ---------- 5. Import: rebuild a public game as another chat's own copy ----------

export async function adaptImport(title: string, html: string, history: Message[], members: string[], chatId: string) {
  return live<MadeGame & { changes: Change[] }>(
    "import",
    async () => {
      const { data } = await museJson<MadeGame & { changes: Change[] }>({
        model: "spark",
        effort: "low",
        timeoutMs: 150_000,
        instructions: `A different group chat imported a public Facebook game ("${title}") to make their own copy. Rebuild it for THEM: keep the gameplay and contract, but swap the theme and details for 2 to 4 real things from their chat (inside jokes, favorite places, who likes what, first names). List each in touches. changes: what you swapped, before and after as short phrases plus why. title: a new title that fits them. emoji: one emoji. tagline: one short line.
${GAME_CONTRACT}
Members: ${members.map(nameOf).join(", ")}.`,
        input: `Their chat (most recent last):\n${transcript(history)}\n\nPublic game HTML:\n${html}`,
        schemaName: "import",
        schema: obj({ title: str, emoji: str, tagline: str, touches: { type: "array", items: str }, html: str, changes: { type: "array", items: CHANGE } }),
        label: "import",
      });
      checkHtml(data.html);
      return { ...data, emoji: cleanEmoji(data.emoji) };
    },
    () => ({
      title: TACO_IMPORT.title,
      emoji: "🌮",
      tagline: "load the taco, dodge the soap",
      touches: ["Kenji's cilantro = soap stamps", "Ellie's habanero salsa is the bonus", "Veracruz on the taco"],
      html: chatId === "taco" ? cfgHtml("TACO_IMPORT") : html,
      cfg: chatId === "taco" ? "TACO_IMPORT" : undefined,
      changes: [
        { before: "ramen bowl 🍜", after: "taco 🌮", why: "your chat is all about Veracruz tacos" },
        { before: "\"mid\" stamps", after: "\"soap\" stamps", why: "Kenji says cilantro tastes like soap, every week" },
        { before: "golden egg bonus", after: "Ellie's habanero salsa bonus", why: "Ellie brings it to every taco night" },
      ],
    }),
    2800,
  );
}

// ---------- 6. Fans: who outside the chat is worth introducing ----------

export interface FanPick {
  player: string;
  why: string;
  intro: string;
}

export interface Candidate {
  id: string;
  name: string;
  city: string;
  plays: number;
  best: number;
  rank: number;
  likes: string[];
  comments: string[];
}

export async function pickFans(gameTitle: string, chatTitle: string, chatHistory: Message[], cands: Candidate[]) {
  return live<FanPick[]>(
    "fans",
    async () => {
      const { data } = await museJson<{ picks: FanPick[] }>({
        model: "spark",
        effort: "low",
        instructions: `The group chat "${chatTitle}" made the game "${gameTitle}" and published it. These players outside the chat all agreed to let creators reach out. Pick the ONE person this group would most enjoy meeting: someone who plays a lot and plays well, lives nearby (${CREATOR_CITY}), and shares what the chat is into. Never pick someone just for play count. why: one short line of facts (plays, rank, city, a shared interest). intro: one friendly lowercase line you'd post to the chat suggesting they challenge or say hi, citing those facts. No scores of friendship, no flattery.`,
        input: `Chat excerpt:\n${transcript(chatHistory.slice(-25))}\n\nPlayers:\n${cands.map((c) => `${c.id}: ${c.name}, ${c.city}, ${c.plays} plays, best ${c.best} (#${c.rank}), into ${c.likes.join(", ") || "unknown"}${c.comments.length ? `, commented: ${c.comments.map((x) => `"${x}"`).join(" ")}` : ""}`).join("\n")}`,
        schemaName: "fans",
        schema: obj({ picks: { type: "array", items: obj({ player: str, why: str, intro: str }) } }),
        label: "fans",
      });
      return data.picks.filter((p) => cands.some((c) => c.id === p.player)).slice(0, 1);
    },
    () => {
      const top = [...cands].sort((a, b) => (a.city === CREATOR_CITY ? 0 : 1) - (b.city === CREATOR_CITY ? 0 : 1) || b.plays * 1000 + b.best - (a.plays * 1000 + a.best))[0];
      if (!top) return [];
      const shared = top.likes.find((l) => /ramen/i.test(l));
      return [
        {
          player: top.id,
          why: `${top.plays} plays · #${top.rank} · ${top.city}${shared ? ` · also into ${shared}` : ""}`,
          intro: `${top.name.split(" ")[0].toLowerCase()} has played ${gameTitle.toLowerCase()} ${top.plays} times and holds #${top.rank}. lives in ${top.city.toLowerCase()}${shared ? ` and is into ${shared} too` : ""}. want to challenge ${top.name.split(" ")[0].toLowerCase()} or say hi?`,
        },
      ];
    },
    1600,
  );
}

// ---------- 7. What does an @muse message want? ----------

export interface Intent {
  action: "make_game" | "edit_game" | "chat";
  game_id: string | null;
  request: string;
  reply: string;
}

export async function classify(text: string, author: string, games: { id: string; title: string }[], history: Message[]) {
  return live<Intent>(
    "classify",
    async () => {
      const { data } = await museJson<Intent>({
        model: "ember",
        effort: "low",
        instructions: `You are Muse in a friend group chat on Messenger. ${nameOf(author)} mentioned you. Decide:
- make_game: they want a new game made.
- edit_game: they want to change a game this chat already has (harder, new mode, new theme). Set game_id.
- chat: anything else. reply: short, lowercase, friendly.
request: their ask restated clearly. reply is "" unless action is chat.
Games in this chat: ${games.map((g) => `${g.id}: ${g.title}`).join(", ") || "none"}`,
        input: `Recent chat:\n${transcript(history.slice(-12))}\n\nMessage: ${text}`,
        schemaName: "intent",
        schema: obj({ action: { type: "string", enum: ["make_game", "edit_game", "chat"] }, game_id: nullable("string"), request: str, reply: str }),
        label: "classify",
      });
      return data;
    },
    () => {
      const q = text.replace(/@muse/i, "").trim();
      if (games.length && /\b(add|make it|change|harder|easier|faster|mode|level|update)\b/i.test(q))
        return { action: "edit_game", game_id: games[games.length - 1].id, request: q, reply: "" };
      if (/\bgame\b/i.test(q)) return { action: "make_game", game_id: null, request: q, reply: "" };
      return { action: "chat", game_id: null, request: q, reply: "i'm in offline mode right now, but i can still make you a game. just ask!" };
    },
    400,
  );
}
