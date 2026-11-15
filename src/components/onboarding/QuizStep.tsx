import { router } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { colors, spacing } from "../../lib/theme";
import { Button, Icon, ProgressBar, Screen, Text } from "../ui";

export const QUIZ_STEPS = 4;

/** One-question quiz screen: back + progress on top, big question, answers, pinned Next. */
export function QuizStep({
  step,
  title,
  subtitle,
  canContinue,
  onNext,
  nextLabel = "Next",
  children,
}: {
  step: number;
  title: string;
  subtitle?: string;
  canContinue: boolean;
  onNext: () => void;
  nextLabel?: string;
  children: ReactNode;
}) {
  return (
    <Screen
      scroll
      footer={<Button testID="quiz-next" label={nextLabel} onPress={onNext} disabled={!canContinue} />}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.md }}>
        <Pressable testID="quiz-back" accessibilityRole="button" accessibilityLabel="Back" hitSlop={12} onPress={() => router.back()}>
          <Icon name="chevron.left" size={22} color={colors.label} weight="bold" />
        </Pressable>
        <ProgressBar value={step / QUIZ_STEPS} style={{ flex: 1 }} />
        <Text variant="sticker" color={colors.coral} style={{ fontSize: 16 }}>
          {step}/{QUIZ_STEPS}
        </Text>
      </View>
      <Text variant="largeTitle" style={{ marginTop: spacing.xl, fontSize: 34, lineHeight: 40 }}>
        {title}
      </Text>
      {subtitle ? (
        <Text variant="callout" weight="600" color={colors.secondaryLabel} style={{ marginTop: spacing.sm }}>
          {subtitle}
        </Text>
      ) : null}
      <View style={{ gap: spacing.md, marginTop: spacing.xxl }}>{children}</View>
    </Screen>
  );
}
