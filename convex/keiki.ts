import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { recordCheckIn } from "./checkins";

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

export function replyForCrews(results: { groupName: string; alreadyCheckedIn: boolean; streak: number }[]): string {
  if (results.length === 1) return replyFor(results[0].alreadyCheckedIn, results[0].streak);
  if (results.every((r) => r.alreadyCheckedIn)) return `Already logged today in all ${results.length} crews.`;
  const parts = results.map((r) => {
    const days = r.streak === 1 ? "day one" : `${r.streak}-day streak`;
    return `${r.groupName} (${r.alreadyCheckedIn ? "already in" : days})`;
  });
  return `Logged for ${parts.join(", ")}. Bad days, good nights.`;
}

export const memberByPhone = internalQuery({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .order("desc")
      .first();
    if (!user) return { status: "unknown_phone" as const };
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();
    if (!member) return { status: "no_group" as const };
    return { status: "ok" as const, memberId: member._id, userId: user._id };
  },
});

export const recordTextCheckins = internalMutation({
  args: {
    userId: v.id("users"),
    note: v.optional(v.string()),
    photoStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get("users", args.userId);
    const members = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(20);
    const results = [];
    for (const member of members) {
      const group = await ctx.db.get("groups", member.groupId);
      if (!group) continue;
      const result = await recordCheckIn(ctx, {
        memberId: member._id,
        source: "text",
        note: args.note,
        photoStorageId: args.photoStorageId,
      });
      const updated = await ctx.db.get("members", member._id);
      results.push({
        group: { id: group._id, name: group.name },
        memberId: member._id,
        alreadyCheckedIn: result.alreadyCheckedIn,
        day: result.day,
        goal: member.goal ?? null,
        streak: updated?.streak ?? member.streak,
      });
    }
    return { name: user?.name ?? null, results };
  },
});

export const seedTestUser = internalMutation({
  args: { phone: v.string(), name: v.string(), goal: v.optional(v.string()), today: v.string() },
  handler: async (ctx, args) => {
    const phone = normalizePhone(args.phone);
    if (!phone) throw new Error("Invalid phone");
    const holders = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phone", phone))
      .take(10);
    for (const holder of holders) await ctx.db.patch("users", holder._id, { phone: undefined });
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
