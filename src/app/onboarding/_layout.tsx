import { Stack } from "expo-router";
import { OnboardingProvider } from "../../components/onboarding/store";
import { colors } from "../../lib/theme";

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="making" options={{ gestureEnabled: false, animation: "fade" }} />
        <Stack.Screen name="invite" options={{ gestureEnabled: false }} />
      </Stack>
    </OnboardingProvider>
  );
}
