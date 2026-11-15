import { useMutation } from "convex/react";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { api } from "../../../convex/_generated/api";
import { GoalPicker } from "../../components/crews/GoalPicker";
import type { CrewGoal } from "../../components/crews/GoalPicker";
import { useFinishCrew } from "../../components/crews/useFinishCrew";
import { KINDS, STAKE_KINDS } from "../../components/onboarding/options";
import type { GroupKind, StakeKind } from "../../components/onboarding/options";
import { StakePicker } from "../../components/onboarding/StakePicker";
import { Button, Chip, Icon, Input, Screen, Text } from "../../components/ui";
import { useCurrentMember } from "../../lib/session";
import { colors, localToday, spacing } from "../../lib/theme";

function defaultName(firstName: string, kind: GroupKind) {
  const label = KINDS.find((k) => k.kind === kind)?.label.toLowerCase() ?? "crew";
  return `${firstName}'s ${label}`.slice(0, 32);
}

export default function NewCrew() {
  const { user } = useCurrentMember();
  const firstName = user?.name.trim().split(/\s+/)[0] || "My";
  const [kind, setKind] = useState<GroupKind>("friends");
  const [name, setName] = useState<string | null>(null);
  const [stakeKind, setStakeKind] = useState<StakeKind>("hangout");
  const [stake, setStakeText] = useState<string>(STAKE_KINDS[0].examples[0]);
  const [goal, setGoal] = useState<CrewGoal>({ goalType: null, goal: "", emoji: "🌱" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createGroup = useMutation(api.groups.create);
  const setStake = useMutation(api.stake.setStake);
  const finish = useFinishCrew();
  const crewName = name ?? defaultName(firstName, kind);

  const create = async () => {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      const groupId = await createGroup({ userId: user._id, name: crewName, kind, today: localToday(), hangout: stake });
      await setStake({ groupId, stake, kind: stakeKind });
      await finish(user._id, groupId, goal);
    } catch (e) {
      console.warn("Create crew failed", e);
      setError("Couldn't make that crew. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen
      scroll
      footer={
        <Button
          testID="new-crew-create"
          label="Create crew"
          onPress={create}
          loading={busy}
          disabled={!user || !crewName.trim() || !goal.goal.trim() || !stake.trim()}
        />
      }
    >
      <Pressable testID="new-crew-back" accessibilityRole="button" accessibilityLabel="Back" hitSlop={12} onPress={() => router.back()} style={{ paddingVertical: spacing.md }}>
        <Icon name="chevron.left" size={20} color={colors.secondaryLabel} weight="semibold" />
      </Pressable>
      <Text variant="title1">New crew</Text>
      <Text variant="callout" color={colors.secondaryLabel} style={{ marginTop: spacing.xs }}>
        Keep your people separate. Each crew gets its own goal, rainchecks and reel.
      </Text>

      <Text variant="headline" style={{ marginTop: spacing.xxl, marginBottom: spacing.sm }}>Who&apos;s in it?</Text>
      <View style={{ gap: spacing.sm }}>
        {KINDS.map((k) => (
          <Chip key={k.kind} testID={`new-crew-kind-${k.kind}`} label={k.label} icon={k.icon} selected={kind === k.kind} onPress={() => setKind(k.kind)} />
        ))}
      </View>

      <Text variant="headline" style={{ marginTop: spacing.xxl, marginBottom: spacing.sm }}>Crew name</Text>
      <Input testID="new-crew-name" value={crewName} onChangeText={setName} maxLength={32} returnKeyType="done" />

      <Text variant="headline" style={{ marginTop: spacing.xxl, marginBottom: spacing.sm }}>Miss a day and you owe…</Text>
      <StakePicker
        kind={stakeKind}
        stake={stake}
        onChange={(k, s) => {
          setStakeKind(k);
          setStakeText(s);
        }}
      />

      <Text variant="headline" style={{ marginTop: spacing.xxl, marginBottom: spacing.sm }}>My goal for this crew</Text>
      <GoalPicker value={goal} onChange={setGoal} />
      {error ? (
        <Text variant="footnote" color={colors.danger} style={{ marginTop: spacing.sm }}>
          {error}
        </Text>
      ) : null}
    </Screen>
  );
}
