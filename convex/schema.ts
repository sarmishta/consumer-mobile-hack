import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const groupKind = v.union(
  v.literal("friends"),
  v.literal("family"),
  v.literal("partner"),
  v.literal("roommates"),
);

export const checkinSource = v.union(v.literal("app"), v.literal("text"));

export default defineSchema({
  users: defineTable({
    name: v.string(),
    avatar: v.string(),
    phone: v.optional(v.string()),
    photoStorageId: v.optional(v.id("_storage")),
  }).index("by_phone", ["phone"]),
  groups: defineTable({
    name: v.string(),
    inviteCode: v.string(),
    kind: groupKind,
    currentDay: v.string(),
    hangout: v.optional(v.string()),
    stakeKind: v.optional(v.union(v.literal("hangout"), v.literal("treat"), v.literal("favor"), v.literal("dare"))),
  }).index("by_inviteCode", ["inviteCode"]),
  members: defineTable({
    groupId: v.id("groups"),
    userId: v.id("users"),
    goal: v.optional(v.string()),
    emoji: v.optional(v.string()),
    goalType: v.optional(v.string()),
    nudgeTime: v.optional(v.string()),
    streak: v.number(),
  })
    .index("by_groupId", ["groupId"])
    .index("by_userId", ["userId"]),
  checkins: defineTable({
    memberId: v.id("members"),
    day: v.string(),
    groupId: v.optional(v.id("groups")),
    source: v.optional(checkinSource),
    photoStorageId: v.optional(v.id("_storage")),
    note: v.optional(v.string()),
  })
    .index("by_memberId_and_day", ["memberId", "day"])
    .index("by_groupId_and_day", ["groupId", "day"]),
  rainchecks: defineTable({
    groupId: v.id("groups"),
    memberId: v.id("members"),
    plan: v.string(),
    day: v.string(),
    cashedIn: v.boolean(),
    cashedInPhotoStorageId: v.optional(v.id("_storage")),
    cashedInAt: v.optional(v.number()),
  }).index("by_groupId_and_cashedIn", ["groupId", "cashedIn"]),
});
