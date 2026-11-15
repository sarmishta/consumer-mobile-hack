import { router } from "expo-router";
import { Image, View } from "react-native";
import { colors, gradients, radius, spacing } from "../../lib/theme";
import { AnimatedEmoji, GradientCard, Sticker } from "../fun";
import { Button, Text } from "../ui";
import type { FeedEntry } from "./FeedItem";

export function GoalCard({
  emoji,
  goal,
  streak,
  mine,
}: {
  emoji: string | null;
  goal: string | null;
  streak: number;
  mine: FeedEntry | null;
}) {
  return (
    <GradientCard colors={gradients.rain}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: "rgba(255,255,255,0.22)",
            alignItems: "center",
            justifyContent: "center",
            transform: [{ rotate: "-6deg" }],
          }}
        >
          <Text style={{ fontSize: 32, lineHeight: 40 }}>{emoji ?? "🎯"}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="caption" color="rgba(255,255,255,0.8)" weight="800" style={{ letterSpacing: 0.8 }}>
            MY GOAL
          </Text>
          <Text variant="title2" color={colors.white} numberOfLines={2}>
            {goal ?? "Pick a goal"}
          </Text>
        </View>
        <View style={{ alignItems: "center" }}>
          {streak > 0 ? <AnimatedEmoji name="fire" size={44} /> : <Text style={{ fontSize: 30, lineHeight: 44, opacity: 0.5 }}>🔥</Text>}
          <Text variant="largeTitle" color={colors.white} style={{ fontSize: 30, lineHeight: 32 }}>
            {streak}
          </Text>
          <Text variant="caption" color="rgba(255,255,255,0.85)" weight="700">
            {streak === 1 ? "day" : "days"}
          </Text>
        </View>
      </View>

      <View style={{ marginTop: spacing.lg }}>
        {mine ? (
          <View style={{ gap: spacing.md }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" }}>
              <Sticker label="Checked in today" color={colors.mint} ink={colors.white} tilt={-3} />
              <Sticker label="+1 day" color={colors.accent} tilt={5} delay={200} size="sm" />
            </View>
            {mine.photoUrl ? (
              <Image
                source={{ uri: mine.photoUrl }}
                style={{ width: "100%", aspectRatio: 4 / 3, borderRadius: radius.lg, backgroundColor: colors.fill }}
              />
            ) : null}
            {mine.note ? (
              <Text variant="callout" color={colors.white} weight="600">
                {mine.note}
              </Text>
            ) : null}
            {!mine.photoUrl || !mine.note ? (
              <Button
                testID="checkin-add-more"
                label={mine.photoUrl ? "Add a note" : "Add a photo or note"}
                variant="secondary"
                small
                icon="camera.fill"
                onPress={() => router.push("/checkin")}
              />
            ) : null}
          </View>
        ) : (
          <Button testID="check-in-button" label="Check in" icon="checkmark" haptic onPress={() => router.push("/checkin")} />
        )}
      </View>
    </GradientCard>
  );
}
