import { Stack } from "expo-router";
import { colors } from "../../lib/theme";

// T2 owns everything under onboarding/.
export default function OnboardingLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />;
}
