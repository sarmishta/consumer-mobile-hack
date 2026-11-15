import { router } from "expo-router";
import { Button, LargeTitle, Screen } from "../components/ui";

// Stub full-screen modal. T4 owns this screen.
export default function Reel() {
  return (
    <Screen>
      <LargeTitle>Reel</LargeTitle>
      <Button testID="reel-close" label="Close" variant="plain" onPress={() => router.back()} />
    </Screen>
  );
}
