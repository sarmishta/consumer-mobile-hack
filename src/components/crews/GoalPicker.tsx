import { View } from "react-native";
import { GOAL_DEFAULTS, testIdSlug } from "../onboarding/options";
import type { GoalType } from "../onboarding/options";
import { Chip, Input } from "../ui";
import { GOAL_TYPES, spacing } from "../../lib/theme";

export type CrewGoal = { goalType: GoalType | null; goal: string; emoji: string };

export function GoalPicker({ value, onChange }: { value: CrewGoal; onChange: (goal: CrewGoal) => void }) {
  return (
    <View style={{ gap: spacing.sm }}>
      {GOAL_TYPES.map((type) => (
        <Chip
          key={type}
          testID={`crew-goal-${testIdSlug(type)}`}
          label={GOAL_DEFAULTS[type].label}
          emoji={GOAL_DEFAULTS[type].emoji}
          selected={value.goalType === type}
          onPress={() => onChange({ goalType: type, goal: GOAL_DEFAULTS[type].goal, emoji: GOAL_DEFAULTS[type].emoji })}
        />
      ))}
      <Input
        testID="crew-goal-input"
        value={value.goal}
        onChangeText={(goal) => onChange({ ...value, goalType: value.goalType ?? "custom", goal })}
        placeholder="My goal for this crew"
        maxLength={60}
        returnKeyType="done"
      />
    </View>
  );
}
