import { View } from "react-native";
import { colors, spacing } from "../../lib/theme";
import { Button, Text } from "../ui";

export type RaincheckMomentData = {
  mine: { plan: string } | null;
  others: { name: string; plan: string }[];
};

export function RaincheckMoment({ data, onClose }: { data: RaincheckMomentData; onClose: () => void }) {
  const clean = !data.mine && data.others.length === 0;
  return (
    <View style={{ alignItems: "center", gap: spacing.lg }}>
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: clean ? colors.accentSoft : colors.coralSoft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 52 }}>{clean ? "🌙" : "☔️"}</Text>
      </View>
      {data.mine ? (
        <>
          <Text variant="title2" align="center">
            Missed today? No fine.
          </Text>
          <Text variant="title3" align="center" color={colors.coral}>
            You owe the crew {data.mine.plan}.
          </Text>
        </>
      ) : (
        <Text variant="title2" align="center">
          {clean ? "Clean sweep. Everyone showed up." : "The day's done."}
        </Text>
      )}
      {data.others.length > 0 ? (
        <View style={{ gap: spacing.xs }}>
          {data.others.map((other, i) => (
            <Text key={i} variant="callout" align="center" color={colors.secondaryLabel}>
              {other.name} owes the crew {other.plan}
            </Text>
          ))}
        </View>
      ) : null}
      <Text variant="footnote" color={colors.tertiaryLabel} align="center">
        Bad days, good nights.
      </Text>
      <Button testID="raincheck-moment-close" label="Deal" onPress={onClose} style={{ alignSelf: "stretch" }} />
    </View>
  );
}
