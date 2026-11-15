import { router } from "expo-router";
import { Chip } from "../../components/ui";
import { NUDGE_TIMES } from "../../components/onboarding/options";
import { QuizStep } from "../../components/onboarding/QuizStep";
import { useOnboarding } from "../../components/onboarding/store";

export default function NudgeQuestion() {
  const { nudgeTime, set } = useOnboarding();
  return (
    <QuizStep
      step={3}
      title="When do you want the nudge?"
      subtitle="One gentle reminder a day."
      canContinue={!!nudgeTime}
      onNext={() => router.push("/onboarding/stakes")}
    >
      {NUDGE_TIMES.map((t) => (
        <Chip
          key={t.value}
          testID={`quiz-time-${t.value.replace(":", "")}`}
          label={t.label}
          icon={t.icon}
          selected={nudgeTime === t.value}
          onPress={() => set({ nudgeTime: t.value })}
        />
      ))}
    </QuizStep>
  );
}
