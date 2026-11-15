import { useMutation } from "convex/react";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { api } from "../../../convex/_generated/api";
import { Button, Icon, Input, Screen, Text } from "../../components/ui";
import { useSession } from "../../lib/session";
import { AVATARS, colors, spacing } from "../../lib/theme";

export default function JoinWithCode() {
  const params = useLocalSearchParams<{ code?: string }>();
  const [code, setCode] = useState((params.code ?? "").toUpperCase().slice(0, 6));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userId, setUserId } = useSession();
  const createUser = useMutation(api.users.create);
  const join = useMutation(api.groups.join);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const id = userId ?? (await createUser({ name: "Me", avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)] }));
      await join({ userId: id, inviteCode: code });
      await setUserId(id);
      router.replace("/onboarding/profile");
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message.includes("full") ? "That crew is full (6 max)." : message.includes("No group") ? "No crew with that code. Check it and try again." : "Couldn't join. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen
      footer={<Button testID="join-submit" label="Join crew" onPress={submit} loading={busy} disabled={code.length !== 6} />}
    >
      <Pressable testID="join-back" accessibilityRole="button" accessibilityLabel="Back" hitSlop={12} onPress={() => router.back()} style={{ paddingVertical: spacing.md }}>
        <Icon name="chevron.left" size={20} color={colors.secondaryLabel} weight="semibold" />
      </Pressable>
      <Text variant="title1" style={{ marginTop: spacing.xl }}>
        Got a code?
      </Text>
      <Text variant="callout" color={colors.secondaryLabel} style={{ marginTop: spacing.sm }}>
        Enter the 6 characters your friend sent you.
      </Text>
      <View style={{ marginTop: spacing.xxl }}>
        <Input
          testID="join-code-input"
          value={code}
          onChangeText={(text) => setCode(text.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 6))}
          placeholder="ABC123"
          autoCapitalize="characters"
          autoCorrect={false}
          autoFocus
          returnKeyType="done"
          maxLength={6}
          style={{ fontSize: 32, fontWeight: "700", letterSpacing: 8, textAlign: "center" }}
        />
        {error ? (
          <Text variant="footnote" color={colors.danger} style={{ marginTop: spacing.sm }}>
            {error}
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}
