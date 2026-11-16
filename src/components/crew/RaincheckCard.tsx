import { router } from "expo-router";
import { View } from "react-native";
import type { Id } from "../../../convex/_generated/dataModel";
import { colors, gradients, spacing } from "../../lib/theme";
import { Drizzle } from "../characters";
import { GradientCard, Sticker } from "../fun";
import { Avatar, Button, Text } from "../ui";
import { formatDay } from "./format";

export function RaincheckCard({
  raincheck,
}: {
  raincheck: { _id: Id<"rainchecks">; name: string; avatar: string; plan: string; day: string };
}) {
  return (
    <GradientCard colors={gradients.coral} style={{ gap: spacing.md }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
        <Avatar name={raincheck.name} emoji={raincheck.avatar} size={48} ring ringColor={colors.white} />
        <View style={{ flex: 1 }}>
          <Text variant="title3" color={colors.white} weight="800">
            {raincheck.name} owes the crew
          </Text>
          <Text variant="footnote" color={colors.onColor}>
            Rain on {formatDay(raincheck.day)}
          </Text>
        </View>
        <Drizzle size={84} mood="sheepish" animated={false} style={{ margin: -16 }} />
      </View>
      <Sticker label={raincheck.plan} color={colors.accent} tilt={-4} />
      <Button
        testID={"cash-in-button-" + raincheck._id}
        label="Cash it in"
        icon="sparkles"
        small
        variant="secondary"
        onPress={() => router.push({ pathname: "/cash-in", params: { id: raincheck._id } })}
      />
    </GradientCard>
  );
}
