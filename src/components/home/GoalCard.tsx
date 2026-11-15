import { router } from "expo-router";
import { Image, View } from "react-native";
import { colors, radius, spacing } from "../../lib/theme";
import { Button, Card, Icon, Text } from "../ui";
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
    <Card>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: radius.md,
            backgroundColor: colors.accentSoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 28 }}>{emoji ?? "🎯"}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="footnote" color={colors.secondaryLabel} weight="600">
            MY GOAL
          </Text>
          <Text variant="headline" numberOfLines={2}>
            {goal ?? "Pick a goal"}
          </Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <Text variant="title2" color={streak > 0 ? colors.accentInk : colors.tertiaryLabel}>
            {streak}
          </Text>
          <Text variant="caption" color={colors.secondaryLabel}>
            {streak === 1 ? "day" : "days"}
          </Text>
        </View>
      </View>

      <View style={{ marginTop: spacing.lg }}>
        {mine ? (
          <View style={{ gap: spacing.md }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
              <Icon name="checkmark.circle.fill" size={20} color={colors.success} />
              <Text variant="headline" color={colors.success}>
                Checked in today
              </Text>
            </View>
            {mine.photoUrl ? (
              <Image
                source={{ uri: mine.photoUrl }}
                style={{ width: "100%", aspectRatio: 4 / 3, borderRadius: radius.md, backgroundColor: colors.fill }}
              />
            ) : null}
            {mine.note ? <Text variant="callout">{mine.note}</Text> : null}
            {!mine.photoUrl || !mine.note ? (
              <Button
                testID="checkin-add-more"
                label={mine.photoUrl ? "Add a note" : "Add a photo or note"}
                variant="plain"
                small
                onPress={() => router.push("/checkin")}
              />
            ) : null}
          </View>
        ) : (
          <Button testID="check-in-button" label="Check in" icon="checkmark" onPress={() => router.push("/checkin")} />
        )}
      </View>
    </Card>
  );
}
