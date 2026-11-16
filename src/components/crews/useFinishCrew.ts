import { useConvex, useMutation } from "convex/react";
import { router } from "expo-router";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useSession } from "../../lib/session";
import type { CrewGoal } from "./GoalPicker";

/** Saves my goal on my member row in groupId, makes that crew active and goes Home. */
export function useFinishCrew() {
  const convex = useConvex();
  const { setActiveGroupId } = useSession();
  const setGoal = useMutation(api.members.setGoal);
  const setPrefs = useMutation(api.profile.setMemberPrefs);
  return async (userId: Id<"users">, groupId: Id<"groups">, goal: CrewGoal) => {
    const crews = await convex.query(api.crews.mine, { userId });
    const member = crews.find((c) => c.group._id === groupId)?.member;
    if (!member) throw new Error("Member row missing");
    await setGoal({ memberId: member._id, goal: goal.goal.trim(), emoji: goal.emoji });
    await setPrefs({ memberId: member._id, goalType: goal.goalType ?? "custom" });
    await setActiveGroupId(groupId);
    router.dismissAll();
    router.replace("/(tabs)");
  };
}
