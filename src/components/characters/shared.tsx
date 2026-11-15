import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Circle, Ellipse, G, Path } from "react-native-svg";

/** The one outline colour every character shares. */
export const INK = "#2B2B2B";
/** Outline width in the 120-unit drawing grid. */
export const LINE = 4.5;

export const outline = {
  stroke: INK,
  strokeWidth: LINE,
  strokeLinejoin: "round",
  strokeLinecap: "round",
} as const;

/** Pop-in spring on mount plus a slow idle bob. Wraps one character. */
export function Idle({
  size,
  animated,
  energy = 1,
  wobble = 0,
  style,
  children,
}: {
  size: number;
  animated: boolean;
  /** Bob height multiplier. */
  energy?: number;
  /** Side-to-side tilt in degrees. */
  wobble?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  const pop = useSharedValue(animated ? 0.6 : 1);
  const bob = useSharedValue(0);

  useEffect(() => {
    if (!animated) return;
    pop.value = withSpring(1, { damping: 9, stiffness: 160 });
    bob.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1100 / Math.sqrt(energy), easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1100 / Math.sqrt(energy), easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
    );
  }, [animated, energy, pop, bob]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -bob.value * size * 0.035 * energy },
      { rotate: `${(bob.value - 0.5) * wobble}deg` },
      { scale: pop.value },
    ],
  }));

  return <Animated.View style={[{ width: size, height: size }, animatedStyle, style]}>{children}</Animated.View>;
}

/** True for a moment every few seconds. */
export function useBlink(enabled: boolean) {
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let timer: ReturnType<typeof setTimeout>;
    const open = () => {
      setClosed(false);
      timer = setTimeout(shut, 2600 + Math.random() * 2800);
    };
    const shut = () => {
      setClosed(true);
      timer = setTimeout(open, 130);
    };
    timer = setTimeout(shut, 1800 + Math.random() * 2000);
    return () => clearTimeout(timer);
  }, [enabled]);
  return enabled && closed;
}

export type EyeKind = "dot" | "shut" | "half" | "joy" | "big";

/** A dot eye with a white highlight, or one of its closed variants. */
export function Eye({
  x,
  y,
  r = 5,
  kind = "dot",
  look = 0,
  tilt = 0,
}: {
  x: number;
  y: number;
  r?: number;
  kind?: EyeKind;
  /** Shifts the highlight sideways, in grid units, so the eye looks left or right. */
  look?: number;
  /** Degrees the lid of a half-closed eye droops. */
  tilt?: number;
}) {
  if (kind === "shut") {
    return <Path d={`M${x - r} ${y} Q${x} ${y + r * 0.7} ${x + r} ${y}`} fill="none" {...outline} strokeWidth={3.2} />;
  }
  if (kind === "joy") {
    return <Path d={`M${x - r} ${y + 2} Q${x} ${y - r * 1.3} ${x + r} ${y + 2}`} fill="none" {...outline} strokeWidth={3.4} />;
  }
  if (kind === "half") {
    return (
      <G transform={`rotate(${tilt} ${x} ${y})`}>
        <Path d={`M${x - r} ${y} A${r} ${r} 0 0 0 ${x + r} ${y} Z`} fill={INK} />
        <Path d={`M${x - r - 1.5} ${y} H${x + r + 1.5}`} fill="none" {...outline} strokeWidth={3} />
      </G>
    );
  }
  const big = kind === "big";
  const radius = big ? r * 1.15 : r;
  return (
    <G>
      <Circle cx={x} cy={y} r={radius} fill={INK} />
      <Circle cx={x - radius * 0.3 + look} cy={y - radius * 0.36} r={radius * 0.36} fill="#FFFFFF" />
      {big ? <Circle cx={x + radius * 0.38 + look} cy={y + radius * 0.34} r={radius * 0.18} fill="#FFFFFF" /> : null}
    </G>
  );
}

export function Blush({ x, y, rx = 6, ry = 3.6, color = "#FF8E7A" }: { x: number; y: number; rx?: number; ry?: number; color?: string }) {
  return <Ellipse cx={x} cy={y} rx={rx} ry={ry} fill={color} opacity={0.8} />;
}

/** Small umbrella centred on its pole top, canopy about 44 units wide. Shared by Drizzle and the Umbrella icon. */
export function UmbrellaShape({ color = "#FF6B5B", stripe = "#FFD45C" }: { color?: string; stripe?: string }) {
  return (
    <G>
      <Path d="M0 -22 V20 Q0 27 5.5 27 Q10 27 10 22" fill="none" {...outline} strokeWidth={4} />
      <Path
        d="M-23 0 C-22 -27 22 -28 23 0 Q17 -5.5 11.5 0 Q5.5 -5.5 0 0 Q-6 -5.5 -11.5 0 Q-17 -5.5 -23 0 Z"
        fill={color}
        {...outline}
        strokeWidth={4}
      />
      <Path d="M-11.5 -1 Q-10 -14 -1 -19.5" fill="none" stroke={stripe} strokeWidth={3} strokeLinecap="round" />
    </G>
  );
}

/** Four-point sparkle path centred on 0,0 with the given radius. */
export function sparklePath(r: number) {
  const k = r * 0.16;
  return `M0 ${-r} Q${k} ${-k} ${r} 0 Q${k} ${k} 0 ${r} Q${-k} ${k} ${-r} 0 Q${-k} ${-k} 0 ${-r} Z`;
}

/** Teardrop path centred near 0,0, about 2r tall. */
export function dropPath(r: number) {
  return `M${r * 0.15} ${-r * 1.3} C${-r * 0.1} ${-r * 0.5} ${-r} ${-r * 0.1} ${-r} ${r * 0.45} A${r} ${r} 0 0 0 ${r} ${r * 0.45} C${r} ${-r * 0.1} ${r * 0.3} ${-r * 0.5} ${r * 0.15} ${-r * 1.3} Z`;
}
