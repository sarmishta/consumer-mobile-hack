import { useMutation, useQuery } from "convex/react";
import { Redirect, router } from "expo-router";
import { ActivityIndicator, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../convex/_generated/api";
import { Button, Card, Raindrop, text } from "../components/ui";
import { useSession } from "../lib/session";
import { colors } from "../lib/theme";

export default function Group() {
  const { userId } = useSession();
  const mine = useQuery(api.groups.mine, userId ? { userId } : "skip");
  const rainchecks = useQuery(api.rainchecks.listOpen, mine ? { groupId: mine.group._id } : "skip");
  const cashIn = useMutation(api.rainchecks.cashIn);

  if (mine === null) return <Redirect href="/" />;
  if (!mine || !rainchecks) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.amber} size="large" />
      </View>
    );
  }

  const { group } = mine;

  const share = () =>
    Share.share({
      message: `Join "${group.name}" on RAINCHECK. One daily goal, and a missed day means you owe us a hangout. Invite code: ${group.inviteCode}`,
    });

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Button testID="back-button" label="‹ Today" variant="ghost" onPress={() => router.back()} style={styles.back} />
        <Text style={text.title}>{group.name}</Text>
        <Text style={text.subtitle}>{group.kind === "family" ? "🏠 Family" : "🍻 Friends"} · Bad days, good nights.</Text>

        <Card style={styles.inviteCard}>
          <Text style={text.label}>Invite code</Text>
          <Text testID="invite-code-text" style={styles.code} selectable>
            {group.inviteCode}
          </Text>
          <Button testID="share-invite-button" label="Share invite" variant="secondary" onPress={share} />
        </Card>

        <View style={styles.sectionHeader}>
          <Raindrop size={12} />
          <Text style={text.label}>Open rainchecks</Text>
        </View>

        {rainchecks.length === 0 ? (
          <Card style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌤️</Text>
            <Text style={styles.emptyText}>Clear skies. Nobody owes anything yet.</Text>
          </Card>
        ) : (
          rainchecks.map((r) => (
            <Card key={r._id} style={styles.raincheck}>
              <View style={styles.raincheckTop}>
                <Text style={styles.raincheckAvatar}>{r.avatar}</Text>
                <View style={{ flex: 1 }}>
                  <Text testID={`raincheck-text-${r._id}`} style={styles.raincheckText}>
                    {r.name} owes the group {r.plan}
                  </Text>
                  <Text style={styles.raincheckDay}>Missed {r.day}</Text>
                </View>
              </View>
              <Button testID={`cash-in-button-${r._id}`} label="Cash it in" onPress={() => cashIn({ raincheckId: r._id })} />
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  loading: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  content: { padding: 24, gap: 16, paddingBottom: 48 },
  back: { alignSelf: "flex-start", paddingHorizontal: 0, minHeight: 36 },
  inviteCard: { gap: 12, alignItems: "stretch" },
  code: { color: colors.amber, fontSize: 40, fontWeight: "900", letterSpacing: 10, textAlign: "center" },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 },
  empty: { alignItems: "center", gap: 8, paddingVertical: 28 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { color: colors.muted, fontSize: 16 },
  raincheck: { gap: 14 },
  raincheckTop: { flexDirection: "row", alignItems: "center", gap: 14 },
  raincheckAvatar: { fontSize: 40 },
  raincheckText: { color: colors.text, fontSize: 20, fontWeight: "800" },
  raincheckDay: { color: colors.muted, fontSize: 14, marginTop: 2 },
});
