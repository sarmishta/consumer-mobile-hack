import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get("users", args.userId);
  },
});

export const create = mutation({
  args: { name: v.string(), avatar: v.string() },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    if (!name) throw new Error("Name cannot be empty");
    return await ctx.db.insert("users", { name: name.slice(0, 24), avatar: args.avatar });
  },
});
