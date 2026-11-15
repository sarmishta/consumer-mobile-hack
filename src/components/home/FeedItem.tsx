import { Image, View } from "react-native";
import type { FunctionReturnType } from "convex/server";
import type { api } from "../../../convex/_generated/api";
import { colors, radius, spacing } from "../../lib/theme";
import { Avatar, Card, Icon, Placeholder, Text } from "../ui";
import { clockTime } from "./dates";

export type FeedEntry = NonNullable<FunctionReturnType<typeof api.feed.today>>["items"][number];

export function FeedItem({ item }: { item: FeedEntry }) {
  return (
    <View testID={`feed-item-${item.checkinId}`}>
    <Card padded={false} style={{ overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.lg }}>
        <Avatar name={item.name} photoUrl={item.avatarUrl} emoji={item.avatar} size={40} />
        <View style={{ flex: 1 }}>
          <Text variant="headline" numberOfLines={1}>
            {item.name}
          </Text>
          <Text variant="footnote" color={colors.secondaryLabel} numberOfLines={1}>
            {[item.emoji, item.goal ?? "No goal yet"].filter(Boolean).join(" ")}
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
                backgroundColor: colors.rainSoft,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xxs,
                borderRadius: radius.pill,
              }}
            >
              <Icon name="message.fill" size={11} color={colors.rain} />
              <Text variant="caption" color={colors.rain} weight="600">
                via text
              </Text>
            </View>
          ) : null}
        </View>
      </View>
      {item.photoUrl ? (
        <Image source={{ uri: item.photoUrl }} style={{ width: "100%", aspectRatio: 4 / 3, backgroundColor: colors.fill }} />
      ) : (
        <Placeholder
          height={120}
          icon={item.source === "text" ? "message" : "checkmark.circle"}
          label="Showed up"
          style={{ borderRadius: 0 }}
        />
      )}
      {item.note ? (
        <Text variant="callout" style={{ padding: spacing.lg }}>
          {item.note}
        </Text>
      ) : null}
    </Card>
    </View>
  );
}
