import { internalMutation, mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { checkinSource } from "./schema";

const checkInArgs = {
  memberId: v.id("members"),
  source: checkinSource,
  photoStorageId: v.optional(v.id("_storage")),
  note: v.optional(v.string()),
};

type CheckInArgs = {
  memberId: Id<"members">;
  source: "app" | "text";
  photoStorageId?: Id<"_storage">;
  note?: string;
};

export function checkinSourceOf(checkin: Doc<"checkins">) {
  return checkin.source ?? "app";
}

export async function recordCheckIn(ctx: MutationCtx, args: CheckInArgs) {
  const member = await ctx.db.get("members", args.memberId);
  if (!member) throw new Error("Unknown member");
  const group = await ctx.db.get("groups", member.groupId);
  if (!group) throw new Error("Unknown group");
  const note = args.note?.trim().slice(0, 280) || undefined;
  const existing = await ctx.db
    .query("checkins")
    .withIndex("by_memberId_and_day", (q) =>
      q.eq("memberId", member._id).eq("day", group.currentDay),
    )
    .unique();
  if (existing) {
    const patch: Partial<Doc<"checkins">> = {};
    if (args.photoStorageId && !existing.photoStorageId) patch.photoStorageId = args.photoStorageId;
    if (note && !existing.note) patch.note = note;
    if (!existing.groupId) patch.groupId = group._id;
    if (Object.keys(patch).length > 0) await ctx.db.patch("checkins", existing._id, patch);
    return { checkinId: existing._id, alreadyCheckedIn: true, day: group.currentDay };
  }
  const checkinId = await ctx.db.insert("checkins", {
    memberId: member._id,
    groupId: group._id,
    day: group.currentDay,
    source: args.source,
    photoStorageId: args.photoStorageId,
    note,
  });
  await ctx.db.patch("members", member._id, { streak: member.streak + 1 });
  return { checkinId, alreadyCheckedIn: false, day: group.currentDay };
}

export const checkIn = mutation({
  args: checkInArgs,
  handler: async (ctx, args) => await recordCheckIn(ctx, args),
});

export const record = internalMutation({
  args: checkInArgs,
  handler: async (ctx, args) => await recordCheckIn(ctx, args),
});
