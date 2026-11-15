import { colors, spacing } from "../../lib/theme";
import { View } from "react-native";
import { AnimatedEmoji } from "../fun";
import { Button, Text } from "../ui";

export function EndDayConfirm({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
        <AnimatedEmoji name="moon" size={44} />
        <Text variant="largeTitle" style={{ fontSize: 32, lineHeight: 38 }}>
          End the day?
        </Text>
      </View>
      <Text variant="body" color={colors.secondaryLabel}>
        Anyone without a check-in gets a raincheck: a hangout they owe the crew.
      </Text>
      <Button testID="end-day-confirm" label="End day" icon="moon.fill" haptic onPress={onConfirm} style={{ marginTop: spacing.md }} />
      <Button testID="end-day-cancel" label="Not yet" variant="plain" onPress={onCancel} />
    </>
  );
}
