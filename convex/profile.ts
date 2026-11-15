import { mutation } from "./_generated/server";
import { v } from "convex/values";

const E164 = /^\+[1-9]\d{7,14}$/;

export const update = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
    phone: v.optional(v.string()),
    photoStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    if (!(await ctx.db.get("users", args.userId))) throw new Error("Unknown user");
    const patch: { name?: string; avatar?: string; phone?: string; photoStorageId?: typeof args.photoStorageId } = {};
    if (args.name !== undefined) {
      const name = args.name.trim();
      if (!name) throw new Error("Name cannot be empty");
      patch.name = name.slice(0, 24);
    }
    if (args.avatar !== undefined) patch.avatar = args.avatar;
    if (args.photoStorageId !== undefined) patch.photoStorageId = args.photoStorageId;
    if (args.phone !== undefined) {
      if (!E164.test(args.phone)) throw new Error("Phone must be in E.164 format, like +14155550123");
      const holders = await ctx.db
        .query("users")
        .withIndex("by_phone", (q) => q.eq("phone", args.phone))
        .take(10);
      for (const holder of holders) {
        if (holder._id !== args.userId) await ctx.db.patch("users", holder._id, { phone: undefined });
      }
      patch.phone = args.phone;
    }
    await ctx.db.patch("users", args.userId, patch);
    return null;
  },
});

export const setMemberPrefs = mutation({
  args: {
    memberId: v.id("members"),
    goalType: v.optional(v.string()),
    nudgeTime: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.nudgeTime !== undefined && !/^([01]\d|2[0-3]):[0-5]\d$/.test(args.nudgeTime)) {
      throw new Error("nudgeTime must look like 18:00");
    }
    await ctx.db.patch("members", args.memberId, {
      goalType: args.goalType?.slice(0, 24),
      nudgeTime: args.nudgeTime,
    });
    return null;
  },
});
