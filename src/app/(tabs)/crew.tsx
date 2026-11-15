import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import { useState } from "react";
import { Share, View } from "react-native";
import { api } from "../../../convex/_generated/api";
import { EndDayConfirm } from "../../components/crew/EndDayConfirm";
import { RaincheckCard } from "../../components/crew/RaincheckCard";
import { RaincheckMoment } from "../../components/crew/RaincheckMoment";
import { Sheet } from "../../components/crew/Sheet";
import { formatDay } from "../../components/crew/format";
import { Avatar, Button, Icon, LargeTitle, Placeholder, Row, Screen, Section, Text } from "../../components/ui";
import { useCurrentMember } from "../../lib/session";
import { colors, spacing } from "../../lib/theme";

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
      <LargeTitle eyebrow={formatDay(group.currentDay)} subtitle="Bad days, good nights.">
        {group.name}
      </LargeTitle>

      <Section title="Crew">
        {(board?.members ?? []).map((person) => (
          <Row
            key={person.memberId}
            title={person.name}
            subtitle={person.goal ? `${person.emoji ?? ""} ${person.goal}`.trim() : "No goal yet"}
            left={<Avatar name={person.name} emoji={person.avatar} size={40} ring={person.doneToday} />}
            right={
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xxs }}>
                <Icon name="flame.fill" size={15} color={person.streak > 0 ? colors.accentInk : colors.tertiaryLabel} />
                <Text variant="callout" color={colors.secondaryLabel}>
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

      <Text variant="footnote" color={colors.secondaryLabel} style={{ marginTop: spacing.xxl, marginLeft: spacing.lg, marginBottom: spacing.sm }}>
        RAINCHECKS
      </Text>
      {open === undefined ? null : open.length === 0 ? (
        <Placeholder height={120} icon="cloud.sun" label="No rainchecks. Clear skies." tint="rain" />
      ) : (
        <View style={{ gap: spacing.md }}>
          {open.map((raincheck) => (
            <RaincheckCard key={raincheck._id} raincheck={raincheck} />
          ))}
        </View>
      )}

      <Section>
        <Row
          testID="reel-open"
          title="Sunday Reel"
          subtitle="Your crew's week, story style"
          icon="play.rectangle.fill"
          iconColor={colors.accent}
          onPress={() => router.push("/reel")}
        />
      </Section>

      {cashed && cashed.length > 0 ? (
        <Section title="Cashed in">
          {cashed.map((raincheck) => (
            <Row
              key={raincheck._id}
              title={`${raincheck.name} · ${raincheck.plan}`}
              subtitle={`Owed from ${formatDay(raincheck.day)}`}
              left={<Avatar name={raincheck.name} photoUrl={raincheck.photoUrl} emoji={raincheck.avatar} size={40} />}
              right={<Icon name="checkmark.seal.fill" size={20} color={colors.success} />}
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
