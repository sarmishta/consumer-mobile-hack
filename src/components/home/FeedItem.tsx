import { Image, View } from "react-native";
import type { FunctionReturnType } from "convex/server";
import type { api } from "../../../convex/_generated/api";
import { colors, radius, spacing } from "../../lib/theme";
import { Avatar, Card, Icon, Text } from "../ui";
import { clockTime } from "./dates";

export type FeedEntry = NonNullable<FunctionReturnType<typeof api.feed.today>>["items"][number];

function ViaText() {
  return (
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
  );
}

/** Photo check-ins get the big card; no-photo check-ins are a compact row. */
export function FeedItem({ item }: { item: FeedEntry }) {
  const header = (
    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md }}>
      <Avatar name={item.name} photoUrl={item.avatarUrl} emoji={item.avatar} size={40} ring />
      <View style={{ flex: 1 }}>
        <Text variant="headline" weight="800" numberOfLines={1}>
          {item.name}
        </Text>
        <Text variant="footnote" color={colors.secondaryLabel} numberOfLines={1}>
          {item.goal ?? "No goal yet"}
        </Text>
        {!item.photoUrl && item.note ? (
          <Text variant="callout" weight="600" style={{ marginTop: spacing.xs }}>
            {item.note}
          </Text>
        ) : null}
      </View>
      <View style={{ alignItems: "flex-end", alignSelf: "flex-start", gap: spacing.xs }}>
        <Text variant="footnote" color={colors.tertiaryLabel}>
          {clockTime(item.createdAt)}
        </Text>
        {item.source === "text" ? <ViaText /> : null}
      </View>
    </View>
  );
  return (
    <View testID={"feed-item-" + item.checkinId}>
      <Card padded={false} style={{ overflow: "hidden" }}>
        {header}
        {item.photoUrl ? (
          <>
            <Image source={{ uri: item.photoUrl }} style={{ width: "100%", aspectRatio: 4 / 5, backgroundColor: colors.fill }} />
            {item.note ? (
              <Text variant="callout" weight="600" style={{ padding: spacing.lg }}>
                {item.note}
              </Text>
            ) : null}
          </>
        ) : null}
      </Card>
    </View>
  );
}
