import { router } from "expo-router";
import { View } from "react-native";
import { Raindrop } from "../../components/onboarding/Raindrop";
import { Button, Screen, Text } from "../../components/ui";
import { colors, spacing } from "../../lib/theme";

export default function Splash() {
  return (
    <Screen
      background={colors.surface}
      footer={
        <View style={{ gap: spacing.sm }}>
          <Button testID="splash-start" label="Get started" onPress={() => router.push("/onboarding/goal")} />
          <Button testID="splash-join" variant="plain" label="Have an invite code?" onPress={() => router.push("/onboarding/join")} />
        </View>
      }
    >
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 120 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: spacing.md, marginBottom: spacing.xxxl }}>
          <Raindrop size={28} color={colors.rainSoft} />
          <Raindrop size={64} />
          <Raindrop size={20} color={colors.accent} />
        </View>
        <Text variant="largeTitle" align="center">
          Raincheck
        </Text>
        <Text variant="title3" color={colors.secondaryLabel} align="center" style={{ marginTop: spacing.sm }}>
          Bad days, good nights.
        </Text>
        <Text variant="callout" color={colors.tertiaryLabel} align="center" style={{ marginTop: spacing.xl, maxWidth: 280 }}>
          A daily goal with your people. Miss a day and you owe them a hangout.
        </Text>
      </View>
    </Screen>
  );
}
