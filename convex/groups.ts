import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { groupKind } from "./schema";

const MAX_MEMBERS = 6;
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

async function uniqueInviteCode(ctx: MutationCtx) {
  for (;;) {
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    }
    const taken = await ctx.db
      .query("groups")
      .withIndex("by_inviteCode", (q) => q.eq("inviteCode", code))
      .unique();
    if (!taken) return code;
  }
}

export const mine = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    if (!member) return null;
    const group = await ctx.db.get("groups", member.groupId);
    if (!group) return null;
    return { member, group };
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    kind: groupKind,
    today: v.string(),
    hangout: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    if (!name) throw new Error("Group name cannot be empty");
    if (!(await ctx.db.get("users", args.userId))) throw new Error("Unknown user");
    const groupId = await ctx.db.insert("groups", {
      name: name.slice(0, 32),
      inviteCode: await uniqueInviteCode(ctx),
      kind: args.kind,
      currentDay: args.today,
      hangout: args.hangout?.trim().slice(0, 40) || undefined,
    });
    await ctx.db.insert("members", { groupId, userId: args.userId, streak: 0 });
    return groupId;
  },
});

export const join = mutation({
  args: { userId: v.id("users"), inviteCode: v.string() },
  handler: async (ctx, args) => {
    if (!(await ctx.db.get("users", args.userId))) throw new Error("Unknown user");
    const group = await ctx.db
      .query("groups")
      .withIndex("by_inviteCode", (q) => q.eq("inviteCode", args.inviteCode.trim().toUpperCase()))
      .unique();
    if (!group) throw new Error("No group with that code");
    const members = await ctx.db
      .query("members")
      .withIndex("by_groupId", (q) => q.eq("groupId", group._id))
      .take(MAX_MEMBERS + 1);
    if (members.some((m) => m.userId === args.userId)) return group._id;
    if (members.length >= MAX_MEMBERS) throw new Error("That group is full (6 max)");
    await ctx.db.insert("members", { groupId: group._id, userId: args.userId, streak: 0 });
    return group._id;
  },
});
