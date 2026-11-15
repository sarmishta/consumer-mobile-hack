import { LargeTitle, Placeholder, Screen, Text } from "../../components/ui";
import { colors, spacing } from "../../lib/theme";

// Stub. T2 owns this screen.
export default function OnboardingStart() {
  return (
    <Screen scroll>
      <LargeTitle subtitle="Bad days, good nights.">RAINCHECK</LargeTitle>
      <Placeholder height={220} icon="cloud.rain" tint="rain" style={{ marginVertical: spacing.xxl }} />
      <Text color={colors.secondaryLabel}>Onboarding is coming.</Text>
    </Screen>
  );
}
