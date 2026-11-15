import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const PLANS = {
  friends: ["coffee", "dinner", "movie night", "a long walk", "tacos", "brunch"],
  family: ["coffee", "dinner", "movie night", "a call to Grandma", "pancake breakfast", "board game night"],
};

function nextDay(day: string) {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

export const listOpen = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const rainchecks = await ctx.db
      .query("rainchecks")
      .withIndex("by_groupId_and_cashedIn", (q) =>
        q.eq("groupId", args.groupId).eq("cashedIn", false),
      )
      .order("desc")
      .take(50);
    return await Promise.all(
      rainchecks.map(async (raincheck) => {
        const member = await ctx.db.get("members", raincheck.memberId);
        const user = member ? await ctx.db.get("users", member.userId) : null;
        return {
          ...raincheck,
          name: user?.name ?? "Someone",
          avatar: user?.avatar ?? "🙂",
        };
      }),
    );
  },
});

export const endDay = mutation({
  args: { groupId: v.id("groups"), day: v.string() },
  handler: async (ctx, args) => {
    const group = await ctx.db.get("groups", args.groupId);
    if (!group) throw new Error("Unknown group");
    if (group.currentDay !== args.day) return 0;
    const members = await ctx.db
      .query("members")
      .withIndex("by_groupId", (q) => q.eq("groupId", group._id))
      .take(6);
    const plans = PLANS[group.kind];
    let issued = 0;
    for (const member of members) {
      const checkin = await ctx.db
        .query("checkins")
        .withIndex("by_memberId_and_day", (q) => q.eq("memberId", member._id).eq("day", group.currentDay))
        .unique();
      if (checkin) continue;
      await ctx.db.insert("rainchecks", {
        groupId: group._id,
        memberId: member._id,
        plan: plans[Math.floor(Math.random() * plans.length)],
        day: group.currentDay,
        cashedIn: false,
      });
      await ctx.db.patch("members", member._id, { streak: 0 });
      issued++;
    }
    await ctx.db.patch("groups", group._id, { currentDay: nextDay(group.currentDay) });
    return issued;
  },
});

export const cashIn = mutation({
  args: { raincheckId: v.id("rainchecks") },
  handler: async (ctx, args) => {
    await ctx.db.patch("rainchecks", args.raincheckId, { cashedIn: true });
    return null;
  },
});
