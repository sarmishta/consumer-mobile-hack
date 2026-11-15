import { useMutation } from "convex/react";
import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../convex/_generated/api";
import { Button, Card, Input, text } from "../components/ui";
import { useSession } from "../lib/session";
import { colors, localToday } from "../lib/theme";

export default function GroupSetup() {
  const { userId } = useSession();
  const createGroup = useMutation(api.groups.create);
  const joinGroup = useMutation(api.groups.join);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"friends" | "family">("friends");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<"create" | "join" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (which: "create" | "join") => {
    if (!userId) return;
    setBusy(which);
    setError(null);
    try {
      if (which === "create") await createGroup({ userId, name, kind, today: localToday() });
      else await joinGroup({ userId, inviteCode: code });
      router.replace("/goal");
    } catch (e) {
      setError(e instanceof Error ? e.message.replace(/^.*Uncaught Error: /, "").split("\n")[0] : "Something went wrong");
    } finally {
      setBusy(null);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.hero}>🏡</Text>
          <Text style={text.title}>Find your people</Text>
          <Text style={text.subtitle}>Start a group of 2 to 6, or join one with an invite code.</Text>

          <Card style={styles.card}>
            <Text style={text.label}>Start a group</Text>
            <Input
              testID="group-name-input"
              accessibilityLabel="Group name"
              placeholder="The Sunday Crew"
              value={name}
              onChangeText={setName}
              maxLength={32}
            />
            <View style={styles.kindRow}>
              {(["friends", "family"] as const).map((k) => (
                <Pressable
                  key={k}
                  testID={`group-kind-${k}`}
                  accessibilityRole="button"
                  accessibilityLabel={k}
                  accessibilityState={{ selected: kind === k }}
                  onPress={() => setKind(k)}
                  style={[styles.kind, kind === k && styles.kindSelected]}
                >
                  <Text style={styles.kindText}>{k === "friends" ? "🍻 Friends" : "🏠 Family"}</Text>
                </Pressable>
              ))}
            </View>
            <Button
              testID="create-group-button"
              label="Create group"
              onPress={() => run("create")}
              disabled={!name.trim()}
              loading={busy === "create"}
            />
          </Card>

          <Card style={styles.card}>
            <Text style={text.label}>Have a code?</Text>
            <Input
              testID="invite-code-input"
              accessibilityLabel="Invite code"
              placeholder="ABC123"
              value={code}
              onChangeText={(v) => setCode(v.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={6}
              style={styles.codeInput}
            />
            <Button
              testID="join-group-button"
              label="Join group"
              variant="secondary"
              onPress={() => run("join")}
              disabled={code.trim().length !== 6}
              loading={busy === "join"}
            />
          </Card>
          {error && <Text style={styles.error}>{error}</Text>}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 24, gap: 16, paddingBottom: 48 },
  hero: { fontSize: 64 },
  card: { gap: 14 },
  kindRow: { flexDirection: "row", gap: 10 },
  kind: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: colors.cardRaised,
    borderWidth: 2,
    borderColor: "transparent",
  },
  kindSelected: { borderColor: colors.amber },
  kindText: { color: colors.text, fontSize: 16, fontWeight: "700" },
  codeInput: { letterSpacing: 6, textAlign: "center", fontSize: 24 },
  error: { color: colors.amber, fontSize: 15, textAlign: "center" },
});
