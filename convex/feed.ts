import { query } from "./_generated/server";
import { v } from "convex/values";
import { checkinSourceOf } from "./checkins";
import { storageUrl } from "./files";

export const today = query({
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
        const checkin = await ctx.db
          .query("checkins")
          .withIndex("by_memberId_and_day", (q) =>
            q.eq("memberId", member._id).eq("day", group.currentDay),
          )
          .unique();
        if (!checkin) return null;
        const user = await ctx.db.get("users", member.userId);
        return {
          checkinId: checkin._id,
          memberId: member._id,
          createdAt: checkin._creationTime,
          name: user?.name ?? "Someone",
          avatar: user?.avatar ?? "🙂",
          avatarUrl: await storageUrl(ctx, user?.photoStorageId),
          goal: member.goal ?? null,
          emoji: member.emoji ?? null,
          streak: member.streak,
          source: checkinSourceOf(checkin),
          note: checkin.note ?? null,
          photoUrl: await storageUrl(ctx, checkin.photoStorageId),
        };
      }),
    );
    const items = rows
      .filter((row) => row !== null)
      .sort((a, b) => b.createdAt - a.createdAt);
    return { day: group.currentDay, items };
  },
});
