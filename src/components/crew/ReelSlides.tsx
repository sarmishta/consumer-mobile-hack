import type { FunctionReturnType } from "convex/server";
import type { ReactNode } from "react";
import { Image, View } from "react-native";
import type { api } from "../../../convex/_generated/api";
import { colors, radius, spacing } from "../../lib/theme";
import { Avatar, Placeholder, Text } from "../ui";
import { weekdayLetter } from "./format";

type Week = NonNullable<FunctionReturnType<typeof api.reel.week>>;
export type Slide = { key: string; background: string; content: ReactNode };

function Big({ value, label }: { value: string | number; label: string }) {
  return (
    <View style={{ alignItems: "center" }}>
      <Text style={{ fontSize: 88, fontWeight: "800", lineHeight: 96 }}>{value}</Text>
      <Text variant="title3" color={colors.secondaryLabel}>
        {label}
      </Text>
    </View>
  );
}

function Eyebrow({ children }: { children: string }) {
  return (
    <Text variant="footnote" weight="700" color={colors.secondaryLabel} align="center" style={{ textTransform: "uppercase", letterSpacing: 1 }}>
      {children}
    </Text>
  );
}

export function buildSlides(week: Week): Slide[] {
  const cards: Slide[] = [
    {
      key: "crew",
      background: colors.accentSoft,
      content: (
        <View style={{ gap: spacing.xxxl, alignItems: "center" }}>
          <Eyebrow>{`${week.groupName} · this week`}</Eyebrow>
          <Big value={week.checkins} label={week.checkins === 1 ? "check-in" : "check-ins"} />
          <Big value={week.bestStreak} label="best streak" />
        </View>
      ),
    },
  ];

  for (const person of week.members) {
    cards.push({
      key: person.memberId,
      background: colors.surface,
      content: (
        <View style={{ gap: spacing.xxl, alignItems: "center" }}>
          <Avatar name={person.name} emoji={person.avatar} photoUrl={person.photoUrl} size={96} ring={person.daysDone > 0} />
          <Text variant="title1" align="center">
            {person.name}
          </Text>
          {person.goal ? (
            <Text variant="callout" align="center" color={colors.secondaryLabel}>
              {`${person.emoji ?? ""} ${person.goal}`.trim()}
            </Text>
          ) : null}
          <Big value={`${person.daysDone}/7`} label="days done" />
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            {week.days.map((day, i) => (
              <View key={day} style={{ alignItems: "center", gap: spacing.xs }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: person.done[i] ? colors.accent : colors.fill,
                  }}
                />
                <Text variant="caption" color={colors.secondaryLabel}>
                  {weekdayLetter(day)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ),
    });
  }

  cards.push({
    key: "rainchecks",
    background: colors.coralSoft,
    content: (
      <View style={{ gap: spacing.xl, alignItems: "center", alignSelf: "stretch" }}>
        <Eyebrow>Rainchecks</Eyebrow>
        <View style={{ flexDirection: "row", gap: spacing.huge }}>
          <Big value={week.owed.length} label="owed" />
          <Big value={week.cashedIn.length} label="cashed in" />
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, justifyContent: "center" }}>
          {week.cashedIn.slice(0, 4).map((raincheck) =>
            raincheck.photoUrl ? (
              <Image key={raincheck._id} source={{ uri: raincheck.photoUrl }} style={{ width: 140, height: 140, borderRadius: radius.md }} />
            ) : (
              <Placeholder key={raincheck._id} height={140} icon="party.popper" label={raincheck.plan} tint="coral" style={{ width: 140 }} />
            ),
          )}
        </View>
        <View style={{ gap: spacing.xs }}>
          {week.owed.slice(0, 4).map((raincheck) => (
            <Text key={raincheck._id} variant="callout" align="center">
              {`☔️ ${raincheck.name} owes ${raincheck.plan}`}
            </Text>
          ))}
          {week.owed.length === 0 && week.cashedIn.length === 0 ? (
            <Text variant="callout" align="center" color={colors.secondaryLabel}>
              Not a drop of rain all week.
            </Text>
          ) : null}
        </View>
      </View>
    ),
  });

  cards.push({
    key: "closing",
    background: colors.rainSoft,
    content: (
      <View style={{ gap: spacing.lg, alignItems: "center" }}>
        <Text style={{ fontSize: 72 }}>🌙</Text>
        <Text variant="largeTitle" align="center">
          Bad days, good nights.
        </Text>
        <Text variant="title3" align="center" color={colors.secondaryLabel}>
          {`See you next week, ${week.groupName}.`}
        </Text>
      </View>
    ),
  });

  return cards;
}
