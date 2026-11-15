import type { FunctionReturnType } from "convex/server";
import type { ReactNode } from "react";
import { Image, View } from "react-native";
import type { api } from "../../../convex/_generated/api";
import { colors, gradients, radius, spacing } from "../../lib/theme";
import { AnimatedEmoji, PopIn, Sticker } from "../fun";
import { Avatar, Text } from "../ui";
import { weekdayLetter } from "./format";

type Week = NonNullable<FunctionReturnType<typeof api.reel.week>>;
type Stops = readonly [string, string, ...string[]];
export type Slide = { key: string; background: string; gradient: Stops; content: ReactNode };

const WHITE_SOFT = "rgba(255,255,255,0.82)";
const PERSON_GRADIENTS = [gradients.coral, gradients.rain, gradients.mint, gradients.sunrise] as const;

function Big({ value, label, delay = 0 }: { value: string | number; label: string; delay?: number }) {
  return (
    <PopIn delay={delay} style={{ alignItems: "center" }}>
      <Text variant="display" color={colors.white} style={{ fontSize: 96, lineHeight: 104 }}>
        {value}
      </Text>
      <Text variant="title3" weight="800" color={WHITE_SOFT}>
        {label}
      </Text>
    </PopIn>
  );
}

function Eyebrow({ children }: { children: string }) {
  return <Sticker label={children} color={colors.white} tilt={-4} style={{ alignSelf: "center" }} />;
}

export function buildSlides(week: Week): Slide[] {
  const cards: Slide[] = [
    {
      key: "crew",
      background: gradients.sunrise[1],
      gradient: gradients.sunrise,
      content: (
        <View style={{ gap: spacing.xxl, alignItems: "center" }}>
          <Eyebrow>{week.groupName + " · this week"}</Eyebrow>
          <AnimatedEmoji name="fire" size={96} />
          <Big value={week.checkins} label={week.checkins === 1 ? "check-in" : "check-ins"} delay={100} />
          <Big value={week.bestStreak} label="best streak" delay={250} />
        </View>
      ),
    },
  ];

  week.members.forEach((person, index) => {
    const gradient = PERSON_GRADIENTS[index % PERSON_GRADIENTS.length];
    cards.push({
      key: person.memberId,
      background: gradient[1],
      gradient,
      content: (
        <View style={{ gap: spacing.xl, alignItems: "center" }}>
          <PopIn tilt={-4}>
            <Avatar name={person.name} emoji={person.avatar} photoUrl={person.photoUrl} size={110} ring={person.daysDone > 0} ringColor={colors.white} />
          </PopIn>
          <Text variant="display" color={colors.white} align="center">
            {person.name}
          </Text>
          {person.goal ? <Sticker label={((person.emoji ?? "") + " " + person.goal).trim()} color={colors.white} tilt={3} delay={150} style={{ alignSelf: "center" }} /> : null}
          <Big value={person.daysDone + "/7"} label="days done" delay={250} />
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            {week.days.map((day, i) => (
              <View key={day} style={{ alignItems: "center", gap: spacing.xs }}>
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    backgroundColor: person.done[i] ? colors.white : "rgba(255,255,255,0.25)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {person.done[i] ? <Text style={{ fontSize: 16, lineHeight: 20 }}>🔥</Text> : null}
                </View>
                <Text variant="caption" weight="800" color={WHITE_SOFT}>
                  {weekdayLetter(day)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ),
    });
  });

  cards.push({
    key: "rainchecks",
    background: gradients.coral[1],
    gradient: gradients.coral,
    content: (
      <View style={{ gap: spacing.xl, alignItems: "center", alignSelf: "stretch" }}>
        <Eyebrow>Rainchecks</Eyebrow>
        <AnimatedEmoji name="umbrella" size={88} />
        <View style={{ flexDirection: "row", gap: spacing.huge }}>
          <Big value={week.owed.length} label="owed" />
          <Big value={week.cashedIn.length} label="cashed in" delay={150} />
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, justifyContent: "center" }}>
          {week.cashedIn.slice(0, 4).map((raincheck, i) =>
            raincheck.photoUrl ? (
              <Image key={raincheck._id} source={{ uri: raincheck.photoUrl }} style={{ width: 130, height: 130, borderRadius: radius.lg, borderWidth: 4, borderColor: colors.white }} />
            ) : (
              <Sticker key={raincheck._id} label={raincheck.plan + " ✓"} color={colors.white} tilt={i % 2 ? 5 : -5} delay={300 + i * 120} emoji="party" />
            ),
          )}
        </View>
        <View style={{ gap: spacing.sm, alignItems: "center" }}>
          {week.owed.slice(0, 4).map((raincheck, i) => (
            <Sticker
              key={raincheck._id}
              label={raincheck.name + " owes " + raincheck.plan}
              color={colors.accent}
              tilt={i % 2 ? 4 : -4}
              delay={400 + i * 120}
              size="sm"
            />
          ))}
          {week.owed.length === 0 && week.cashedIn.length === 0 ? (
            <Text variant="title3" align="center" color={colors.white}>
              Not a drop of rain all week.
            </Text>
          ) : null}
        </View>
      </View>
    ),
  });

  cards.push({
    key: "closing",
    background: gradients.night[1],
    gradient: gradients.night,
    content: (
      <View style={{ gap: spacing.lg, alignItems: "center" }}>
        <AnimatedEmoji name="moon" size={130} />
        <Text variant="display" color={colors.white} align="center">
          Bad days, good nights.
        </Text>
        <Sticker label={"See you next week, " + week.groupName} color={colors.accent} tilt={-3} delay={200} style={{ alignSelf: "center" }} />
      </View>
    ),
  });

  return cards;
}
