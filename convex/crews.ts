import { query } from "./_generated/server";
import { v } from "convex/values";

export const mine = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(20);
    const rows = await Promise.all(
      members.map(async (member) => {
        const group = await ctx.db.get("groups", member.groupId);
        if (!group) return null;
        const crew = await ctx.db
          .query("members")
          .withIndex("by_groupId", (q) => q.eq("groupId", group._id))
          .take(6);
        const people = await Promise.all(
          crew.map(async (m) => {
            const user = await ctx.db.get("users", m.userId);
            return { memberId: m._id, name: user?.name ?? "Someone", avatar: user?.avatar ?? "🙂" };
          }),
        );
        return { member, group, people };
      }),
    );
    return rows.filter((row) => row !== null);
  },
});
