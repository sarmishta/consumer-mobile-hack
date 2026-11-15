/**
 * RAINCHECK characters, hand-drawn in react-native-svg and animated with reanimated.
 *
 *   import { Drizzle, Luna, Flame, Umbrella, Sparkle, Raindrop } from "@/components/characters";
 *
 *   <Drizzle size={160} mood="pumped" />         happy | sleepy | pumped | sheepish | party | wave
 *   <Luna size={96} mood="wink" />               happy | wink
 *   <Drizzle size={40} animated={false} />       static, for lists and share cards
 *   <Flame size={28} face />  <Umbrella size={28} />  <Sparkle size={16} />  <Raindrop size={16} />
 *
 * Characters bob, blink and spring in on mount unless animated is false.
 */
export { Drizzle } from "./Drizzle";
export type { DrizzleMood } from "./Drizzle";
export { Luna } from "./Luna";
export type { LunaMood } from "./Luna";
export { Flame, Raindrop, Sparkle, Umbrella } from "./extras";
