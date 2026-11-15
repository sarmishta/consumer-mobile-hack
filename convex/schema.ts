import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    avatar: v.string(),
  }),
  groups: defineTable({
    name: v.string(),
    inviteCode: v.string(),
    kind: v.union(v.literal("friends"), v.literal("family")),
    currentDay: v.string(),
  }).index("by_inviteCode", ["inviteCode"]),
  members: defineTable({
    groupId: v.id("groups"),
    userId: v.id("users"),
    goal: v.optional(v.string()),
    emoji: v.optional(v.string()),
    streak: v.number(),
  })
    .index("by_groupId", ["groupId"])
    .index("by_userId", ["userId"]),
  checkins: defineTable({
    memberId: v.id("members"),
    day: v.string(),
  }).index("by_memberId_and_day", ["memberId", "day"]),
  rainchecks: defineTable({
    groupId: v.id("groups"),
    memberId: v.id("members"),
    plan: v.string(),
    day: v.string(),
    cashedIn: v.boolean(),
  }).index("by_groupId_and_cashedIn", ["groupId", "cashedIn"]),
});
