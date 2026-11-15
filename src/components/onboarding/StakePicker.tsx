import { Pressable, View } from "react-native";
import { colors, radius, spacing } from "../../lib/theme";
import { Chip, Input, Text } from "../ui";
import { STAKE_KINDS } from "./options";
import type { StakeKind } from "./options";

/** Pick a kind of stake, then write exactly what's owed. */
export function StakePicker({
  kind,
  stake,
  onChange,
}: {
  kind: StakeKind | null;
  stake: string;
  onChange: (kind: StakeKind, stake: string) => void;
}) {
  const current = STAKE_KINDS.find((k) => k.kind === kind);
  return (
    <View style={{ gap: spacing.md }}>
      {STAKE_KINDS.map((k) => (
        <Chip
          key={k.kind}
          testID={"stake-kind-" + k.kind}
          label={k.label}
          icon={k.icon}
          selected={kind === k.kind}
          onPress={() => onChange(k.kind, kind === k.kind ? stake : k.examples[0])}
        />
      ))}
      {current ? (
        <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
          <Text variant="footnote" weight="800">
            BE SPECIFIC
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            {current.examples.map((example, i) => (
              <Pressable
                key={example}
                testID={"stake-example-" + i}
                accessibilityRole="button"
                accessibilityLabel={example}
                onPress={() => onChange(current.kind, example)}
                style={({ pressed }) => ({
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.xs + 2,
                  borderRadius: radius.pill,
                  backgroundColor: stake === example ? colors.label : colors.surface,
                  borderWidth: 2,
                  borderColor: stake === example ? colors.label : colors.separator,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text variant="subhead" weight="700" color={stake === example ? colors.white : colors.label}>
                  {example}
                </Text>
              </Pressable>
            ))}
          </View>
          <Input
            testID="stake-input"
            value={stake}
            onChangeText={(text) => onChange(current.kind, text)}
            placeholder="Miss a day, you owe the crew…"
            maxLength={40}
            returnKeyType="done"
          />
          {stake.trim() ? (
            <Text variant="footnote" color={colors.secondaryLabel}>
              {"Miss a day and you owe the crew " + stake.trim() + "."}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
