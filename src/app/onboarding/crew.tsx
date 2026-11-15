import { router } from "expo-router";
import { Chip } from "../../components/ui";
import { KINDS } from "../../components/onboarding/options";
import { QuizStep } from "../../components/onboarding/QuizStep";
import { useOnboarding } from "../../components/onboarding/store";

export default function CrewQuestion() {
  const { kind, set } = useOnboarding();
  return (
    <QuizStep
      step={2}
      title="Who's in it with you?"
      subtitle="2 to 6 people. You'll invite them in a sec."
      canContinue={!!kind}
      onNext={() => router.push("/onboarding/nudge")}
    >
      {KINDS.map((k) => (
        <Chip key={k.kind} testID={`quiz-kind-${k.kind}`} label={k.label} icon={k.icon} selected={kind === k.kind} onPress={() => set({ kind: k.kind })} />
      ))}
    </QuizStep>
  );
}
