import { router } from "expo-router";
import { Button, LargeTitle, Screen } from "../components/ui";

// Stub modal. T4 owns this screen.
export default function CashIn() {
  return (
    <Screen edges={["left", "right"]} style={{ paddingTop: 24 }}>
      <LargeTitle>Cash in</LargeTitle>
      <Button testID="cash-in-close" label="Close" variant="plain" onPress={() => router.back()} />
    </Screen>
  );
}
