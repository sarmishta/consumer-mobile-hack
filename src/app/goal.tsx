import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../convex/_generated/api";
import { Button, EmojiPicker, Input, text } from "../components/ui";
import { useSession } from "../lib/session";
import { GOAL_EMOJIS, colors } from "../lib/theme";

const IDEAS = ["Hit the gym", "Call Mom", "Read 10 pages", "Walk 8k steps"];

export default function Goal() {
  const { userId } = useSession();
  const mine = useQuery(api.groups.mine, userId ? { userId } : "skip");
  const setGoal = useMutation(api.members.setGoal);
  const [goalDraft, setGoalText] = useState<string | null>(null);
  const [emojiDraft, setEmoji] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const goal = goalDraft ?? mine?.member.goal ?? "";
  const emoji = emojiDraft ?? mine?.member.emoji ?? GOAL_EMOJIS[0];

  const submit = async () => {
    if (!mine || !goal.trim()) return;
    setSaving(true);
    try {
      await setGoal({ memberId: mine.member._id, goal, emoji });
      router.replace("/today");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.hero}>{emoji}</Text>
          <Text style={text.title}>One goal. Every day.</Text>
          <Text style={text.subtitle}>
            {mine ? `Your crew in ${mine.group.name} will see this.` : "Your crew will see this."}
          </Text>
          <Input
            testID="goal-input"
            accessibilityLabel="Daily goal"
            placeholder="Read 10 pages"
            value={goal}
            onChangeText={setGoalText}
            maxLength={60}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ideas}>
            {IDEAS.map((idea, i) => (
              <Button
                key={idea}
                testID={`goal-idea-${i}`}
                label={idea}
                variant="ghost"
                onPress={() => setGoalText(idea)}
                style={styles.idea}
              />
            ))}
          </ScrollView>
          <Text style={text.label}>Pick an emoji</Text>
          <EmojiPicker options={GOAL_EMOJIS} value={emoji} onChange={setEmoji} testIDPrefix="goal-emoji" />
          <Button testID="save-goal-button" label="Save my goal" onPress={submit} disabled={!goal.trim() || !mine} loading={saving} big />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 24, gap: 18, paddingBottom: 48 },
  hero: { fontSize: 72 },
  ideas: { gap: 8 },
  idea: { minHeight: 40, backgroundColor: colors.card, paddingHorizontal: 16, borderRadius: 999 },
});
