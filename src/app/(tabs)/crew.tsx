import { router } from "expo-router";
import { View } from "react-native";
import { Button, LargeTitle, Screen } from "../../components/ui";
import { spacing } from "../../lib/theme";

// Stub. T4 owns this screen.
export default function Crew() {
  return (
    <Screen scroll>
      <LargeTitle>Crew</LargeTitle>
      <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
        <Button testID="crew-cash-in" label="Cash in a raincheck" variant="secondary" onPress={() => router.push("/cash-in")} />
        <Button testID="crew-reel" label="Play the reel" variant="secondary" onPress={() => router.push("/reel")} />
      </View>
    </Screen>
  );
}
