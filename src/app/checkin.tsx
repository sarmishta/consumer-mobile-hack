import { router } from "expo-router";
import { Button, LargeTitle, Screen } from "../components/ui";

// Stub modal. T3 owns this screen.
export default function CheckIn() {
  return (
    <Screen edges={["left", "right"]} style={{ paddingTop: 24 }}>
      <LargeTitle>Check in</LargeTitle>
      <Button testID="checkin-close" label="Close" variant="plain" onPress={() => router.back()} />
    </Screen>
  );
}
