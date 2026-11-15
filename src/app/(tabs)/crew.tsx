import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Share, View } from "react-native";
import { api } from "../../../convex/_generated/api";
import { EndDayConfirm } from "../../components/crew/EndDayConfirm";
import { RaincheckCard } from "../../components/crew/RaincheckCard";
import { RaincheckMoment } from "../../components/crew/RaincheckMoment";
import { Sheet } from "../../components/crew/Sheet";
import { formatDay } from "../../components/crew/format";
import { AnimatedEmoji, Sticker } from "../../components/fun";
import { Avatar, Button, Icon, LargeTitle, Row, Screen, Section, Text } from "../../components/ui";
import { useCurrentMember } from "../../lib/session";
import { colors, gradients, radius, spacing } from "../../lib/theme";

export default function Crew() {
  const { group, member } = useCurrentMember();
  const groupArgs = group ? { groupId: group._id } : "skip";
  const board = useQuery(api.members.board, groupArgs);
  const open = useQuery(api.rainchecks.listOpen, groupArgs);
  const cashed = useQuery(api.crew.cashedIn, groupArgs);
  const endDay = useMutation(api.rainchecks.endDay);
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
      <LargeTitle eyebrow={formatDay(group.currentDay)} subtitle="Bad days, good nights." right={<AnimatedEmoji name="rain" size={56} />}>
        {group.name}
      </LargeTitle>

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
                <Text style={{ fontSize: 15, lineHeight: 20, opacity: person.streak > 0 ? 1 : 0.4 }}>🔥</Text>
                <Text variant="headline" weight="800" color={person.streak > 0 ? colors.accentInk : colors.tertiaryLabel}>
                  {person.streak}
                </Text>
              </View>
            }
          />
        ))}
        <Row
          testID="invite-share"
          title="Invite code"
          value={group.inviteCode}
          icon="square.and.arrow.up"
          iconColor={colors.rain}
          onPress={() =>
            Share.share({
              message: `Join ${group.name} on RAINCHECK. Invite code: ${group.inviteCode}. Bad days, good nights.`,
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
          <AnimatedEmoji name="sparkles" size={56} />
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
              title={`${raincheck.name} · ${raincheck.plan}`}
              subtitle={`Owed from ${formatDay(raincheck.day)}`}
              left={<Avatar name={raincheck.name} photoUrl={raincheck.photoUrl} emoji={raincheck.avatar} size={40} />}
              right={<Text style={{ fontSize: 22, lineHeight: 28 }}>🎉</Text>}
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
