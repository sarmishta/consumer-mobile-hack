import { Image, View } from "react-native";
import type { FunctionReturnType } from "convex/server";
import type { api } from "../../../convex/_generated/api";
import { colors, gradients, radius, spacing } from "../../lib/theme";
import { GradientCard } from "../fun";
import { Avatar, Card, Icon, Text } from "../ui";
import { clockTime } from "./dates";

export type FeedEntry = NonNullable<FunctionReturnType<typeof api.feed.today>>["items"][number];

const BLOCKS = [gradients.sunrise, gradients.coral, gradients.mint, gradients.rain] as const;

export function FeedItem({ item }: { item: FeedEntry }) {
  const block = BLOCKS[item.name.length % BLOCKS.length];
  return (
    <View testID={"feed-item-" + item.checkinId}>
      <Card padded={false} style={{ overflow: "hidden" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md }}>
          <Avatar name={item.name} photoUrl={item.avatarUrl} emoji={item.avatar} size={40} ring />
          <View style={{ flex: 1 }}>
            <Text variant="headline" weight="800" numberOfLines={1}>
              {item.name}
            </Text>
            <Text variant="footnote" color={colors.secondaryLabel} numberOfLines={1}>
              {item.goal ?? "No goal yet"}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end", gap: spacing.xs }}>
            <Text variant="footnote" color={colors.tertiaryLabel}>
              {clockTime(item.createdAt)}
            </Text>
            {item.source === "text" ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.xxs + 2,
                  backgroundColor: colors.rain,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xxs,
                  borderRadius: radius.pill,
                  transform: [{ rotate: "3deg" }],
                }}
              >
                <Icon name="message.fill" size={11} color={colors.white} />
                <Text variant="caption" color={colors.white} weight="800">
                  via text
                </Text>
              </View>
            ) : null}
          </View>
        </View>
        {item.photoUrl ? (
          <Image source={{ uri: item.photoUrl }} style={{ width: "100%", aspectRatio: 4 / 3, backgroundColor: colors.fill }} />
        ) : (
          <GradientCard
            colors={block}
            style={{ borderRadius: 0, height: 120, alignItems: "center", justifyContent: "center", gap: spacing.xs, padding: spacing.md }}
          >
            <Icon name={item.source === "text" ? "message.fill" : "checkmark.circle.fill"} size={40} color={colors.white} weight="bold" />
            <Text variant="sticker" color={colors.white}>
              Showed up
            </Text>
          </GradientCard>
        )}
        {item.note ? (
          <Text variant="callout" weight="600" style={{ padding: spacing.lg }}>
            {item.note}
          </Text>
        ) : null}
      </Card>
    </View>
  );
}
