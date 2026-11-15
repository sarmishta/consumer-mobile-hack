import { router } from "expo-router";
import { View } from "react-native";
import type { Id } from "../../../convex/_generated/dataModel";
import { colors, radius, spacing } from "../../lib/theme";
import { Avatar, Button, Text } from "../ui";
import { formatDay } from "./format";

export function RaincheckCard({
  raincheck,
}: {
  raincheck: { _id: Id<"rainchecks">; name: string; avatar: string; plan: string; day: string };
}) {
  return (
    <View
      style={{
        backgroundColor: colors.coralSoft,
        borderRadius: radius.lg,
        padding: spacing.lg,
        gap: spacing.md,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
        <Avatar name={raincheck.name} emoji={raincheck.avatar} size={40} />
        <View style={{ flex: 1 }}>
          <Text variant="headline">
            {raincheck.name} owes the crew {raincheck.plan}
          </Text>
          <Text variant="footnote" color={colors.secondaryLabel}>
            Rain on {formatDay(raincheck.day)}
          </Text>
        </View>
        <Text style={{ fontSize: 28 }}>☔️</Text>
      </View>
      <Button
        testID={`cash-in-button-${raincheck._id}`}
        label="Cash it in"
        icon="sparkles"
        small
        variant="secondary"
        style={{ backgroundColor: colors.white }}
        onPress={() => router.push({ pathname: "/cash-in", params: { id: raincheck._id } })}
      />
    </View>
  );
}
