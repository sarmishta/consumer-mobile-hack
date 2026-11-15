import { query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { v } from "convex/values";
import { storageUrl } from "./files";

async function withPerson(ctx: QueryCtx, raincheck: Doc<"rainchecks">) {
  const member = await ctx.db.get("members", raincheck.memberId);
  const user = member ? await ctx.db.get("users", member.userId) : null;
  return {
    ...raincheck,
    name: user?.name ?? "Someone",
    avatar: user?.avatar ?? "🙂",
    photoUrl: await storageUrl(ctx, raincheck.cashedInPhotoStorageId),
  };
}

export const raincheck = query({
  args: { raincheckId: v.id("rainchecks") },
  handler: async (ctx, args) => {
    const raincheck = await ctx.db.get("rainchecks", args.raincheckId);
    return raincheck ? await withPerson(ctx, raincheck) : null;
  },
});

export const cashedIn = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const rainchecks = await ctx.db
      .query("rainchecks")
      .withIndex("by_groupId_and_cashedIn", (q) => q.eq("groupId", args.groupId).eq("cashedIn", true))
      .order("desc")
      .take(20);
    return await Promise.all(rainchecks.map((raincheck) => withPerson(ctx, raincheck)));
  },
});
