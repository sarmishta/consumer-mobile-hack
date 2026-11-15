import Svg, { Circle, G, Path } from "react-native-svg";
import { Blush, Eye, UmbrellaShape, dropPath, outline, sparklePath } from "./shared";

type IconProps = { size?: number; color?: string };

/** Raincheck umbrella in the character line style. */
export function Umbrella({ size = 32, color = "#FF6B5B" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60">
      <G transform="translate(29 29) rotate(-10)">
        <UmbrellaShape color={color} />
      </G>
    </Svg>
  );
}

/** Streak flame. Pass face for the tiny-face version. */
export function Flame({ size = 32, face = false }: { size?: number; face?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Path
        d="M62 8 C66 31 97 45 97 75 C97 97 81 111 60 111 C39 111 23 97 23 76 C23 60 32 51 39 37 C42 47 48 51 52 47 C56 37 55 22 62 8 Z"
        fill="#FF8A3D"
        {...outline}
        strokeWidth={5.5}
      />
      <Path d="M61 56 C64 69 80 76 80 90 C80 100 71 106 60 106 C49 106 40 100 40 90 C40 78 55 71 61 56 Z" fill="#FFD45C" />
      <Path d="M33 76 Q33 66 39 58" fill="none" stroke="#FFC08A" strokeWidth={4.5} strokeLinecap="round" />
      {face ? (
        <G>
          <Eye x={51} y={87} r={4} />
          <Eye x={69} y={87} r={4} />
          <Blush x={44} y={94} rx={4} ry={2.4} color="#FF7A3D" />
          <Blush x={76} y={94} rx={4} ry={2.4} color="#FF7A3D" />
          <Path d="M56 94 Q60 98 64 94" fill="none" {...outline} strokeWidth={3} />
        </G>
      ) : null}
    </Svg>
  );
}

/** Four-point sparkle decoration. */
export function Sparkle({ size = 20, color = "#FFD45C" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="-12 -12 24 24">
      <Path d={sparklePath(9.5)} fill={color} {...outline} strokeWidth={2.2} />
    </Svg>
  );
}

/** Small faceless raindrop decoration. */
export function Raindrop({ size = 20, color = "#63B0FF" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="-12 -12.5 24 24">
      <Path d={dropPath(7)} fill={color} {...outline} strokeWidth={2.2} />
      <Path d="M-4 3 Q-4 -0.5 -1.5 -3" fill="none" stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" opacity={0.9} />
      <Circle cx={-3.6} cy={5.6} r={0.9} fill="#FFFFFF" opacity={0.9} />
    </Svg>
  );
}
