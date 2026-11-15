import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SessionProvider, useCurrentMember } from "../lib/session";
import { colors } from "../lib/theme";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

function OnboardingGate() {
  const { status } = useCurrentMember();
  const segments = useSegments();
  const router = useRouter();
  const inOnboarding = segments[0] === "onboarding";

  useEffect(() => {
    if ((status === "signedOut" || status === "noGroup") && !inOnboarding) {
      router.replace("/onboarding");
    }
  }, [status, inOnboarding, router]);

  return null;
}

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <SessionProvider>
        <StatusBar style="dark" />
        <OnboardingGate />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
          <Stack.Screen name="checkin" options={{ presentation: "modal" }} />
          <Stack.Screen name="cash-in" options={{ presentation: "modal" }} />
          <Stack.Screen name="reel" options={{ presentation: "fullScreenModal" }} />
        </Stack>
      </SessionProvider>
    </ConvexProvider>
  );
}
