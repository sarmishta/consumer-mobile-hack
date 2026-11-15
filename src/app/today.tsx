import { useMutation, useQuery } from "convex/react";
import { Redirect, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../convex/_generated/api";
import { Button, Card, text } from "../components/ui";
import { useSession } from "../lib/session";
import { colors } from "../lib/theme";

function formatDay(day: string) {
  return new Date(`${day}T12:00:00`).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

export default function Today() {
  const { userId } = useSession();
  const mine = useQuery(api.groups.mine, userId ? { userId } : "skip");
  const board = useQuery(api.members.board, mine ? { groupId: mine.group._id } : "skip");
  const checkIn = useMutation(api.checkins.checkIn);
  const endDay = useMutation(api.rainchecks.endDay);
  const [checking, setChecking] = useState(false);
  const [ending, setEnding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  if (mine === null) return <Redirect href="/" />;
  if (!mine || !board) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.amber} size="large" />
      </View>
    );
  }

  const me = board.members.find((m) => m.memberId === mine.member._id);
  const doneCount = board.members.filter((m) => m.doneToday).length;

  const onCheckIn = async () => {
    if (!me) return;
    setChecking(true);
    try {
      await checkIn({ memberId: me.memberId });
    } finally {
      setChecking(false);
    }
  };

  const onEndDay = async () => {
    setEnding(true);
    try {
      const issued = await endDay({ groupId: board.group._id, day: board.group.currentDay });
      setNotice(
        issued === 0
          ? "Clean sweep. Nobody owes anything tonight. 🌙"
          : `Day closed. ${issued} raincheck${issued === 1 ? "" : "s"} owed to the group. ☔`,
      );
    } finally {
      setEnding(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={text.label}>{formatDay(board.group.currentDay)}</Text>
            <Text style={text.title} numberOfLines={1}>{board.group.name}</Text>
          </View>
          <Button
            testID="open-group-button"
            label="☔ Group"
            variant="secondary"
            onPress={() => router.push("/group")}
            style={styles.headerButton}
          />
        </View>

        {me && (
          <Card style={styles.goalCard}>
            <View style={styles.goalTop}>
              <Text style={styles.goalEmoji}>{me.emoji}</Text>
              <View style={styles.streakPill}>
                <Text style={styles.streakText}>🔥 {me.streak} day{me.streak === 1 ? "" : "s"}</Text>
              </View>
            </View>
            <Text style={text.label}>My goal</Text>
            <Text testID="my-goal-text" style={styles.goalText}>{me.goal}</Text>
            {me.doneToday ? (
              <View testID="checked-in-state" style={styles.doneBadge}>
                <Text style={styles.doneBadgeText}>✓ Done today. Nice.</Text>
              </View>
            ) : (
              <Button testID="check-in-button" label="Done today" onPress={onCheckIn} loading={checking} big />
            )}
            <Button testID="edit-goal-button" label="Change goal" variant="ghost" onPress={() => router.push("/goal")} />
          </Card>
        )}

        <View style={styles.sectionHeader}>
          <Text style={text.label}>Your people</Text>
          <Text style={styles.count}>{doneCount}/{board.members.length} done</Text>
        </View>

        {board.members.map((m) => (
          <View key={m.memberId} testID={`member-row-${m.memberId}`} style={styles.memberRow}>
            <Text style={styles.memberAvatar}>{m.avatar}</Text>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.memberName}>
                {m.name}
                {m.memberId === me?.memberId ? " (you)" : ""}
              </Text>
              <Text style={styles.memberGoal} numberOfLines={1}>
                {m.goal ? `${m.emoji ?? ""} ${m.goal}` : "Still picking a goal…"}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end", gap: 4 }}>
              <Text style={[styles.status, m.doneToday ? styles.statusDone : styles.statusPending]}>
                {m.doneToday ? "✓ done" : "not yet"}
              </Text>
              <Text style={styles.memberStreak}>🔥 {m.streak}</Text>
            </View>
          </View>
        ))}

        {board.members.length < 2 && (
          <Text style={styles.hint}>Invite your people from the Group screen. Rainchecks need company.</Text>
        )}

        {notice && (
          <Card style={styles.notice}>
            <Text testID="end-day-notice" style={styles.noticeText}>{notice}</Text>
          </Card>
        )}

        <View style={styles.endDay}>
          <Button testID="end-day-button" label="🌙 End day" variant="ghost" onPress={onEndDay} loading={ending} />
          <Text style={styles.endDayHint}>Demo control: closes today for the whole group.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  loading: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  content: { padding: 24, gap: 16, paddingBottom: 48 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerButton: { minHeight: 44, paddingHorizontal: 16, borderRadius: 999 },
  goalCard: { gap: 12, paddingVertical: 24 },
  goalTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  goalEmoji: { fontSize: 64 },
  streakPill: { backgroundColor: colors.cardRaised, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  streakText: { color: colors.amber, fontSize: 16, fontWeight: "800" },
  goalText: { color: colors.text, fontSize: 30, fontWeight: "800", letterSpacing: -0.3 },
  doneBadge: {
    minHeight: 76,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cardRaised,
    borderWidth: 2,
    borderColor: colors.done,
  },
  doneBadgeText: { color: colors.done, fontSize: 22, fontWeight: "800" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  count: { color: colors.amber, fontSize: 15, fontWeight: "700" },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
  },
  memberAvatar: { fontSize: 36 },
  memberName: { color: colors.text, fontSize: 18, fontWeight: "700" },
  memberGoal: { color: colors.muted, fontSize: 15 },
  status: { fontSize: 14, fontWeight: "800", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, overflow: "hidden" },
  statusDone: { color: colors.bg, backgroundColor: colors.done },
  statusPending: { color: colors.rain, backgroundColor: colors.cardRaised },
  memberStreak: { color: colors.muted, fontSize: 13, fontWeight: "700" },
  hint: { color: colors.muted, fontSize: 15, textAlign: "center", paddingHorizontal: 12 },
  notice: { backgroundColor: colors.cardRaised },
  noticeText: { color: colors.text, fontSize: 17, fontWeight: "600", textAlign: "center" },
  endDay: { alignItems: "center", marginTop: 8 },
  endDayHint: { color: colors.faint, fontSize: 13 },
});
