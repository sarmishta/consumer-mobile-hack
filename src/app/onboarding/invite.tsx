import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Share, View } from "react-native";
import { GradientCard, Sticker } from "../../components/fun";
import { Button, Icon, Screen, Text } from "../../components/ui";
import type { SymbolName } from "../../components/ui";
import { useCurrentMember } from "../../lib/session";
import { colors, gradients, radius, spacing } from "../../lib/theme";

type Channel = { id: string; label: string; icon: SymbolName };

const CHANNELS: Channel[] = [
  { id: "instagram", label: "Instagram", icon: "camera" },
  { id: "snapchat", label: "Snapchat", icon: "bubble.left" },
  { id: "whatsapp", label: "WhatsApp", icon: "phone.bubble" },
  { id: "messages", label: "Messages", icon: "message" },
];

export default function Invite() {
  const current = useCurrentMember();
  const [copied, setCopied] = useState(false);

  if (current.status !== "ready") {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accentInk} />
        </View>
      </Screen>
    );
  }

  const { group } = current;
  const code = group.inviteCode;
  const link = Linking.createURL("onboarding/join", { queryParams: { code } });
  const owe = group.hangout ?? "tacos";
  const message = `Join my crew on Raincheck. We each pick a daily goal, and if you miss a day you owe the crew ${owe}. Code: ${code} ${link}`;

  const share = async (channel: string) => {
    try {
      if (channel === "messages") {
        await Linking.openURL(`sms:&body=${encodeURIComponent(message)}`);
        return;
      }
      if (channel === "whatsapp") {
        const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
        if (await Linking.canOpenURL(url)) {
          await Linking.openURL(url);
          return;
        }
      }
      await Share.share({ message });
    } catch (e) {
      console.warn("Share failed", e);
    }
  };

  const copy = async () => {
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const next = () => router.push("/onboarding/phone");

  return (
    <Screen
      scroll
      footer={
        <View style={{ gap: spacing.sm }}>
          <Button testID="invite-continue" label="Continue" onPress={next} />
          <Button testID="invite-start-solo" variant="plain" label="Start solo. They can join later." onPress={next} />
        </View>
      }
    >
      <Text variant="largeTitle" style={{ marginTop: spacing.xxl }}>
        Your crew is ready.
      </Text>
      <Text variant="callout" weight="600" color={colors.secondaryLabel} style={{ marginTop: spacing.sm }}>
        Invite up to 5 people. It&apos;s more fun when someone else might owe {owe}.
      </Text>

      <GradientCard colors={gradients.story} style={{ marginTop: spacing.xxl, alignItems: "center", gap: spacing.sm }}>
        <Sticker label="INVITE CODE" color={colors.white} tilt={-4} size="sm" style={{ alignSelf: "center" }} />
        <View testID="invite-code">
          <Text variant="display" color={colors.white} style={{ fontSize: 50, lineHeight: 58, letterSpacing: 6 }}>
            {code}
          </Text>
        </View>
        <Text variant="caption" color={colors.onColor} numberOfLines={1}>
          {link}
        </Text>
        <Button
          testID="invite-copy"
          small
          variant="secondary"
          icon={copied ? "checkmark" : "doc.on.doc"}
          label={copied ? "Copied" : "Copy code"}
          onPress={copy}
          style={{ marginTop: spacing.sm }}
        />
      </GradientCard>

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: spacing.xxl }}>
        {CHANNELS.map((c) => (
          <Pressable
            key={c.id}
            testID={`invite-share-${c.id}`}
            accessibilityRole="button"
            accessibilityLabel={`Share on ${c.label}`}
            onPress={() => share(c.id)}
            style={({ pressed }) => ({ alignItems: "center", gap: spacing.xs, width: 76, opacity: pressed ? 0.6 : 1 })}
          >
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: radius.pill,
                backgroundColor: colors.surface,
                borderWidth: 2,
                borderColor: colors.label,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name={c.icon} size={26} color={colors.label} />
            </View>
            <Text variant="caption" weight="700" color={colors.label}>
              {c.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
