import { useQuery } from "convex/react";
import * as Sharing from "expo-sharing";
import { router } from "expo-router";
import { useRef, useState } from "react";
import type { ComponentRef } from "react";
import { Alert, Pressable, View } from "react-native";
import { captureRef } from "react-native-view-shot";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../convex/_generated/api";
import { buildSlides } from "../components/crew/ReelSlides";
import { Button, Icon, Text } from "../components/ui";
import { useCurrentMember } from "../lib/session";
import { colors, radius, spacing } from "../lib/theme";

export default function Reel() {
  const { group } = useCurrentMember();
  const week = useQuery(api.reel.week, group ? { groupId: group._id } : "skip");
  const [index, setIndex] = useState(0);
  const [sharing, setSharing] = useState(false);
  const slideRef = useRef<ComponentRef<typeof View>>(null);

  const slides = week ? buildSlides(week) : [];
  const current = Math.min(index, Math.max(0, slides.length - 1));
  const slide = slides[current];

  const share = async () => {
    setSharing(true);
    try {
      const uri = await captureRef(slideRef, { format: "png", quality: 1 });
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Sharing isn't available here");
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: "image/png", UTI: "public.png", dialogTitle: "Share to Stories" });
    } finally {
      setSharing(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: slide?.background ?? colors.surface }}>
      <View style={{ flexDirection: "row", gap: spacing.xs, paddingHorizontal: spacing.md, paddingTop: spacing.sm }}>
        {slides.map((item, i) => (
          <View
            key={item.key}
            style={{
              flex: 1,
              height: 3,
              borderRadius: radius.pill,
              backgroundColor: i <= current ? colors.label : "rgba(0,0,0,0.15)",
            }}
          />
        ))}
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
        <Text variant="subhead" weight="700" style={{ flex: 1 }}>
          Sunday Reel
        </Text>
        <Pressable testID="reel-close" accessibilityRole="button" accessibilityLabel="Close" hitSlop={12} onPress={() => router.back()}>
          <Icon name="xmark" size={20} weight="semibold" />
        </Pressable>
      </View>

      <View style={{ flex: 1 }}>
        <View
          ref={slideRef}
          collapsable={false}
          style={{
            flex: 1,
            backgroundColor: slide?.background ?? colors.surface,
            justifyContent: "center",
            alignItems: "center",
            padding: spacing.xxl,
          }}
        >
          {slide ? slide.content : <Text color={colors.secondaryLabel}>Rolling the reel…</Text>}
          <Text
            variant="footnote"
            weight="700"
            color={colors.secondaryLabel}
            style={{ position: "absolute", bottom: spacing.lg, letterSpacing: 2 }}
          >
            RAINCHECK
          </Text>
        </View>
        <View style={{ ...absoluteFill, flexDirection: "row" }}>
          <Pressable
            testID="reel-prev"
            accessibilityLabel="Previous"
            style={{ flex: 1 }}
            onPress={() => setIndex(Math.max(0, current - 1))}
          />
          <Pressable
            testID="reel-next"
            accessibilityLabel="Next"
            style={{ flex: 2 }}
            onPress={() => (current < slides.length - 1 ? setIndex(current + 1) : router.back())}
          />
        </View>
      </View>

      <View style={{ padding: spacing.lg }}>
        <Button testID="reel-share" label="Share to Stories" icon="square.and.arrow.up" loading={sharing} disabled={!slide} onPress={share} />
      </View>
    </SafeAreaView>
  );
}

const absoluteFill = { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 } as const;
