import { View } from "react-native";
import { colors, spacing } from "../../lib/theme";
import { AnimatedEmoji, PopIn, Sticker } from "../fun";
import { Button, Text } from "../ui";

export type RaincheckMomentData = {
  mine: { plan: string } | null;
  others: { name: string; plan: string }[];
};

export function RaincheckMoment({ data, onClose }: { data: RaincheckMomentData; onClose: () => void }) {
  const clean = !data.mine && data.others.length === 0;
  return (
    <View style={{ alignItems: "center", gap: spacing.lg }}>
      <PopIn
        tilt={-6}
        style={{
          width: 132,
          height: 132,
          borderRadius: 66,
          backgroundColor: clean ? colors.grapeSoft : colors.coralSoft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AnimatedEmoji name={clean ? "moon" : "umbrella"} size={96} />
      </PopIn>
      {data.mine ? (
        <>
          <Text variant="largeTitle" align="center" style={{ fontSize: 32, lineHeight: 38 }}>
            Missed today? No fine.
          </Text>
          <Sticker
            label={"You owe " + data.mine.plan}
            color={colors.coral}
            ink={colors.white}
            tilt={-4}
            delay={250}
            style={{ alignSelf: "center" }}
          />
        </>
      ) : (
        <Text variant="largeTitle" align="center" style={{ fontSize: 32, lineHeight: 38 }}>
          {clean ? "Clean sweep. Everyone showed up." : "The day's done."}
        </Text>
      )}
      {data.others.length > 0 ? (
        <View style={{ gap: spacing.sm, alignItems: "center" }}>
          {data.others.map((other, i) => (
            <Sticker
              key={i}
              label={other.name + " owes " + other.plan}
              color={i % 2 ? colors.accent : colors.coral}
              ink={i % 2 ? colors.label : colors.white}
              tilt={i % 2 ? 4 : -4}
              delay={350 + i * 150}
              style={{ alignSelf: "center" }}
            />
          ))}
        </View>
      ) : null}
      <Text variant="footnote" color={colors.secondaryLabel} align="center">
        Bad days, good nights.
      </Text>
      <Button testID="raincheck-moment-close" label="Deal" onPress={onClose} style={{ alignSelf: "stretch" }} />
    </View>
  );
}
