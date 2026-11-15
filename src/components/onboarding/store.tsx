import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { GoalType, GroupKind } from "./options";

export type OnboardingAnswers = {
  goalType: GoalType | null;
  goal: string;
  emoji: string;
  kind: GroupKind | null;
  nudgeTime: string | null;
  hangout: string;
};

type Store = OnboardingAnswers & { set: (patch: Partial<OnboardingAnswers>) => void };

const OnboardingContext = createContext<Store | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    goalType: null,
    goal: "",
    emoji: "🌱",
    kind: null,
    nudgeTime: null,
    hangout: "",
  });
  const set = (patch: Partial<OnboardingAnswers>) => setAnswers((prev) => ({ ...prev, ...patch }));
  return <OnboardingContext.Provider value={{ ...answers, set }}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const store = useContext(OnboardingContext);
  if (!store) throw new Error("useOnboarding must be used inside OnboardingProvider");
  return store;
}
