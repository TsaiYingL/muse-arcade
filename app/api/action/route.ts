// Every tap and message goes through here. Long Muse work runs in the background; the phones see it over SSE.
import { reset } from "@/lib/server/store";
import {
  acceptChallenge, addRequest, buildGame, comment, confirmPublish, fanAction, importGame, runFans, runRequests, score, send, simulateDay,
  startPublish, toggleOptIn,
} from "@/lib/server/engine";
import type { Audience } from "@/lib/types";
export const dynamic = "force-dynamic";

type Body =
  | { type: "send"; chatId: string; author: string; text: string }
  | { type: "build"; chatId: string; author: string; request: string }
  | { type: "score"; gameId?: string; pubId?: string; version?: number; challengeMsg?: string; player: string; score: number }
  | { type: "startPublish"; gameId: string }
  | { type: "confirmPublish"; gameId: string; by: string; audience: Audience }
  | { type: "comment"; pubId: string; version: number; author: string; text: string }
  | { type: "addRequest"; msgId: string; label: string; by: string }
  | { type: "fan"; msgId: string; action: "challenge" | "hi"; by: string }
  | { type: "acceptChallenge"; msgId: string }
  | { type: "import"; pubId: string; version: number; chatId: string; by: string }
  | { type: "optIn"; player: string }
  | { type: "simulateDay"; pubId?: string }
  | { type: "requests"; pubId: string }
  | { type: "fans"; pubId: string }
  | { type: "reset" };

const str = (s: unknown, n = 2000) => String(s ?? "").slice(0, n);

export async function POST(req: Request) {
  const b = (await req.json()) as Body;
  switch (b.type) {
    case "send": void send(str(b.chatId), str(b.author), str(b.text)); break;
    case "build": void buildGame(str(b.chatId), str(b.request), str(b.author)); break;
    case "score": score({ gameId: b.gameId, pubId: b.pubId, version: b.version, challengeMsg: b.challengeMsg }, str(b.player), Number(b.score)); break;
    case "startPublish": void startPublish(str(b.gameId)); break;
    case "confirmPublish": confirmPublish(str(b.gameId), str(b.by), b.audience); break;
    case "comment": comment(str(b.pubId), Number(b.version), str(b.author), str(b.text, 300)); break;
    case "addRequest": addRequest(str(b.msgId), str(b.label), str(b.by)); break;
    case "fan": fanAction(str(b.msgId), b.action === "hi" ? "hi" : "challenge", str(b.by)); break;
    case "acceptChallenge": acceptChallenge(str(b.msgId)); break;
    case "import": void importGame(str(b.pubId), Number(b.version), str(b.chatId), str(b.by)); break;
    case "optIn": toggleOptIn(str(b.player)); break;
    case "simulateDay": void simulateDay(b.pubId); break;
    case "requests": void runRequests(str(b.pubId)); break;
    case "fans": void runFans(str(b.pubId)); break;
    case "reset": reset(); break;
  }
  return Response.json({ ok: true });
}
