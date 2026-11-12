// Live state shared by every phone, with change notifications for SSE. One process, kept on globalThis
// (survives hot reload) and snapshotted to DATA_DIR/state.json so a restart keeps everything.
import fs from "node:fs";
import path from "node:path";
import type { Chat, Game, LiveState, Message, Published, PublishDraft } from "../types";
import { STRANGERS } from "../world";
import { seedChats } from "./seed";

type Listener = (s: LiveState) => void;

interface Store {
  state: LiveState;
  listeners: Set<Listener>;
  timer: ReturnType<typeof setTimeout> | null;
  seq: number;
  epoch: number; // bumps on reset so in-flight Muse work stops writing
}

function fresh(): LiveState {
  return { chats: seedChats(), games: [], pubs: [], players: STRANGERS.map((p) => ({ ...p })), drafts: [], rev: 0, museOnline: null };
}

const FILE = path.join(process.env.DATA_DIR ?? path.join(process.cwd(), "data"), "state.json");

function load(): { state: LiveState; seq: number } {
  try {
    const saved = JSON.parse(fs.readFileSync(FILE, "utf8")) as { state: LiveState; seq: number };
    for (const c of saved.state.chats) c.typing = {};
    for (const g of saved.state.games) if (g.status === "building" || g.status === "editing") g.status = g.html ? "ready" : "error";
    saved.state.drafts = saved.state.drafts.filter((d) => d.status === "ready");
    for (const p of saved.state.pubs) if (p.requestsStatus === "reading") p.requestsStatus = p.requests.length ? "ready" : "idle";
    return saved;
  } catch {
    return { state: fresh(), seq: 1000 };
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
function persist() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      fs.mkdirSync(path.dirname(FILE), { recursive: true });
      const tmp = FILE + ".tmp";
      fs.writeFileSync(tmp, JSON.stringify({ state: store.state, seq: store.seq }));
      fs.renameSync(tmp, FILE);
    } catch (e) {
      console.error("[store] save failed", e);
    }
  }, 800);
}

const g = globalThis as unknown as { __arcadeStore?: Store };
const store: Store = (g.__arcadeStore ??= (() => {
  const { state, seq } = load();
  return { state, listeners: new Set<Listener>(), timer: null, seq, epoch: 0 };
})());

export const S = () => store.state;
export const epoch = () => store.epoch;

export function subscribe(fn: Listener) {
  store.listeners.add(fn);
  return () => store.listeners.delete(fn);
}

export function changed() {
  store.state.rev++;
  persist();
  if (store.timer) return;
  store.timer = setTimeout(() => {
    store.timer = null;
    for (const l of store.listeners) l(store.state);
  }, 80);
}

export const newId = (p: string) => `${p}${++store.seq}`;

export const chat = (id: string) => store.state.chats.find((c) => c.id === id);
export const game = (id: string) => store.state.games.find((x) => x.id === id);
export const pub = (id: string) => store.state.pubs.find((x) => x.id === id);
export const draft = (gameId: string) => store.state.drafts.find((d) => d.gameId === gameId);

export function post(chatId: string, m: Omit<Message, "id" | "ts" | "chatId"> & { ts?: number }): Message {
  const c = chat(chatId)!;
  const msg: Message = { id: newId("m"), chatId, ts: m.ts ?? Date.now(), ...m };
  c.messages.push(msg);
  changed();
  return msg;
}

export function findMsg(id: string): Message | undefined {
  for (const c of store.state.chats) {
    const m = c.messages.find((x) => x.id === id);
    if (m) return m;
  }
}

export function typing(chatId: string, who: string, label: string | null) {
  const c = chat(chatId);
  if (!c) return;
  if (label) c.typing[who] = label;
  else delete c.typing[who];
  changed();
}

export function addGame(x: Game) {
  store.state.games.push(x);
  changed();
}
export function addPub(x: Published) {
  store.state.pubs.push(x);
  changed();
}
export function addChat(x: Chat) {
  store.state.chats.push(x);
  changed();
}
export function setDraft(d: PublishDraft) {
  store.state.drafts = store.state.drafts.filter((x) => x.gameId !== d.gameId);
  store.state.drafts.push(d);
  changed();
}

export function setOnline(v: boolean) {
  if (store.state.museOnline === v) return;
  store.state.museOnline = v;
  changed();
}

export function reset() {
  store.state = fresh();
  store.epoch++;
  changed();
}
