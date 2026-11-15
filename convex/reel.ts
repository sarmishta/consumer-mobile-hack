import { query } from "./_generated/server";
import { v } from "convex/values";
import { storageUrl } from "./files";

function lastDays(end: string, count: number) {
  const days: string[] = [];
  const date = new Date(`${end}T12:00:00Z`);
  for (let i = 0; i < count; i++) {
    days.unshift(date.toISOString().slice(0, 10));
    date.setUTCDate(date.getUTCDate() - 1);
  }
  return days;
}

export const week = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const group = await ctx.db.get("groups", args.groupId);
    if (!group) return null;
    const days = lastDays(group.currentDay, 7);
    const members = await ctx.db
      .query("members")
      .withIndex("by_groupId", (q) => q.eq("groupId", group._id))
      .take(6);

    const people = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get("users", member.userId);
        const done = await Promise.all(
          days.map(async (day) => {
            const checkin = await ctx.db
              .query("checkins")
              .withIndex("by_memberId_and_day", (q) => q.eq("memberId", member._id).eq("day", day))
              .unique();
            return checkin !== null;
          }),
        );
        return {
          memberId: member._id,
          name: user?.name ?? "Someone",
          avatar: user?.avatar ?? "🙂",
          photoUrl: await storageUrl(ctx, user?.photoStorageId),
          goal: member.goal ?? null,
          emoji: member.emoji ?? null,
          streak: member.streak,
          done,
          daysDone: done.filter(Boolean).length,
        };
      }),
    );
    const names = new Map(people.map((person) => [person.memberId, person]));

    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const inWeek = async (cashedIn: boolean) => {
      const rows = await ctx.db
        .query("rainchecks")
        .withIndex("by_groupId_and_cashedIn", (q) => q.eq("groupId", group._id).eq("cashedIn", cashedIn))
        .order("desc")
        .take(50);
      return await Promise.all(
        rows
          .filter((row) => row.day >= days[0] || (row.cashedInAt ?? 0) >= weekAgo)
          .map(async (row) => ({
            _id: row._id,
            plan: row.plan,
            day: row.day,
            name: names.get(row.memberId)?.name ?? "Someone",
            avatar: names.get(row.memberId)?.avatar ?? "🙂",
            photoUrl: await storageUrl(ctx, row.cashedInPhotoStorageId),
          })),
      );
    };

    return {
      groupName: group.name,
      days,
      checkins: people.reduce((sum, person) => sum + person.daysDone, 0),
      bestStreak: Math.max(0, ...people.map((person) => person.streak)),
      members: people,
      owed: await inWeek(false),
      cashedIn: await inWeek(true),
    };
  },
});
