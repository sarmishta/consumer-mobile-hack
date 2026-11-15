import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { Blush, Eye, Idle, outline, sparklePath, useBlink } from "./shared";

export type LunaMood = "happy" | "wink";

const YELLOW = "#FFCB47";
const YELLOW_LIGHT = "#FFE594";
const YELLOW_DEEP = "#E8A322";
const MOON = "M78 13 A49 49 0 1 0 105 82 A37.5 37.5 0 0 1 78 13 Z";

/** Luna, the good-night crescent moon. */
export function Luna({
  size = 120,
  mood = "happy",
  animated = true,
  style,
}: {
  size?: number;
  mood?: LunaMood;
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const blink = useBlink(animated);
  return (
    <Idle size={size} animated={animated} energy={0.7} wobble={3} style={style}>
      <Svg width={size} height={size} viewBox="-2 -2 124 124">
        <Path d={MOON} fill={YELLOW_DEEP} {...outline} transform="translate(-4.5 3)" />
        <Path d={MOON} fill={YELLOW} {...outline} />
        <Path d="M33 27 Q17 43 19 66" fill="none" stroke={YELLOW_LIGHT} strokeWidth={4.5} strokeLinecap="round" />
        <Circle cx={22} cy={76} r={2.4} fill={YELLOW_LIGHT} />
        <Circle cx={66} cy={93} r={4.2} fill={YELLOW_DEEP} opacity={0.55} />
        <Circle cx={53} cy={99} r={2.2} fill={YELLOW_DEEP} opacity={0.55} />
        <Circle cx={57} cy={24} r={3} fill={YELLOW_DEEP} opacity={0.55} />

        <Eye x={30} y={58} r={4.4} kind={blink ? "shut" : "dot"} />
        <Eye x={49} y={55} r={4.4} kind={mood === "wink" ? "joy" : blink ? "shut" : "dot"} />
        <Blush x={24} y={68} rx={5} ry={3} color="#FF8A4C" />
        <Blush x={54} y={64.5} rx={5} ry={3} color="#FF8A4C" />
        <Path
          d={mood === "wink" ? "M33 67 Q40 75 47 64" : "M34 67 Q40 73 46 65.5"}
          fill="none"
          {...outline}
          strokeWidth={3.2}
        />

        <Path d={sparklePath(9)} fill="#FFFFFF" {...outline} strokeWidth={2.8} transform="translate(88 44)" />
        <Path d={sparklePath(5)} fill="#FFFFFF" {...outline} strokeWidth={2.4} transform="translate(104 62)" />
      </Svg>
    </Idle>
  );
}
