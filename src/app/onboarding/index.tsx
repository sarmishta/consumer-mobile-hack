import { router } from "expo-router";
import { View } from "react-native";
import { AnimatedEmoji, PopIn, Sticker } from "../../components/fun";
import { Button, Screen, Text } from "../../components/ui";
import { colors, spacing } from "../../lib/theme";

export default function Splash() {
  return (
    <Screen
      background={colors.accentSoft}
      footer={
        <View style={{ gap: spacing.sm }}>
          <Button testID="splash-start" label="Get started" onPress={() => router.push("/onboarding/goal")} />
          <Button testID="splash-join" variant="plain" label="Have an invite code?" onPress={() => router.push("/onboarding/join")} />
        </View>
      }
    >
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 120 }}>
        <PopIn style={{ marginBottom: spacing.xl }}>
          <AnimatedEmoji name="rain" size={150} />
        </PopIn>
        <Text variant="display" align="center" style={{ fontSize: 60, lineHeight: 66 }}>
          RAINCHECK
        </Text>
        <Sticker label="Bad days, good nights." color={colors.coral} ink={colors.white} tilt={-4} delay={200} style={{ alignSelf: "center", marginTop: spacing.sm }} />
        <Text variant="callout" weight="600" color={colors.secondaryLabel} align="center" style={{ marginTop: spacing.xl, maxWidth: 280 }}>
          Everyone picks a daily goal. Miss a day and you owe your crew.
        </Text>
      </View>
    </Screen>
  );
}
