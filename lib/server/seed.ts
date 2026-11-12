// Seed chats. Every person is fictional. The inside jokes here are what Muse weaves into the game
// (and what it has to strip out before anyone outside the chat sees it).
import type { Chat, Message } from "../types";

const H = 60 * 60 * 1000;
const D = 24 * H;

type Row = [number, string, string]; // [hours ago, author, text]

function msgs(chatId: string, rows: Row[], now: number): Message[] {
  return rows.map(([ago, author, text], i) => ({ id: `${chatId}-s${i}`, chatId, author, ts: now - ago * H, kind: "text", text }));
}

export function seedChats(now = Date.now()): Chat[] {
  const ramen: Row[] = [
    [8 * 24 + 3, "arun", "tatsu-ya tonight? i need it"],
    [8 * 24 + 2.9, "jay", "honestly tatsu-ya is mid"],
    [8 * 24 + 2.8, "priya", "jay you say everything is mid"],
    [8 * 24 + 2.7, "mia", "i'm in. getting the spicy one again 🌶️"],
    [8 * 24 - 1, "priya", "the egg. THE EGG. 11/10 i'm not being dramatic"],
    [8 * 24 - 1.1, "jay", "egg was mid"],
    [8 * 24 - 1.2, "arun", "jay rated his own birthday cake mid last year we can't trust him"],
    [6 * 24, "alex", "ok new rule: jay has to rate something above mid once this month"],
    [6 * 24 - 0.1, "jay", "the chashu at tatsu-ya was... fine"],
    [6 * 24 - 0.2, "priya", "FINE is basically a 10 from jay"],
    [4 * 24 + 5, "mia", "anyone tried the new place on cesar chavez?"],
    [4 * 24 + 4.9, "arun", "nothing beats tatsu-ya. i will die on this hill"],
    [4 * 24 + 4.8, "jay", "the hill is mid"],
    [2 * 24 + 2, "alex", "ramen night thursday? i'm making a list"],
    [2 * 24 + 1.9, "priya", "only if we get extra eggs"],
    [2 * 24 + 1.8, "mia", "spicy for me obviously"],
    [26, "jay", "i'll come but i'm rating it in advance: mid"],
    [3, "arun", "we need a ramen council game at this point"],
    [2.9, "mia", "LOL yes. dodge jay's mid ratings"],
    [2.8, "priya", "and the egg has to be worth like a million points"],
  ];
  const taco: Row[] = [
    [5 * 24, "diego", "veracruz migas tacos sunday. non-negotiable"],
    [5 * 24 - 0.1, "kenji", "no cilantro on mine. it tastes like soap"],
    [5 * 24 - 0.2, "amara", "kenji every week 😂 i'm getting two"],
    [5 * 24 - 0.3, "ellie", "bringing my habanero salsa, it's illegal levels of hot"],
    [3 * 24, "diego", "best taco in austin is veracruz and i won't hear otherwise"],
    [3 * 24 - 0.1, "kenji", "cilantro still tastes like soap btw"],
    [3 * 24 - 0.2, "amara", "ordering two again"],
    [1 * 24, "ellie", "my salsa made diego cry last time. bringing it again"],
    [20, "diego", "taco tuesday this week? same spot"],
    [19.9, "amara", "yes. two orders. obviously"],
  ];
  return [
    { id: "ramen", title: "the ramen council 🍜", members: ["alex", "arun", "jay", "mia", "priya"], messages: msgs("ramen", ramen, now), typing: {} },
    { id: "taco", title: "taco tuesday 🌮", members: ["diego", "ellie", "kenji", "amara"], messages: msgs("taco", taco, now), typing: {} },
  ];
}

export const DAY = D;
