import { useConvex, useMutation } from "convex/react";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, View } from "react-native";
import { api } from "../../../convex/_generated/api";
import { KINDS, NUDGE_TIMES } from "../../components/onboarding/options";
import { Drizzle } from "../../components/characters";
import { useOnboarding } from "../../components/onboarding/store";
import { Button, Icon, Screen, Text } from "../../components/ui";
import { useSession } from "../../lib/session";
import { AVATARS, colors, localToday, radius, spacing } from "../../lib/theme";

const MIN_MS = 2600;

export default function MakingYourCrew() {
  const answers = useOnboarding();
  const { setUserId } = useSession();
  const convex = useConvex();
  const createUser = useMutation(api.users.create);
  const createGroup = useMutation(api.groups.create);
  const setGoal = useMutation(api.members.setGoal);
  const setPrefs = useMutation(api.profile.setMemberPrefs);
  const setStake = useMutation(api.stake.setStake);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const started = useRef(-1);

  const lines = [
    `${answers.emoji} ${answers.goal}`,
    `${KINDS.find((k) => k.kind === answers.kind)?.label ?? "Your"} crew`,
    `Nudge at ${NUDGE_TIMES.find((t) => t.value === answers.nudgeTime)?.label ?? "6 pm"}`,
    `Miss a day, owe ${answers.hangout.trim() || "tacos"}`,
  ];
  const [ticks] = useState(() => lines.map(() => new Animated.Value(0)));

  useEffect(() => {
    if (started.current === attempt) return;
    started.current = attempt;
    setError(false);
    ticks.forEach((t) => t.setValue(0));
    Animated.stagger(
      550,
      ticks.map((t) => Animated.timing(t, { toValue: 1, duration: 300, useNativeDriver: true })),
    ).start();

    const build = async () => {
      const kind = answers.kind ?? "friends";
      const userId = await createUser({ name: "Me", avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)] });
      const label = answers.goal.trim() || "Daily";
      const groupId = await createGroup({
        userId,
        kind,
        today: localToday(),
        hangout: answers.hangout.trim() || undefined,
        name: "My crew",
      });
      const mine = await convex.query(api.groups.mine, { userId });
      if (!mine) throw new Error("Member row missing after crew create");
      const memberId = mine.member._id;
      await setGoal({ memberId, goal: label, emoji: answers.emoji });
      await setPrefs({ memberId, goalType: answers.goalType ?? "custom", nudgeTime: answers.nudgeTime ?? "18:00" });
      if (answers.stakeKind && answers.hangout.trim()) {
        await setStake({ groupId, stake: answers.hangout, kind: answers.stakeKind }).catch((e) =>
          console.warn("Saving stake kind failed", e),
        );
      }
      await setUserId(userId);
    };

    Promise.all([build(), new Promise((resolve) => setTimeout(resolve, MIN_MS))])
      .then(() => router.replace("/onboarding/invite"))
      .catch((e) => {
        console.warn("Making crew failed", e);
        setError(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  return (
    <Screen background={colors.rainSoft}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.xxl }}>
        <Drizzle size={220} mood={error ? "sheepish" : "pumped"} />
        <Text variant="largeTitle" align="center">
          {error ? "Hit a puddle." : "Making your crew…"}
        </Text>
        <View style={{ gap: spacing.md, alignSelf: "stretch", paddingHorizontal: spacing.xxl }}>
          {lines.map((line, i) => (
            <Animated.View
              key={i}
              testID={`making-line-${i}`}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.md,
                backgroundColor: colors.surface,
                borderRadius: radius.pill,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.md,
                opacity: ticks[i],
                transform: [
                  { translateY: ticks[i].interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
                  { scale: ticks[i].interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
                  { rotate: i % 2 ? "1.5deg" : "-1.5deg" },
                ],
              }}
            >
              <Icon name="checkmark.circle.fill" size={24} color={colors.mint} />
              <Text variant="headline" weight="700" numberOfLines={1} style={{ flex: 1 }}>
                {line}
              </Text>
            </Animated.View>
          ))}
        </View>
        {error ? <Button testID="making-retry" label="Try again" onPress={() => setAttempt((n) => n + 1)} /> : null}
      </View>
    </Screen>
  );

}
