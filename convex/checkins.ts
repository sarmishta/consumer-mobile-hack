import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const checkIn = mutation({
  args: { memberId: v.id("members") },
  handler: async (ctx, args) => {
    const member = await ctx.db.get("members", args.memberId);
    if (!member) throw new Error("Unknown member");
    const group = await ctx.db.get("groups", member.groupId);
    if (!group) throw new Error("Unknown group");
    const existing = await ctx.db
      .query("checkins")
      .withIndex("by_memberId_and_day", (q) =>
        q.eq("memberId", member._id).eq("day", group.currentDay),
      )
      .unique();
    if (existing) return null;
    await ctx.db.insert("checkins", { memberId: member._id, day: group.currentDay });
    await ctx.db.patch("members", member._id, { streak: member.streak + 1 });
    return null;
  },
});
