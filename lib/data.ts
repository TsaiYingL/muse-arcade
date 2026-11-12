// All fake data for the mockup lives here. Every person is fictional and every avatar is generated.
import { STRANGERS } from "./world";

export type Person = {
  id: string;
  name: string;
  first: string;
  seed: number; // drives the generated avatar
  active?: boolean;
  activeLabel?: string; // e.g. "Active now", "Active 12m ago"
};

export type Msg = {
  id: string;
  from: "me" | string; // person id
  text?: string;
  image?: { seed: number; w: number; h: number };
  sep?: string; // centered timestamp shown above this message
  reacts?: string[]; // emoji shown in the reaction pill
  reactCount?: number; // shown when > 1
  replyLabel?: string; // "Maya replied to you"
};

export type Chat = {
  id: string;
  kind: "dm" | "group";
  name: string;
  members: string[]; // person ids (excluding me)
  preview: string; // inbox preview text (already prefixed with "You:" / "Name:" where needed)
  time: string; // inbox timestamp, e.g. "9:41 am", "Fri"
  unread?: boolean;
  verified?: boolean;
  typing?: string; // person id currently typing
  seenBy?: string[]; // read receipts under the last outgoing message
  messages: Msg[];
};

export const ME: Person = { id: "me", name: "Alex Rivera", first: "Alex", seed: 7 };

/** The phone's owner. Set once at startup from ?as= (each phone in the demo is a different person). */
export function setMe(id: string) {
  const p = PEOPLE[id];
  if (p) Object.assign(ME, { name: p.name, first: p.first, seed: p.seed });
}

export const PEOPLE: Record<string, Person> = Object.fromEntries(
  (
    [
      { id: "maya", name: "Maya Okafor", first: "Maya", seed: 11, active: true, activeLabel: "Active now" },
      { id: "jordan", name: "Jordan Reyes", first: "Jordan", seed: 23, active: true, activeLabel: "Active now" },
      { id: "priya", name: "Priya Natarajan", first: "Priya", seed: 5, activeLabel: "Active 12m ago" },
      { id: "theo", name: "Theo Brennan", first: "Theo", seed: 31, active: true, activeLabel: "Active now" },
      { id: "sofia", name: "Sofia Marchetti", first: "Sofia", seed: 42, activeLabel: "Active 1h ago" },
      { id: "kenji", name: "Kenji Watanabe", first: "Kenji", seed: 18, activeLabel: "Active 3h ago" },
      { id: "amara", name: "Amara Diallo", first: "Amara", seed: 56, active: true, activeLabel: "Active now" },
      { id: "lucas", name: "Lucas Fernández", first: "Lucas", seed: 63 },
      { id: "hannah", name: "Hannah Kowalski", first: "Hannah", seed: 9 },
      { id: "diego", name: "Diego Alvarez", first: "Diego", seed: 77, active: true, activeLabel: "Active now" },
      { id: "noor", name: "Noor Haddad", first: "Noor", seed: 88 },
      { id: "sam", name: "Sam Haddad", first: "Sam", seed: 34 },
      { id: "leila", name: "Leila Haddad", first: "Leila", seed: 47 },
      { id: "ellie", name: "Ellie Park", first: "Ellie", seed: 71, active: true, activeLabel: "Active now" },
      { id: "marcus", name: "Marcus Bell", first: "Marcus", seed: 92 },
      // members of the live Muse group ("the ramen council"), backed by ../web
      { id: "arun", name: "Arun", first: "Arun", seed: 14, active: true, activeLabel: "Active now" },
      { id: "jay", name: "Jay", first: "Jay", seed: 27, active: true, activeLabel: "Active now" },
      { id: "mia", name: "Mia", first: "Mia", seed: 61, activeLabel: "Active 5m ago" },
      // demo personas and the strangers who play published games
      { id: "alex", name: "Alex Rivera", first: "Alex", seed: 7 },
      { id: "dana", name: "Dana Whitfield", first: "Dana", seed: 101, active: true, activeLabel: "Active now" },
      { id: "lena", name: "Lena Fischer", first: "Lena", seed: 58 },
      ...STRANGERS.filter((p) => p.id.startsWith("p_")).map((p) => ({ id: p.id, name: p.name, first: p.name.split(" ")[0], seed: p.seed })),
    ] as Person[]
  ).map((p) => [p.id, p]),
);

export const person = (id: string): Person => (id === "me" ? ME : PEOPLE[id]);

// Compact message builder: [from, text, extras?]
type Row = [string, string | null, Partial<Msg>?];
let n = 0;
const thread = (rows: Row[]): Msg[] =>
  rows.map(([from, text, extra]) => ({ id: `m${n++}`, from, ...(text ? { text } : {}), ...extra }));

export const CHATS: Chat[] = [
  {
    id: "maya",
    kind: "dm",
    name: "Maya Okafor",
    members: ["maya"],
    preview: "omg yes!! send me the link",
    time: "9:41 am",
    unread: true,
    typing: "maya",
    messages: thread([
      ["maya", "are you still coming saturday?", { sep: "Yesterday 8:12 PM" }],
      ["me", "yesss wouldn't miss it"],
      ["me", "what time are we meeting?"],
      ["maya", "like 6:30? the place opens at 7"],
      ["maya", "I'll grab a table on the patio if it's not raining"],
      ["me", "perfect 🙌", { reacts: ["❤️"] }],
      ["maya", "also did you finish the book??", { sep: "Today 9:02 AM" }],
      ["me", "just the last chapter left"],
      ["me", "don't spoil it I'm begging you"],
      ["maya", "my lips are sealed 🤐"],
      ["maya", "ok but the ending… you're gonna scream"],
      ["me", "MAYA"],
      ["maya", "😂😂 I said nothing!", { reacts: ["😆"] }],
      ["me", "anyway I found tickets for that pottery class you wanted"],
      ["me", "it's on the 22nd, two spots left"],
      ["maya", null, { image: { seed: 4, w: 220, h: 280 }, replyLabel: "Maya replied to you" }],
      ["maya", "this one?? the wheel throwing one?"],
      ["me", "that's the one"],
      ["me", "should I book both?"],
      ["maya", "omg yes!! send me the link", { sep: "9:41 AM" }],
    ]),
  },
  {
    id: "hike",
    kind: "group",
    name: "Weekend Hike 🥾",
    members: ["jordan", "priya", "theo", "ellie"],
    preview: "Priya: I'll bring the trail mix",
    time: "9:12 am",
    unread: true,
    seenBy: ["jordan", "theo"],
    messages: thread([
      ["jordan", "ok who's actually in for sunday", { sep: "Thu 6:45 PM" }],
      ["theo", "me 🙋‍♂️"],
      ["ellie", "in! as long as we're not starting at 5am again"],
      ["jordan", "no promises 😅", { reacts: ["😆", "😮"], reactCount: 3 }],
      ["priya", "I'm in but I need a ride"],
      ["me", "I can drive, I've got 2 seats"],
      ["priya", "you're the best"],
      ["theo", "which trail are we thinking?", { sep: "Fri 10:20 AM" }],
      ["jordan", "Cedar Ridge loop, it's like 7 miles"],
      ["jordan", null, { image: { seed: 2, w: 240, h: 170 } }],
      ["jordan", "the view at the top is unreal"],
      ["ellie", "ok that's gorgeous", { reacts: ["❤️"], reactCount: 2 }],
      ["me", "how steep is it though"],
      ["theo", "it's fine, there's a waterfall halfway so you get a break"],
      ["ellie", "sold"],
      ["jordan", "meet at the trailhead at 8?", { sep: "Today 8:55 AM" }],
      ["me", "works for me 👍"],
      ["theo", "👍"],
      ["ellie", "I'll bring sandwiches"],
      ["priya", "I'll bring the trail mix"],
    ]),
  },
  {
    id: "jordan",
    kind: "dm",
    name: "Jordan Reyes",
    members: ["jordan"],
    preview: "You: haha deal",
    time: "8:47 am",
    seenBy: ["jordan"],
    messages: thread([
      ["jordan", "did you see the game last night", { sep: "Tue 9:58 PM" }],
      ["me", "I fell asleep at halftime 😭"],
      ["jordan", "you missed the best comeback of the season"],
      ["jordan", "down by 18 and they won by 3"],
      ["me", "no way"],
      ["me", "I'm watching the highlights rn"],
      ["jordan", "the last 2 minutes are insane"],
      ["me", "ok that buzzer beater 🤯", { reacts: ["🔥"] }],
      ["jordan", "right??"],
      ["jordan", "we should go to a game this month", { sep: "Today 8:30 AM" }],
      ["me", "I'm down, when?"],
      ["jordan", "there's a home game on the 19th"],
      ["jordan", "tickets are actually reasonable"],
      ["me", "let's do it"],
      ["me", "I'll get food after, you get the tickets?"],
      ["jordan", "deal but you're buying the nachos too"],
      ["me", "haha deal"],
    ]),
  },
  {
    id: "roommates",
    kind: "group",
    name: "Roommates 🏠",
    members: ["theo", "sofia", "kenji"],
    preview: "Kenji: who ate my leftovers 😤",
    time: "8:03 am",
    messages: thread([
      ["sofia", "reminder: rent is due friday!", { sep: "Mon 7:15 PM" }],
      ["theo", "sent ✅"],
      ["me", "sent mine too"],
      ["kenji", "will send tonight"],
      ["sofia", "also the landlord is coming wednesday to fix the sink"],
      ["theo", "finally 🙏", { reacts: ["🙏"], reactCount: 2 }],
      ["me", "can someone grab paper towels? we're out", { sep: "Wed 6:02 PM" }],
      ["sofia", "on it, I'm at the store now"],
      ["sofia", "need anything else?"],
      ["me", "dish soap maybe"],
      ["theo", "and ice cream 🍦"],
      ["sofia", "that's not a need theo"],
      ["theo", "it's a need", { reacts: ["😆"], reactCount: 3 }],
      ["kenji", "movie night friday?", { sep: "Thu 9:40 PM" }],
      ["me", "yes! I'll make popcorn"],
      ["sofia", "I vote something scary"],
      ["theo", "absolutely not"],
      ["kenji", "who ate my leftovers 😤", { sep: "Today 8:03 AM" }],
    ]),
  },
  {
    id: "hackathon",
    kind: "group",
    name: "Hackathon Squad",
    members: ["amara", "lucas", "hannah", "diego"],
    preview: "Lucas: demo in 20 min!!",
    time: "7:28 am",
    unread: true,
    messages: thread([
      ["amara", "ok team, final plan for today", { sep: "Today 6:50 AM" }],
      ["amara", "frontend freeze at 11, demo at 2"],
      ["diego", "backend is deployed 🚀", { reacts: ["🔥", "❤️"], reactCount: 4 }],
      ["hannah", "nice!! the API is so much faster now"],
      ["me", "I'm fixing the last layout bug on the inbox"],
      ["lucas", "do we have slides yet?"],
      ["amara", "I made a draft last night, sharing now"],
      ["hannah", "I can record the backup video"],
      ["amara", "perfect, thank you"],
      ["diego", "coffee run? I'm going downstairs"],
      ["me", "oat latte please 🙏"],
      ["lucas", "same"],
      ["hannah", "cold brew!"],
      ["diego", "got it ☕"],
      ["amara", "how's the bug going?"],
      ["me", "fixed! pushing now"],
      ["amara", "you're a legend", { reacts: ["😆"] }],
      ["hannah", "the build looks great on my phone"],
      ["diego", "back with coffee"],
      ["lucas", "demo in 20 min!!"],
    ]),
  },
  {
    id: "priya",
    kind: "dm",
    name: "Priya Natarajan",
    members: ["priya"],
    preview: "Sent a photo",
    time: "Wed",
    messages: thread([
      ["me", "how was the trip??", { sep: "Wed 4:20 PM" }],
      ["priya", "honestly the best week ever"],
      ["priya", "the food alone was worth it"],
      ["me", "I need to see pics"],
      ["priya", "ok here's my favorite"],
      ["priya", null, { image: { seed: 7, w: 230, h: 300 }, reacts: ["😍"] }],
      ["me", "STOP that's beautiful"],
      ["me", "where is that?"],
      ["priya", "a little cove we found on the last day"],
      ["priya", "we were the only people there"],
      ["me", "adding it to my list"],
      ["priya", "I'll send you the whole itinerary"],
      ["me", "yes please 🙏"],
      ["priya", "also I brought you something"],
      ["me", "you didn't have to!!"],
      ["priya", "it's small don't get excited 😂"],
      ["me", "too late"],
      ["priya", null, { image: { seed: 12, w: 220, h: 220 } }],
    ]),
  },
  {
    id: "sofia",
    kind: "dm",
    name: "Sofia Marchetti",
    members: ["sofia"],
    preview: "Thanks for yesterday ❤️",
    time: "Mon",
    messages: thread([
      ["sofia", "are you around this weekend?", { sep: "Sat 11:04 AM" }],
      ["me", "yeah, what's up?"],
      ["sofia", "I'm moving the bookshelf and could use a hand"],
      ["me", "of course, what time?"],
      ["sofia", "sunday around 2?"],
      ["me", "see you then"],
      ["sofia", "I'll make lunch as payment 🍝", { reacts: ["❤️"] }],
      ["me", "you know the way to my heart"],
      ["sofia", "I'm outside btw", { sep: "Sun 1:58 PM" }],
      ["me", "coming down!"],
      ["sofia", "that went way faster than I thought", { sep: "Sun 5:30 PM" }],
      ["me", "the shelf looks great there"],
      ["sofia", "finally the living room feels done"],
      ["me", "and the pasta was 10/10"],
      ["sofia", "I'll send you the recipe"],
      ["sofia", "Thanks for yesterday ❤️", { sep: "Mon 9:12 AM" }],
    ]),
  },
  {
    id: "family",
    kind: "group",
    name: "Family 💛",
    members: ["noor", "sam", "leila"],
    preview: "Leila: Dinner at 7 on Sunday?",
    time: "Sun",
    messages: thread([
      ["noor", "Good morning everyone ☀️", { sep: "Sat 8:01 AM" }],
      ["sam", "morning!"],
      ["leila", "morning 💛"],
      ["noor", "Did everyone see the photos from the garden?"],
      ["noor", null, { image: { seed: 9, w: 230, h: 230 }, reacts: ["❤️", "😍"], reactCount: 3 }],
      ["me", "the tomatoes look amazing this year"],
      ["sam", "Dad's been out there every day lol"],
      ["noor", "He's very proud 😄"],
      ["leila", "we need to come pick some"],
      ["noor", "Come this weekend! There's too many"],
      ["me", "I can come sunday afternoon"],
      ["sam", "same"],
      ["leila", "should we just do dinner?", { sep: "Sun 10:30 AM" }],
      ["noor", "Yes! I'll make the big pot of soup"],
      ["me", "I'll bring dessert 🍰"],
      ["sam", "I'll bring... myself"],
      ["leila", "classic sam", { reacts: ["😆"], reactCount: 2 }],
      ["leila", "Dinner at 7 on Sunday?"],
    ]),
  },
  {
    id: "kenji",
    kind: "dm",
    name: "Kenji Watanabe",
    members: ["kenji"],
    preview: "You: see you there",
    time: "Sat",
    seenBy: ["kenji"],
    messages: thread([
      ["kenji", "climbing gym later?", { sep: "Sat 12:10 PM" }],
      ["me", "my forearms are still dead from tuesday"],
      ["kenji", "that means it's working 💪"],
      ["me", "that's not how it works"],
      ["kenji", "pretty sure it is"],
      ["kenji", "they just reset the bouldering wall"],
      ["kenji", "new V3s"],
      ["me", "ok that's tempting"],
      ["me", "what time?"],
      ["kenji", "5? after it gets less busy"],
      ["me", "ok I'm in"],
      ["kenji", "bring chalk, I'm out"],
      ["me", "of course you are 😂", { reacts: ["😆"] }],
      ["kenji", "I'll buy you a smoothie after"],
      ["me", "see you there"],
    ]),
  },
  {
    id: "ellie",
    kind: "dm",
    name: "Ellie Park",
    members: ["ellie"],
    preview: "Reacted 😂 to your message",
    time: "Fri",
    messages: thread([
      ["ellie", "do you have a good plant shop recommendation?", { sep: "Fri 2:14 PM" }],
      ["me", "Greenhouse on 5th is my favorite"],
      ["me", "the owner gives the best care tips"],
      ["ellie", "omg perfect, I keep killing my pothos 😭"],
      ["me", "are you overwatering it?"],
      ["ellie", "...maybe"],
      ["me", "once a week max!"],
      ["ellie", "noted 📝"],
      ["ellie", "ok I went", { sep: "Fri 5:40 PM" }],
      ["ellie", null, { image: { seed: 15, w: 220, h: 260 } }],
      ["ellie", "I may have bought 4 plants"],
      ["me", "that's how it starts"],
      ["me", "next thing you know you have a jungle", { reacts: ["😂"] }],
    ]),
  },
];

export const NOTES: { id: string; note?: string; music?: boolean }[] = [
  { id: "me", note: "Post a note" },
  { id: "maya", note: "pottery class era 🏺" },
  { id: "diego", note: "|ı| Golden Hour · Sunset Drive", music: true },
  { id: "jordan", note: "anyone up for pickup ball?" },
  { id: "amara", note: "demo day!!" },
  { id: "theo" },
  { id: "ellie" },
];

// --- Facebook home ---
export const STORIES = [
  { id: "maya", scene: 3 },
  { id: "diego", scene: 5 },
  { id: "ellie", scene: 8 },
  { id: "kenji", scene: 1 },
  { id: "priya", scene: 6 },
];

export const POSTS = [
  {
    id: "p1",
    author: "marcus",
    meta: "Lake Tahoe · 9h",
    text: "Finally made it up here before the snow. Worth every switchback 🏔️",
    scene: 0,
    likes: "1.2K",
    comments: "184",
    shares: "57",
  },
  {
    id: "p2",
    author: "sofia",
    meta: "2h",
    text: "Sunday project: done. The living room finally feels like home ✨",
    scene: 10,
    likes: "248",
    comments: "31",
    shares: "4",
  },
];
