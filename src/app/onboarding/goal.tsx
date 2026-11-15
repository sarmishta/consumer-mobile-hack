import { router } from "expo-router";
import { Chip, Input } from "../../components/ui";
import { GOAL_DEFAULTS, testIdSlug } from "../../components/onboarding/options";
import { QuizStep } from "../../components/onboarding/QuizStep";
import { useOnboarding } from "../../components/onboarding/store";
import { GOAL_TYPES } from "../../lib/theme";

export default function GoalQuestion() {
  const { goalType, goal, set } = useOnboarding();
  return (
    <QuizStep
      step={1}
      title="What's your daily goal?"
      subtitle="Pick one. You can tweak the wording."
      canContinue={!!goalType && goal.trim().length > 0}
      onNext={() => router.push("/onboarding/crew")}
    >
      {GOAL_TYPES.map((type) => (
        <Chip
          key={type}
          testID={`quiz-goal-${testIdSlug(type)}`}
          label={GOAL_DEFAULTS[type].label}
          emoji={GOAL_DEFAULTS[type].emoji}
          selected={goalType === type}
          onPress={() => set({ goalType: type, goal: GOAL_DEFAULTS[type].goal, emoji: GOAL_DEFAULTS[type].emoji })}
        />
      ))}
      {goalType ? (
        <Input
          testID="quiz-goal-input"
          value={goal}
          onChangeText={(text) => set({ goal: text })}
          placeholder="e.g. Run 2 mi"
          maxLength={60}
          autoFocus={goalType === "custom"}
          returnKeyType="done"
        />
      ) : null}
    </QuizStep>
  );
}
