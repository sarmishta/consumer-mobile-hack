import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";
import { Blush, Eye, Idle, INK, UmbrellaShape, dropPath, outline, sparklePath, useBlink } from "./shared";
import type { EyeKind } from "./shared";

export type DrizzleMood = "happy" | "sleepy" | "pumped" | "sheepish" | "party" | "wave";

const BLUE = "#63B0FF";
const BLUE_LIGHT = "#8ECBFF";
const BLUE_DEEP = "#3A82E6";
const BODY = "M68 8 C61 28 23 43 23 72 C23 94 39 109 60 109 C81 109 97 94 97 72 C97 48 73 36 68 8 Z";
const BELLY = "M64 37 C57 49 34 57 34 75 C34 90 45 100 60 100 C75 100 87 90 87 75 C87 60 72 51 64 37 Z";

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
  [8, 14, 20, "#FF6B5B"],
  [100, 4, -30, "#FFC233"],
  [116, 30, 40, "#7B5CFF"],
  [-2, 62, -15, "#1FC98E"],
  [122, 84, 25, "#FF6B5B"],
  [84, -6, 10, "#1FC98E"],
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
        <Ellipse cx={60} cy={88.5} rx={4.6} ry={2.4} fill="#FF8C9A" />
      </G>
    );
  }
  if (mood === "wave") {
    return <Path d="M54 79 Q60 80.5 66 79 Q65.5 88 60 88 Q54.5 88 54 79 Z" fill="#4A2231" {...outline} strokeWidth={3.2} />;
  }
  const d =
    mood === "sleepy" ? "M56 82 Q60 84.5 64 82" : mood === "sheepish" ? "M51 82 Q55 78.5 59.5 81.5 Q64 84.5 69 79" : "M53 80 Q60 87.5 67 80";
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

        <Ellipse cx={48} cy={110} rx={7.5} ry={4.2} fill={INK} />
        <Ellipse cx={72} cy={110} rx={7.5} ry={4.2} fill={INK} />
        <Arm d={leftArm} />
        <Arm d={rightArm} />

        <Path d={BODY} fill={BLUE_DEEP} {...outline} transform="translate(-5 2.5)" />
        <Path d={BODY} fill={BLUE} {...outline} />
        <Path d={BELLY} fill={BLUE_LIGHT} />
        <Path d="M36 60 Q40 48 51 40" fill="none" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" opacity={0.9} />
        <Circle cx={33.5} cy={68.5} r={2.3} fill="#FFFFFF" opacity={0.9} />

        <Eye x={47} y={71} kind={eye} look={look} />
        <Eye x={73} y={71} kind={eye} look={look} />
        <Blush x={38.5} y={81} />
        <Blush x={81.5} y={81} />
        <Mouth mood={mood} />

        {mood === "sleepy" ? (
          <G fill="none" {...outline}>
            <Path d="M94 34 h9 l-9 10 h9" strokeWidth={3.2} />
            <Path d="M108 16 h6.5 l-6.5 7.5 h6.5" strokeWidth={2.6} />
          </G>
        ) : null}

        {mood === "pumped" ? (
          <G>
            <Path d="M20 26 l-6 -7 M10 34 l-9 -2 M100 26 l6 -7 M110 34 l9 -2" fill="none" {...outline} strokeWidth={3.4} />
            <Path d={sparklePath(8)} fill="#FFD45C" {...outline} strokeWidth={2.6} transform="translate(98 2)" />
            <Path d={sparklePath(5.5)} fill="#FFD45C" {...outline} strokeWidth={2.4} transform="translate(24 4)" />
          </G>
        ) : null}

        {mood === "sheepish" ? (
          <G>
            <Path d={dropPath(5)} fill="#DDF1FF" {...outline} strokeWidth={2.8} transform="translate(30 36) rotate(-18)" />
            <G transform="translate(101 26) rotate(13)">
              <UmbrellaShape />
            </G>
            <Circle cx={103.5} cy={55} r={6.2} fill={BLUE} {...outline} strokeWidth={3.6} />
          </G>
        ) : null}

        {mood === "party" ? (
          <G transform="translate(43 38) rotate(-36)">
            <Path d="M-13 0 L1 -27 L13 0 Z" fill="#FF6B5B" {...outline} strokeWidth={3.8} />
            <Path d="M-7 -8 L7 -4 M-2 -18 L5 -15" fill="none" stroke="#FFD45C" strokeWidth={3} strokeLinecap="round" />
            <Circle cx={1} cy={-28} r={4.6} fill="#FFD45C" {...outline} strokeWidth={3} />
          </G>
        ) : null}

        {mood === "wave" ? (
          <Path d="M118 34 q4 5 3 11 M103 30 q-4 -5 -3 -11" fill="none" {...outline} strokeWidth={3} />
        ) : null}
      </Svg>
    </Idle>
  );
}
