import { router } from "expo-router";
import { useState } from "react";
import { Chip, Input } from "../../components/ui";
import { HANGOUTS } from "../../components/onboarding/options";
import { QuizStep } from "../../components/onboarding/QuizStep";
import { useOnboarding } from "../../components/onboarding/store";

export default function StakesQuestion() {
  const { hangout, set } = useOnboarding();
  const [picked, setPicked] = useState<string | null>(() => {
    if (!hangout) return null;
    return HANGOUTS.find((h) => h.id !== "custom" && h.label.toLowerCase() === hangout.toLowerCase())?.id ?? "custom";
  });
  return (
    <QuizStep
      step={4}
      title="What does a missed day cost?"
      subtitle="Miss a day and you owe the crew this. A raincheck, not a penalty."
      canContinue={hangout.trim().length > 0}
      nextLabel="Make my crew"
      onNext={() => router.push("/onboarding/making")}
    >
      {HANGOUTS.map((h) => (
        <Chip
          key={h.id}
          testID={`quiz-hangout-${h.id}`}
          label={h.label}
          emoji={h.emoji}
          selected={picked === h.id}
          onPress={() => {
            setPicked(h.id);
            set({ hangout: h.id === "custom" ? "" : h.label.toLowerCase() });
          }}
        />
      ))}
      {picked === "custom" ? (
        <Input
          testID="quiz-hangout-input"
          value={hangout}
          onChangeText={(text) => set({ hangout: text })}
          placeholder="e.g. karaoke"
          maxLength={40}
          autoFocus
          returnKeyType="done"
        />
      ) : null}
    </QuizStep>
  );
}
