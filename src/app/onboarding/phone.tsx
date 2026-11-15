import { useMutation } from "convex/react";
import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { api } from "../../../convex/_generated/api";
import { toE164 } from "../../components/onboarding/options";
import { Button, Icon, Input, Screen, Text } from "../../components/ui";
import { useSession } from "../../lib/session";
import { colors, spacing } from "../../lib/theme";

export default function PhoneStep() {
  const { userId } = useSession();
  const update = useMutation(api.profile.update);
  const [raw, setRaw] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const phone = toE164(raw);

  const save = async () => {
    if (!userId || !phone) return;
    setBusy(true);
    setError(null);
    try {
      await update({ userId, phone });
      router.push("/onboarding/profile");
    } catch {
      setError("Couldn't save that number. Try again or skip.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen
      footer={
        <View style={{ gap: spacing.sm }}>
          <Button testID="phone-save" label="Text me" onPress={save} loading={busy} disabled={!phone} />
          <Button testID="phone-skip" variant="plain" label="Skip" onPress={() => router.push("/onboarding/profile")} />
        </View>
      }
    >
      <View style={{ marginTop: spacing.huge, alignItems: "flex-start" }}>
        <Icon name="message.badge" size={36} color={colors.rain} />
      </View>
      <Text variant="title1" style={{ marginTop: spacing.lg }}>
        Get your nudge by text
      </Text>
      <Text variant="callout" color={colors.secondaryLabel} style={{ marginTop: spacing.sm }}>
        Raincheck will text you a nudge each day. Reply “done” and it counts as a check-in.
      </Text>
      <Input
        testID="phone-input"
        value={raw}
        onChangeText={setRaw}
        placeholder="(415) 555-0123"
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
        autoComplete="tel"
        style={{ marginTop: spacing.xxl }}
      />
      <Text variant="footnote" color={error ? colors.danger : colors.tertiaryLabel} style={{ marginTop: spacing.sm }}>
        {error ?? (raw && !phone ? "US numbers work as is. Otherwise, start with your country code." : "One text a day. Msg & data rates may apply.")}
      </Text>
    </Screen>
  );
}
