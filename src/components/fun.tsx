import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { colors, gradients, radius, spacing, type } from "../lib/theme";

/** Springs its children in from small with an optional tilt and delay. */
export function PopIn({
  children,
  delay = 0,
  tilt = 0,
  style,
}: {
  children: ReactNode;
  delay?: number;
  tilt?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(delay, withSpring(1, { damping: 9, stiffness: 180 }));
  }, [delay, progress]);
  const animated = useAnimatedStyle(() => ({
    opacity: Math.min(1, progress.value * 2),
    transform: [{ scale: 0.4 + progress.value * 0.6 }, { rotate: tilt * progress.value + "deg" }],
  }));
  return <Animated.View style={[animated, style]}>{children}</Animated.View>;
}

/** Tilted story-style sticker label, e.g. "+1 day" or "owes tacos". */
export function Sticker({
  label,
  color = colors.accent,
  ink = colors.label,
  tilt = -4,
  delay = 0,
  size = "md",
  style,
}: {
  label: string;
  color?: string;
  ink?: string;
  tilt?: number;
  delay?: number;
  size?: "sm" | "md" | "lg";
  style?: StyleProp<ViewStyle>;
}) {
  const fontSize = { sm: 14, md: 19, lg: 28 }[size];
  return (
    <PopIn delay={delay} tilt={tilt} style={[{ alignSelf: "flex-start" }, style]}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.xs,
          backgroundColor: color,
          borderRadius: radius.pill,
          paddingHorizontal: size === "sm" ? spacing.md : spacing.lg,
          paddingVertical: size === "sm" ? spacing.xxs + 1 : spacing.xs + 2,
          borderWidth: 3,
          borderColor: colors.white,
          shadowColor: "#2A1A00",
          shadowOpacity: 0.18,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        }}
      >
        <Text style={[type.sticker, { color: ink, fontSize, lineHeight: fontSize + 5 }]}>
          {label}
        </Text>
      </View>
    </PopIn>
  );
}

/** Gradient story ring around children. pulse breathes the ring for whoever checked in today. */
export function StoryRing({
  children,
  size,
  thickness = 3,
  active = true,
  pulse = active,
  colorsOverride,
}: {
  children: ReactNode;
  size: number;
  thickness?: number;
  active?: boolean;
  pulse?: boolean;
  colorsOverride?: readonly [string, string, ...string[]];
}) {
  const breathe = useSharedValue(0);
  useEffect(() => {
    if (!pulse) {
      breathe.value = 0;
      return;
    }
    breathe.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
    );
  }, [pulse, breathe]);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: 1 + breathe.value * 0.06 }] }));
  const outer = size + thickness * 4;
  return (
    <View style={{ width: outer, height: outer, alignItems: "center", justifyContent: "center" }}>
      {active ? (
        <Animated.View style={[{ position: "absolute", width: outer, height: outer }, animated]}>
          <LinearGradient
            colors={colorsOverride ?? gradients.story}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={{ width: outer, height: outer, borderRadius: outer / 2 }}
          />
        </Animated.View>
      ) : (
        <View
          style={{
            position: "absolute",
            width: outer,
            height: outer,
            borderRadius: outer / 2,
            borderWidth: 2,
            borderColor: colors.tertiaryLabel,
            borderStyle: "dashed",
          }}
        />
      )}
      <View
        style={{
          width: size + thickness * 2,
          height: size + thickness * 2,
          borderRadius: size,
          backgroundColor: colors.white,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </View>
    </View>
  );
}

/** Bold gradient color block with big rounded corners. */
export function GradientCard({
  colors: stops,
  children,
  style,
}: {
  colors: readonly [string, string, ...string[]];
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <LinearGradient
      colors={stops}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ borderRadius: radius.xl, padding: spacing.xl, overflow: "hidden" }, style]}
    >
      {children}
    </LinearGradient>
  );
}
