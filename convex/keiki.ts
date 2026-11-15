import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (raw.trim().startsWith("+") && digits.length >= 8 && digits.length <= 15) return `+${digits}`;
  return null;
}

export async function secretsMatch(given: string, expected: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(given)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  const x = new Uint8Array(a);
  const y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

export function replyFor(alreadyCheckedIn: boolean, streak: number): string {
  const days = streak === 1 ? "Day one" : `${streak}-day streak`;
  if (alreadyCheckedIn) return `Already logged today. ${days}, still going.`;
  return `Logged. ${days}. Bad days, good nights.`;
}

export const memberByPhone = internalQuery({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .unique();
    if (!user) return { status: "unknown_phone" as const };
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();
    if (!member) return { status: "no_group" as const };
    return { status: "ok" as const, memberId: member._id };
  },
});

export const checkinSummary = internalQuery({
  args: { memberId: v.id("members") },
  handler: async (ctx, args) => {
    const member = await ctx.db.get("members", args.memberId);
    if (!member) return null;
    const user = await ctx.db.get("users", member.userId);
    return { name: user?.name ?? null, goal: member.goal ?? null, streak: member.streak };
  },
});

export const seedTestUser = internalMutation({
  args: { phone: v.string(), name: v.string(), goal: v.optional(v.string()), today: v.string() },
  handler: async (ctx, args) => {
    const phone = normalizePhone(args.phone);
    if (!phone) throw new Error("Invalid phone");
    const userId = await ctx.db.insert("users", { name: args.name, avatar: "🌧️", phone });
    const groupId = await ctx.db.insert("groups", {
      name: "Keiki test crew",
      inviteCode: `KT${Math.floor(Math.random() * 1e6)}`,
      kind: "friends",
      currentDay: args.today,
    });
    const memberId = await ctx.db.insert("members", {
      groupId,
      userId,
      goal: args.goal,
      emoji: "🏃",
      streak: 0,
    });
    return { userId, groupId, memberId, phone };
  },
});
