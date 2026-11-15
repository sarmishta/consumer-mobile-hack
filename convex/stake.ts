import { mutation } from "./_generated/server";
import { v } from "convex/values";

/** Sets what a crew member owes on a missed day. Stored in groups.hangout, with its kind in groups.stakeKind. */
export const setStake = mutation({
  args: {
    groupId: v.id("groups"),
    stake: v.string(),
    kind: v.union(v.literal("hangout"), v.literal("treat"), v.literal("favor"), v.literal("dare")),
  },
  handler: async (ctx, args) => {
    const stake = args.stake.trim().slice(0, 40);
    if (!stake) throw new Error("Say what you owe");
    if (!(await ctx.db.get("groups", args.groupId))) throw new Error("Unknown crew");
    await ctx.db.patch("groups", args.groupId, { hangout: stake, stakeKind: args.kind });
    return null;
  },
});
