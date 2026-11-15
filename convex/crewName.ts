import { mutation } from "./_generated/server";
import { v } from "convex/values";

function clean(name: string) {
  const trimmed = name.trim().slice(0, 32);
  if (!trimmed) throw new Error("Crew name cannot be empty");
  return trimmed;
}

export const rename = mutation({
  args: { groupId: v.id("groups"), name: v.string() },
  handler: async (ctx, args) => {
    if (!(await ctx.db.get("groups", args.groupId))) throw new Error("Unknown crew");
    await ctx.db.patch("groups", args.groupId, { name: clean(args.name) });
    return null;
  },
});

/** Names the crew "<FirstName>'s crew" when this user created it (first member). No-op for joiners. */
export const nameAfterCreator = mutation({
  args: { userId: v.id("users"), firstName: v.string() },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("members")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    if (!member) return null;
    const creator = await ctx.db
      .query("members")
      .withIndex("by_groupId", (q) => q.eq("groupId", member.groupId))
      .first();
    if (creator?._id !== member._id) return null;
    const first = args.firstName.trim().split(/\s+/)[0];
    if (!first) return null;
    await ctx.db.patch("groups", member.groupId, { name: clean(first + "'s crew") });
    return null;
  },
});
