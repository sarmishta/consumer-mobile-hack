import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Alert, Platform, Pressable, Share, View } from "react-native";
import { api } from "../../../convex/_generated/api";
import { EndDayConfirm } from "../../components/crew/EndDayConfirm";
import { RaincheckCard } from "../../components/crew/RaincheckCard";
import { RaincheckMoment } from "../../components/crew/RaincheckMoment";
import { Sheet } from "../../components/crew/Sheet";
import { formatDay } from "../../components/crew/format";
import { StakePicker } from "../../components/onboarding/StakePicker";
import { STAKE_KINDS } from "../../components/onboarding/options";
import type { StakeKind } from "../../components/onboarding/options";
import { Flame } from "../../components/characters";
import { Sticker } from "../../components/fun";
import { Avatar, Button, Icon, LargeTitle, Row, Screen, Section, Text } from "../../components/ui";
import { CrewName, CrewSwitcherSheet } from "../../components/crews/CrewSwitcher";
import { useCurrentMember } from "../../lib/session";
import { colors, gradients, radius, spacing } from "../../lib/theme";

export default function Crew() {
  const { group, member } = useCurrentMember();
  const groupArgs = group ? { groupId: group._id } : "skip";
  const board = useQuery(api.members.board, groupArgs);
  const open = useQuery(api.rainchecks.listOpen, groupArgs);
  const cashed = useQuery(api.crew.cashedIn, groupArgs);
  const endDay = useMutation(api.rainchecks.endDay);
  const renameCrew = useMutation(api.crewName.rename);
  const setStake = useMutation(api.stake.setStake);
  const [stakeDraft, setStakeDraft] = useState<{ kind: StakeKind | null; stake: string } | null>(null);
  const [savingStake, setSavingStake] = useState(false);
  const [endedDay, setEndedDay] = useState<string | null>(null);
  const [ending, setEnding] = useState(false);
  const [confirming, setConfirming] = useState(false);

  if (!group || !member) return <Screen>{null}</Screen>;

  const missed = endedDay && open ? open.filter((raincheck) => raincheck.day === endedDay) : null;
  const moment = missed
    ? {
        mine: missed.find((raincheck) => raincheck.memberId === member._id) ?? null,
        others: missed.filter((raincheck) => raincheck.memberId !== member._id),
      }
    : null;

  const runEndDay = async () => {
    const day = group.currentDay;
    setEnding(true);
    try {
      await endDay({ groupId: group._id, day });
      setEndedDay(day);
    } finally {
      setEnding(false);
      setConfirming(false);
    }
  };

  return (
    <Screen scroll>
      <LargeTitle eyebrow={formatDay(group.currentDay)} subtitle="Bad days, good nights.">
        <CrewName name={group.name} />
      </LargeTitle>
      <CrewSwitcherSheet />

      <Section title="Crew">
        {(board?.members ?? []).map((person) => (
          <Row
            key={person.memberId}
            title={person.name}
            subtitle={person.goal ? `${person.emoji ?? ""} ${person.goal}`.trim() : "No goal yet"}
            left={<Avatar name={person.name} emoji={person.avatar} size={42} ring={person.doneToday} />}
            right={
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.xxs,
                  backgroundColor: person.streak > 0 ? colors.accentSoft : colors.fill,
                  borderRadius: radius.pill,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xxs,
                }}
              >
                <View style={{ opacity: person.streak > 0 ? 1 : 0.4 }}>
                  <Flame size={16} />
                </View>
                <Text variant="headline" weight="800" color={person.streak > 0 ? colors.accentInk : colors.tertiaryLabel}>
                  {person.streak}
                </Text>
              </View>
            }
          />
        ))}
        <Row
          testID="rename-crew"
          title="Rename crew"
          value={group.name}
          icon="pencil"
          iconColor={colors.grape}
          onPress={() => {
            if (Platform.OS === "web") {
              const name = globalThis.prompt?.("Rename crew", group.name);
              if (name?.trim()) renameCrew({ groupId: group._id, name });
              return;
            }
            Alert.prompt(
              "Rename crew",
              undefined,
              (name) => {
                if (name?.trim()) renameCrew({ groupId: group._id, name });
              },
              "plain-text",
              group.name,
            );
          }}
        />
        <Row
          testID="edit-stake"
          title="What you owe"
          value={group.hangout ?? "Not set"}
          icon={STAKE_KINDS.find((k) => k.kind === group.stakeKind)?.icon ?? "gift.fill"}
          iconColor={colors.coral}
          onPress={() => setStakeDraft({ kind: group.stakeKind ?? null, stake: group.hangout ?? "" })}
        />
        <Row
          testID="invite-share"
          title="Invite code"
          value={group.inviteCode}
          icon="square.and.arrow.up"
          iconColor={colors.rain}
          onPress={() =>
            Share.share({
              message: `Join ${group.name} on Raincheck. Code: ${group.inviteCode}. Bad days, good nights.`,
            })
          }
        />
      </Section>

      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.xxl, marginBottom: spacing.md }}>
        <Text variant="largeTitle" style={{ fontSize: 28, lineHeight: 34 }}>
          Rainchecks
        </Text>
        {open && open.length > 0 ? <Sticker label={String(open.length)} color={colors.coral} ink={colors.white} tilt={8} size="sm" /> : null}
      </View>
      {open === undefined ? null : open.length === 0 ? (
        <View
          style={{
            alignItems: "center",
            backgroundColor: colors.rainSoft,
            borderRadius: radius.xl,
            paddingVertical: spacing.xl,
            gap: spacing.xs,
          }}
        >
          <Icon name="sun.max.fill" size={40} color={colors.rain} />
          <Text variant="headline" weight="800" color={colors.rain}>
            No rainchecks. Clear skies.
          </Text>
        </View>
      ) : (
        <View style={{ gap: spacing.md }}>
          {open.map((raincheck) => (
            <RaincheckCard key={raincheck._id} raincheck={raincheck} />
          ))}
        </View>
      )}

      <Pressable
        testID="reel-open"
        accessibilityRole="button"
        accessibilityLabel="Sunday Reel"
        onPress={() => router.push("/reel")}
        style={({ pressed }) => ({ marginTop: spacing.xxl, transform: [{ scale: pressed ? 0.97 : 1 }] })}
      >
        <LinearGradient
          colors={gradients.night}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: radius.xl, padding: spacing.xl, flexDirection: "row", alignItems: "center", gap: spacing.md }}
        >
          <View style={{ flex: 1, gap: spacing.xs }}>
            <Sticker label="NEW" color={colors.accent} tilt={-6} size="sm" />
            <Text variant="largeTitle" color={colors.white} style={{ fontSize: 30, lineHeight: 36 }}>
              Sunday Reel
            </Text>
            <Text variant="subhead" weight="600" color="rgba(255,255,255,0.8)">
              Your crew&apos;s week, story style
            </Text>
          </View>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.white,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="play.fill" size={24} color={colors.grape} />
          </View>
        </LinearGradient>
      </Pressable>

      {cashed && cashed.length > 0 ? (
        <Section title="Cashed in">
          {cashed.map((raincheck) => (
            <Row
              key={raincheck._id}
              title={`${raincheck.name} made good on ${raincheck.plan}`}
              subtitle={`Missed ${formatDay(raincheck.day)}`}
              left={<Avatar name={raincheck.name} photoUrl={raincheck.photoUrl} emoji={raincheck.avatar} size={40} />}
              right={<Icon name="checkmark.seal.fill" size={22} color={colors.mint} />}
            />
          ))}
        </Section>
      ) : null}

      <View style={{ marginTop: spacing.xxxl }}>
        <Button
          testID="end-day-button"
          label="End day (demo)"
          icon="moon.fill"
          variant="secondary"
          haptic
          loading={ending}
          onPress={() => setConfirming(true)}
        />
      </View>

      <Sheet visible={!!stakeDraft} onClose={() => setStakeDraft(null)}>
        <Text variant="largeTitle" style={{ fontSize: 30, lineHeight: 36 }}>
          What you owe
        </Text>
        <Text variant="callout" color={colors.secondaryLabel}>
          What does a missed day cost your crew?
        </Text>
        {stakeDraft ? (
          <StakePicker kind={stakeDraft.kind} stake={stakeDraft.stake} onChange={(kind, stake) => setStakeDraft({ kind, stake })} />
        ) : null}
        <Button
          testID="stake-save"
          label="Save"
          loading={savingStake}
          disabled={!stakeDraft?.kind || !stakeDraft.stake.trim()}
          onPress={async () => {
            if (!stakeDraft?.kind) return;
            setSavingStake(true);
            try {
              await setStake({ groupId: group._id, stake: stakeDraft.stake, kind: stakeDraft.kind });
              setStakeDraft(null);
            } catch {
              Alert.alert("Couldn't save that", "Try again in a sec.");
            } finally {
              setSavingStake(false);
            }
          }}
        />
      </Sheet>

      <Sheet
        visible={confirming || !!moment}
        onClose={() => {
          setConfirming(false);
          setEndedDay(null);
        }}
      >
        {moment ? (
          <RaincheckMoment data={moment} onClose={() => setEndedDay(null)} />
        ) : (
          <EndDayConfirm onCancel={() => setConfirming(false)} onConfirm={runEndDay} />
        )}
      </Sheet>
    </Screen>
  );
}
