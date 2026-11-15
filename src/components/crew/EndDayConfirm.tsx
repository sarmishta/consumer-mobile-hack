import { colors, spacing } from "../../lib/theme";
import { Button, Text } from "../ui";

export function EndDayConfirm({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <>
      <Text variant="title2">End the day?</Text>
      <Text variant="body" color={colors.secondaryLabel}>
        Anyone without a check-in gets a raincheck: a hangout they owe the crew.
      </Text>
      <Button testID="end-day-confirm" label="End day" icon="moon.fill" onPress={onConfirm} style={{ marginTop: spacing.md }} />
      <Button testID="end-day-cancel" label="Not yet" variant="plain" onPress={onCancel} />
    </>
  );
}
