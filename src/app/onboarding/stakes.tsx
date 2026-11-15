import { router } from "expo-router";
import { QuizStep } from "../../components/onboarding/QuizStep";
import { StakePicker } from "../../components/onboarding/StakePicker";
import { useOnboarding } from "../../components/onboarding/store";

export default function StakesQuestion() {
  const { hangout, stakeKind, set } = useOnboarding();
  return (
    <QuizStep
      step={4}
      title="What does a missed day cost?"
      subtitle="Miss a day and you owe the crew. A raincheck, not a fine."
      canContinue={!!stakeKind && hangout.trim().length > 0}
      nextLabel="Make my crew"
      onNext={() => router.push("/onboarding/making")}
    >
      <StakePicker kind={stakeKind} stake={hangout} onChange={(kind, stake) => set({ stakeKind: kind, hangout: stake })} />
    </QuizStep>
  );
}
