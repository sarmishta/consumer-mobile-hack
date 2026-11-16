import { useMutation } from "convex/react";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, View } from "react-native";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { colors, gradients, radius, spacing } from "../../lib/theme";
import { Drizzle, Flame } from "../characters";
import { GradientCard, Sticker } from "../fun";
import { Button, Text } from "../ui";
import type { FeedEntry } from "./FeedItem";

export function GoalCard({
  memberId,
  emoji,
  goal,
  streak,
  mine,
}: {
  memberId: Id<"members">;
  emoji: string | null;
  goal: string | null;
  streak: number;
  mine: FeedEntry | null;
}) {
  const checkIn = useMutation(api.checkins.checkIn);
  const [busy, setBusy] = useState(false);
  const [pumped, setPumped] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pumped) return;
    const timer = setTimeout(() => setPumped(false), 2000);
    return () => clearTimeout(timer);
  }, [pumped]);

  const oneTapCheckIn = async () => {
    setBusy(true);
    setError(null);
    try {
      await checkIn({ memberId, source: "app" });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPumped(true);
    } catch (e) {
      console.warn("Check-in failed", e);
      setError("Couldn't check in. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <GradientCard colors={gradients.rain}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
        <Drizzle size={96} mood={pumped ? "pumped" : mine ? "happy" : "sleepy"} style={{ margin: -14 }} />
        <View style={{ flex: 1 }}>
          <Text variant="caption" color={colors.onColor} weight="800" style={{ letterSpacing: 0.8 }}>
            MY GOAL
          </Text>
          <Text variant="title2" color={colors.white} numberOfLines={2}>
            {goal ? (emoji ? emoji + " " : "") + goal : "Pick a goal"}
          </Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <View style={{ opacity: streak > 0 ? 1 : 0.45 }}>
            <Flame size={40} face={streak > 0} />
          </View>
          <Text variant="largeTitle" color={colors.white} style={{ fontSize: 30, lineHeight: 32 }}>
            {streak}
          </Text>
          <Text variant="caption" color={colors.onColor} weight="700">
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
          <View style={{ gap: spacing.sm }}>
            <Button testID="check-in-button" label="Check in" icon="checkmark" haptic loading={busy} onPress={oneTapCheckIn} />
            <Button
              testID="checkin-with-photo"
              label="Add a photo or note"
              variant="secondary"
              small
              icon="camera.fill"
              onPress={() => router.push("/checkin")}
            />
            {error ? (
              <Text variant="footnote" color={colors.white} weight="700" align="center">
                {error}
              </Text>
            ) : null}
          </View>
        )}
      </View>
    </GradientCard>
  );
}
