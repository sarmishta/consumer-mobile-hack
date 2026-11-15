import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("items")
      .withIndex("by_createdAt")
      .order("desc")
      .take(100);
  },
});

export const add = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const text = args.text.trim();
    if (!text) {
      throw new Error("Item text cannot be empty");
    }
    return await ctx.db.insert("items", { text, createdAt: Date.now() });
  },
});
