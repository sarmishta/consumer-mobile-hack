import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const setGoal = mutation({
  args: { memberId: v.id("members"), goal: v.string(), emoji: v.string() },
  handler: async (ctx, args) => {
    const goal = args.goal.trim();
    if (!goal) throw new Error("Goal cannot be empty");
    await ctx.db.patch("members", args.memberId, { goal: goal.slice(0, 60), emoji: args.emoji });
    return null;
  },
});

export const board = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const group = await ctx.db.get("groups", args.groupId);
    if (!group) return null;
    const members = await ctx.db
      .query("members")
      .withIndex("by_groupId", (q) => q.eq("groupId", group._id))
      .take(6);
    const rows = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get("users", member.userId);
        const checkin = await ctx.db
          .query("checkins")
          .withIndex("by_memberId_and_day", (q) =>
            q.eq("memberId", member._id).eq("day", group.currentDay),
          )
          .unique();
        return {
          memberId: member._id,
          userId: member.userId,
          name: user?.name ?? "Someone",
          avatar: user?.avatar ?? "🙂",
          goal: member.goal ?? null,
          emoji: member.emoji ?? null,
          streak: member.streak,
          doneToday: checkin !== null,
        };
      }),
    );
    return { group, members: rows };
  },
});
