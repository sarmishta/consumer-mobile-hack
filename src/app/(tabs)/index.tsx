import { router } from "expo-router";
import { Button, LargeTitle, Screen, Text } from "../../components/ui";
import { useCurrentMember } from "../../lib/session";
import { colors, spacing } from "../../lib/theme";

// Stub. T3 owns this screen.
export default function Home() {
  const { group } = useCurrentMember();
  return (
    <Screen scroll>
      <LargeTitle eyebrow={group?.name}>Today</LargeTitle>
      <Text color={colors.secondaryLabel} style={{ marginBottom: spacing.xxl }}>
        Bad days, good nights.
      </Text>
      <Button testID="home-checkin" label="Check in" icon="checkmark" onPress={() => router.push("/checkin")} />
    </Screen>
  );
}
