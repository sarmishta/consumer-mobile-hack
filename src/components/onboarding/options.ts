import { GOAL_TYPES } from "../../lib/theme";
import type { SymbolName } from "../ui";

export type GoalType = (typeof GOAL_TYPES)[number];
export type GroupKind = "friends" | "family" | "partner" | "roommates";

export const GOAL_DEFAULTS: Record<GoalType, { label: string; goal: string; emoji: string }> = {
  move: { label: "Move", goal: "Move for 30 min", emoji: "🏃" },
  read: { label: "Read", goal: "Read 20 pages", emoji: "📚" },
  "eat better": { label: "Eat better", goal: "Eat one real veggie meal", emoji: "🥗" },
  sleep: { label: "Sleep", goal: "In bed by 11", emoji: "😴" },
  "save money": { label: "Save money", goal: "No-spend day", emoji: "💰" },
  "call family": { label: "Call family", goal: "Call someone I love", emoji: "📞" },
  custom: { label: "Something else", goal: "", emoji: "🌱" },
};

export const KINDS: { kind: GroupKind; label: string; icon: SymbolName }[] = [
  { kind: "friends", label: "Friends", icon: "person.2" },
  { kind: "family", label: "Family", icon: "house" },
  { kind: "partner", label: "Partner", icon: "heart" },
  { kind: "roommates", label: "Roommates", icon: "sofa" },
];

export const NUDGE_TIMES = [
  { value: "07:00", label: "7 am", icon: "sunrise" },
  { value: "12:00", label: "12 pm", icon: "sun.max" },
  { value: "18:00", label: "6 pm", icon: "sunset" },
  { value: "21:00", label: "9 pm", icon: "moon" },
] as const satisfies readonly { value: string; label: string; icon: SymbolName }[];

export type StakeKind = "hangout" | "treat" | "favor" | "dare";

/** What a missed day costs. Examples finish the sentence "Jordan owes the crew …". */
export const STAKE_KINDS: { kind: StakeKind; label: string; icon: SymbolName; examples: string[] }[] = [
  { kind: "hangout", label: "A hangout", icon: "person.2.fill", examples: ["tacos", "coffee", "a movie night"] },
  { kind: "treat", label: "A treat", icon: "gift.fill", examples: ["the next coffee", "snacks for game night"] },
  { kind: "favor", label: "A favor", icon: "hand.raised.fill", examples: ["a night of dishes", "an airport ride"] },
  { kind: "dare", label: "A dare", icon: "bolt.fill", examples: ["a karaoke song", "a cold plunge"] },
];

export function testIdSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

/** Normalizes a typed phone number to E.164, assuming +1 when there is no country code. Returns null when it can't. */
export function toE164(raw: string) {
  const digits = raw.replace(/\D/g, "");
  let e164: string;
  if (raw.trim().startsWith("+")) e164 = "+" + digits;
  else if (digits.length === 10) e164 = "+1" + digits;
  else if (digits.length === 11 && digits.startsWith("1")) e164 = "+" + digits;
  else return null;
  return /^\+[1-9]\d{7,14}$/.test(e164) ? e164 : null;
}
