import { useMutation } from "convex/react";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { GoalPicker } from "../../components/crews/GoalPicker";
import type { CrewGoal } from "../../components/crews/GoalPicker";
import { useFinishCrew } from "../../components/crews/useFinishCrew";
import { Button, Icon, Input, Screen, Text } from "../../components/ui";
import { useSession } from "../../lib/session";
import { colors, spacing } from "../../lib/theme";

export default function JoinCrew() {
  const { userId } = useSession();
  const [code, setCode] = useState("");
  const [groupId, setGroupId] = useState<Id<"groups"> | null>(null);
  const [goal, setGoal] = useState<CrewGoal>({ goalType: null, goal: "", emoji: "🌱" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const join = useMutation(api.groups.join);
  const finish = useFinishCrew();

  const submitCode = async () => {
    if (!userId) return;
    setBusy(true);
    setError(null);
    try {
      setGroupId(await join({ userId, inviteCode: code }));
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message.includes("full") ? "That crew is full (6 max)." : message.includes("No group") ? "No crew with that code. Check it and try again." : "Couldn't join. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const saveGoal = async () => {
    if (!userId || !groupId) return;
    setBusy(true);
    setError(null);
    try {
      await finish(userId, groupId, goal);
    } catch (e) {
      console.warn("Save crew goal failed", e);
      setError("Couldn't save your goal. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen
      scroll={!!groupId}
      footer={
        groupId ? (
          <Button testID="join-crew-goal-save" label="Save my goal" onPress={saveGoal} loading={busy} disabled={!goal.goal.trim()} />
        ) : (
          <Button testID="join-crew-submit" label="Join crew" onPress={submitCode} loading={busy} disabled={code.length !== 6 || !userId} />
        )
      }
    >
      <Pressable testID="join-crew-back" accessibilityRole="button" accessibilityLabel="Back" hitSlop={12} onPress={() => router.back()} style={{ paddingVertical: spacing.md }}>
        <Icon name="chevron.left" size={20} color={colors.secondaryLabel} weight="semibold" />
      </Pressable>
      {groupId ? (
        <>
          <Text variant="title1">You&apos;re in.</Text>
          <Text variant="callout" color={colors.secondaryLabel} style={{ marginTop: spacing.xs, marginBottom: spacing.xl }}>
            What&apos;s your goal for this crew?
          </Text>
          <GoalPicker key="goal" value={goal} onChange={setGoal} />
        </>
      ) : (
        <>
          <Text variant="title1">Join a crew</Text>
          <Text variant="callout" color={colors.secondaryLabel} style={{ marginTop: spacing.sm }}>
            Enter the 6 characters they sent you.
          </Text>
          <View style={{ marginTop: spacing.xxl }}>
            <Input
              key="code"
              testID="join-crew-code"
              value={code}
              onChangeText={(text) => setCode(text.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 6))}
              placeholder="ABC123"
              autoCapitalize="characters"
              autoCorrect={false}
              autoFocus
              maxLength={6}
              style={{ height: 64, fontSize: 32, lineHeight: 38, fontWeight: "700", letterSpacing: 8, textAlign: "center" }}
            />
          </View>
        </>
      )}
      {error ? (
        <Text variant="footnote" color={colors.danger} style={{ marginTop: spacing.sm }}>
          {error}
        </Text>
      ) : null}
    </Screen>
  );
}
