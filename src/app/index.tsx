import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useCurrentMember } from "../lib/session";
import { colors } from "../lib/theme";

export default function Index() {
  const { status } = useCurrentMember();
  if (status === "ready") return <Redirect href="/(tabs)" />;
  if (status === "signedOut" || status === "noGroup") return <Redirect href="/onboarding" />;
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color={colors.accentInk} size="large" />
    </View>
  );
}
