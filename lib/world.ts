// The fictional world shared by server and client: who the demo personas are and who can see what.
import type { Audience, AudienceOption, Persona, PersonaId, Player } from "./types";

export const CREATOR_CITY = "Austin";
export const CREATOR_CAMPUS = "UT Austin";
export const LOCAL_GROUP = "Austin Food Lovers";

export const PERSONAS: Record<PersonaId, Persona> = {
  alex: { id: "alex", name: "Alex Rivera", city: "Austin", campus: "UT Austin", groups: [LOCAL_GROUP], friendOfChats: ["ramen"] },
  dana: { id: "dana", name: "Dana Whitfield", city: "Austin", campus: null, groups: [LOCAL_GROUP], friendOfChats: [] },
  diego: { id: "diego", name: "Diego Alvarez", city: "Austin", campus: "UT Austin", groups: [], friendOfChats: [] },
  lena: { id: "lena", name: "Lena Fischer", city: "Chicago", campus: null, groups: [], friendOfChats: [] },
};

export const PERSONA_BLURB: Record<PersonaId, string> = {
  alex: "in the ramen council (the creators)",
  dana: "a stranger in Austin",
  diego: "in a different group chat, taco tuesday",
  lena: "lives in Chicago",
};

export const AUDIENCES: AudienceOption[] = [
  { id: "friends", label: "Our friends", detail: "Friends of anyone in this chat", reach: 312 },
  { id: "fof", label: "Friends of friends", detail: "One step further out", reach: 18400 },
  { id: "city", label: `People in ${CREATOR_CITY}`, detail: "Anyone on Facebook who lives nearby", reach: 410000 },
  { id: "campus", label: `${CREATOR_CAMPUS} students`, detail: "Verified students only", reach: 52000 },
  { id: "group", label: LOCAL_GROUP, detail: "Members of this Facebook Group", reach: 86000 },
  { id: "everyone", label: "Everyone", detail: "Public on Facebook", reach: 0 },
];

export const audienceLabel = (a: Audience) => AUDIENCES.find((x) => x.id === a)?.label ?? a;

export function canSee(p: Persona, audience: Audience, creatorChat: string, creatorMembers: string[]) {
  if (creatorMembers.includes(p.id)) return true;
  switch (audience) {
    case "friends":
    case "fof":
      return p.friendOfChats.includes(creatorChat);
    case "city":
      return p.city === CREATOR_CITY;
    case "campus":
      return p.campus === CREATOR_CAMPUS;
    case "group":
      return p.groups.includes(LOCAL_GROUP);
    case "everyone":
      return true;
  }
}

export const fmtReach = (n: number) => (n === 0 ? "Anyone" : n >= 1000 ? `~${(n / 1000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, "")}K people` : `~${n} people`);

/** Fictional Austin players who show up when strangers start playing (director "a day passes"). */
export const STRANGERS: Player[] = [
  { id: "dana", name: "Dana Whitfield", seed: 101, city: "Austin", optIn: true, likes: ["ramen", "food trucks", "arcade games"] },
  { id: "diego", name: "Diego Alvarez", seed: 77, city: "Austin", optIn: false, likes: ["tacos"] },
  { id: "lena", name: "Lena Fischer", seed: 58, city: "Chicago", optIn: false, likes: [] },
  { id: "p_marisol", name: "Marisol Vega", seed: 121, city: "Austin", optIn: true, likes: ["pho", "running"] },
  { id: "p_tyler", name: "Tyler Brooks", seed: 133, city: "Austin", optIn: false, likes: ["bbq"] },
  { id: "p_june", name: "June Park", seed: 145, city: "Austin", optIn: true, likes: ["ramen", "board games"] },
  { id: "p_omar", name: "Omar Siddiqui", seed: 157, city: "Austin", optIn: true, likes: ["coffee", "climbing"] },
  { id: "p_kate", name: "Kate Lindqvist", seed: 169, city: "Austin", optIn: false, likes: [] },
  { id: "p_raj", name: "Raj Mehta", seed: 181, city: "Austin", optIn: true, likes: ["ramen", "trivia"] },
  { id: "p_bea", name: "Bea Thompson", seed: 193, city: "Austin", optIn: false, likes: ["brunch"] },
  { id: "p_luis", name: "Luis Ortega", seed: 205, city: "Austin", optIn: true, likes: ["soccer"] },
  { id: "p_ivy", name: "Ivy Chen", seed: 217, city: "Austin", optIn: true, likes: ["dumplings", "anime"] },
  { id: "p_nate", name: "Nate Adler", seed: 229, city: "Austin", optIn: false, likes: [] },
  { id: "p_zoe", name: "Zoe Kim", seed: 241, city: "Austin", optIn: true, likes: ["ramen", "speedruns"] },
];

export const CHAT_MEMBERS_SEEDS: Record<string, number> = { alex: 7 };
