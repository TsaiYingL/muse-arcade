// Shared types: the live state every phone receives over SSE.

export type PersonaId = "alex" | "dana" | "diego" | "lena";

export interface Persona {
  id: PersonaId;
  name: string;
  city: string;
  campus: string | null;
  groups: string[]; // Facebook Groups they're in
  friendOfChats: string[]; // live chats where they're friends with a member
}

export type Audience = "friends" | "fof" | "city" | "campus" | "group" | "everyone";

export interface AudienceOption {
  id: Audience;
  label: string;
  detail: string;
  reach: number;
}

export interface Change {
  before: string;
  after: string;
  why: string;
}

/** A game that lives inside one group chat. Its owners can keep editing it. */
export interface Game {
  id: string;
  chatId: string;
  title: string;
  emoji: string;
  tagline: string;
  html: string;
  status: "building" | "editing" | "ready" | "error";
  phase: string;
  createdBy: string;
  createdAt: number;
  rev: number; // bumps on every edit
  edits: { request: string; summary: string; ts: number }[];
  touches: string[]; // inside jokes / chat details Muse wove in
  origin?: { pubId: string; version: number; title: string; fromChat: string; changes: Change[] };
  publishedRev?: number; // rev of the latest published snapshot
  pubId?: string; // set once the game has been published
  best?: { by: string; score: number };
  offline?: boolean; // built from the scripted fallback, not live Muse
  cfg?: string; // fallback template key, when the fallback built it
}

export interface Comment {
  id: string;
  author: string; // player id
  text: string;
  ts: number;
}

export interface Play {
  player: string;
  score: number;
  ts: number;
}

/** A frozen snapshot. Never edited after publishing. */
export interface PubVersion {
  v: number;
  title: string;
  description: string;
  html: string;
  changes: Change[];
  notes: string[]; // patch notes (v2+)
  audience: Audience;
  publishedAt: number;
  publishedBy: string;
  plays: Play[];
  comments: Comment[];
}

export interface Request {
  label: string;
  count: number;
  quote: string;
  players: string[];
}

export interface Published {
  id: string;
  gameId: string;
  chatId: string; // the creators' chat
  emoji: string;
  versions: PubVersion[];
  imports: { chatId: string; title: string; ts: number }[];
  requests: Request[];
  requestsStatus: "idle" | "reading" | "ready";
  offered: string[]; // request labels Muse already offered to the creators
  fansShown: string[]; // players Muse already introduced
}

export interface Player {
  id: string;
  name: string;
  seed: number;
  city: string;
  optIn: boolean; // "Let creators of games I play reach out"
  likes: string[];
}

export interface PublishDraft {
  gameId: string;
  rev: number;
  status: "working" | "ready" | "error";
  phase: string;
  title?: string;
  description?: string;
  html?: string;
  changes?: Change[];
  audience?: Audience;
  audienceReason?: string;
  safety?: { ok: boolean; notes: string };
  error?: string;
}

export type MessageKind = "text" | "muse" | "game" | "requests" | "fan" | "published" | "challenge" | "score";

export interface Message {
  id: string;
  chatId: string;
  author: string;
  ts: number;
  kind: MessageKind;
  text?: string;
  gameId?: string;
  pubId?: string;
  version?: number;
  requests?: { label: string; count: number; status: "open" | "adding" | "added" }[];
  fan?: { player: string; why: string; intro: string; plays: number; best: number; status: "open" | "challenged" | "said_hi" };
  challenge?: { fromChat: string; pubId: string; version: number; target: number; status: "open" | "accepted"; result?: number };
  score?: number;
}

export interface Chat {
  id: string;
  title: string;
  members: string[];
  messages: Message[];
  typing: Record<string, string>;
  request?: boolean; // shows in the recipient's message requests
}

export interface LiveState {
  chats: Chat[];
  games: Game[];
  pubs: Published[];
  players: Player[];
  drafts: PublishDraft[];
  rev: number;
  museOnline: boolean | null;
}
