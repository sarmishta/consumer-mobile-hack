import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";
import { Blush, Eye, Idle, INK, UmbrellaShape, dropPath, outline, sparklePath, useBlink } from "./shared";
import type { EyeKind } from "./shared";

export type DrizzleMood = "happy" | "sleepy" | "pumped" | "sheepish" | "party" | "wave";

const BLUE = "#A9C6DC";
const BLUE_LIGHT = "#C9DDEB";
const BLUE_DEEP = "#7E9FBA";
const BODY = "M74 15 C66 34 20 42 20 74 C20 96 38 110 60 110 C82 110 100 96 100 74 C100 54 80 42 74 15 Z";
const BELLY = "M68 43 C60 53 32 59 32 77 C32 92 44 102 60 102 C76 102 88 92 88 77 C88 63 74 55 68 43 Z";

const ARMS: Record<DrizzleMood, [string, string]> = {
  happy: ["M28 80 Q19 85 17 93", "M92 80 Q101 85 103 93"],
  sleepy: ["M28 84 Q21 90 21 97", "M92 84 Q99 90 99 97"],
  pumped: ["M29 70 Q14 60 11 43", "M91 70 Q106 60 109 43"],
  sheepish: ["M28 82 Q19 86 16 93", "M92 74 Q105 70 104 57"],
  party: ["M29 72 Q13 66 7 52", "M91 72 Q107 66 113 52"],
  wave: ["M28 80 Q19 85 17 93", "M91 70 Q108 62 111 44"],
};

const EYES: Record<DrizzleMood, EyeKind> = {
  happy: "dot",
  sleepy: "half",
  pumped: "big",
  sheepish: "dot",
  party: "joy",
  wave: "dot",
};

const CONFETTI: [number, number, number, string][] = [
  [8, 14, 20, "#E46B5A"],
  [100, 4, -30, "#F2B27E"],
  [116, 30, 40, "#E8744F"],
  [-2, 62, -15, "#7FAF8A"],
  [122, 84, 25, "#E46B5A"],
  [84, -6, 10, "#7FAF8A"],
];

function Arm({ d }: { d: string }) {
  return (
    <G>
      <Path d={d} fill="none" stroke={INK} strokeWidth={13.5} strokeLinecap="round" />
      <Path d={d} fill="none" stroke={BLUE} strokeWidth={5.5} strokeLinecap="round" />
    </G>
  );
}

function Mouth({ mood }: { mood: DrizzleMood }) {
  if (mood === "pumped" || mood === "party") {
    return (
      <G>
        <Path d="M50 78 Q60 80 70 78 Q69 92 60 92 Q51 92 50 78 Z" fill="#4A2231" {...outline} strokeWidth={3.2} />
        <Ellipse cx={60} cy={88.5} rx={4.6} ry={2.4} fill="#F0A08E" />
      </G>
    );
  }
  if (mood === "wave") {
    return <Path d="M54 79 Q60 80.5 66 79 Q65.5 88 60 88 Q54.5 88 54 79 Z" fill="#4A2231" {...outline} strokeWidth={3.2} />;
  }
  const d =
    mood === "sleepy" ? "M57 81 Q60 79 63 81 Q63.5 85 60 85 Q56.5 85 57 81 Z" : mood === "sheepish" ? "M51 82 Q55 78.5 59.5 81.5 Q64 84.5 69 79" : "M53 80 Q60 87.5 67 80";
  return <Path d={d} fill="none" {...outline} strokeWidth={3.4} />;
}

/**
 * Drizzle, the RAINCHECK raindrop.
 * The body fills roughly the middle 55% of the square; the margin is headroom for arms, the hat and the umbrella.
 */
export function Drizzle({
  size = 120,
  mood = "happy",
  animated = true,
  style,
}: {
  size?: number;
  mood?: DrizzleMood;
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const blink = useBlink(animated && (mood === "happy" || mood === "sheepish" || mood === "wave" || mood === "pumped"));
  const eye: EyeKind = blink ? "shut" : EYES[mood];
  const look = mood === "sheepish" ? -1.6 : 0;
  const energy = mood === "pumped" || mood === "party" ? 1.9 : mood === "sleepy" ? 0.5 : 1;
  const [leftArm, rightArm] = ARMS[mood];

  return (
    <Idle size={size} animated={animated} energy={energy} wobble={mood === "wave" || mood === "party" ? 5 : 0} style={style}>
      <Svg width={size} height={size} viewBox="-10 -16 140 140">
        {mood === "party"
          ? CONFETTI.map(([x, y, turn, color], i) =>
              i % 2 ? (
                <Circle key={i} cx={x} cy={y} r={3.4} fill={color} stroke={INK} strokeWidth={2.2} />
              ) : (
                <Rect key={i} x={x} y={y} width={9} height={5} rx={1.5} fill={color} stroke={INK} strokeWidth={2.2} transform={`rotate(${turn} ${x} ${y})`} />
              ),
            )
          : null}

        <Ellipse cx={47} cy={111.5} rx={8} ry={4.2} fill={INK} />
        <Ellipse cx={73} cy={111.5} rx={8} ry={4.2} fill={INK} />
        <G transform="translate(-3 1)">
          <Arm d={leftArm} />
        </G>
        <G transform="translate(3 1)">
          <Arm d={rightArm} />
        </G>

        <Path d={BODY} fill={BLUE_DEEP} {...outline} transform="translate(-6 3)" />
        <Path d={BODY} fill={BLUE} {...outline} />
        <Path d={BELLY} fill={BLUE_LIGHT} />
        <Path d="M32 63 Q35 52 47 45" fill="none" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" opacity={0.9} />
        <Circle cx={30} cy={71} r={2.3} fill="#FFFFFF" opacity={0.9} />

        <G transform="translate(0 2.5)">
          <Eye x={46} y={71} kind={eye} look={look} tilt={-12} />
          <Eye x={74} y={71} kind={eye} look={look} tilt={12} />
          <Blush x={36.5} y={81} />
          <Blush x={83.5} y={81} />
          <Mouth mood={mood} />
        </G>

        {mood === "sleepy" ? (
          <G fill="none" {...outline}>
            <Path d="M94 34 h9 l-9 10 h9" strokeWidth={3.2} />
            <Path d="M108 16 h6.5 l-6.5 7.5 h6.5" strokeWidth={2.6} />
          </G>
        ) : null}

        {mood === "pumped" ? (
          <G>
            <Path d="M20 26 l-6 -7 M10 34 l-9 -2 M100 26 l6 -7 M110 34 l9 -2" fill="none" {...outline} strokeWidth={3.4} />
            <Path d={sparklePath(8)} fill="#F7C48E" {...outline} strokeWidth={2.6} transform="translate(98 2)" />
            <Path d={sparklePath(5.5)} fill="#F7C48E" {...outline} strokeWidth={2.4} transform="translate(24 4)" />
          </G>
        ) : null}

        {mood === "sheepish" ? (
          <G>
            <Path d={dropPath(5)} fill="#E9F1F7" {...outline} strokeWidth={2.8} transform="translate(30 36) rotate(-18)" />
            <G transform="translate(104 27) rotate(13)">
              <UmbrellaShape />
            </G>
            <Circle cx={106.5} cy={56} r={6.2} fill={BLUE} {...outline} strokeWidth={3.6} />
          </G>
        ) : null}

        {mood === "party" ? (
          <G transform="translate(41 42) rotate(-36)">
            <Path d="M-13 0 L1 -27 L13 0 Z" fill="#E46B5A" {...outline} strokeWidth={3.8} />
            <Path d="M-7 -8 L7 -4 M-2 -18 L5 -15" fill="none" stroke="#F7C48E" strokeWidth={3} strokeLinecap="round" />
            <Circle cx={1} cy={-28} r={4.6} fill="#F7C48E" {...outline} strokeWidth={3} />
          </G>
        ) : null}

        {mood === "wave" ? (
          <Path d="M122 36 q4 5 3 11 M106 31 q-4 -5 -3 -11" fill="none" {...outline} strokeWidth={3} />
        ) : null}
      </Svg>
    </Idle>
  );
}
