import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  items: defineTable({
    text: v.string(),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),
});
