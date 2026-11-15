import { useQuery } from "convex/react";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { api } from "../../convex/_generated/api";
import { useSession } from "../lib/session";
import { colors } from "../lib/theme";

export default function Gate() {
  const { ready, userId } = useSession();
  const user = useQuery(api.users.get, userId ? { userId } : "skip");
  const mine = useQuery(api.groups.mine, userId && user ? { userId } : "skip");

  if (ready && !userId) return <Redirect href="/onboarding" />;
  if (user === null) return <Redirect href="/onboarding" />;
  if (mine === null) return <Redirect href="/group-setup" />;
  if (mine && !mine.member.goal) return <Redirect href="/goal" />;
  if (mine) return <Redirect href="/today" />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color={colors.amber} size="large" />
    </View>
  );
}
