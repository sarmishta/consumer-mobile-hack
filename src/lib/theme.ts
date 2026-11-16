import { Platform } from "react-native";
import type { TextStyle } from "react-native";

/** Vivid light social-camera design tokens. Import from "@/lib/theme" or a relative path. */
export const colors = {
  /** Warm cream screen background. */
  bg: "#FFF6EA",
  /** Cards, rows, sheets. */
  surface: "#FFFFFF",
  /** Pressed state for rows and plain surfaces. */
  surfacePressed: "#F6ECDD",
  /** Neutral fill for placeholders, tracks, and inactive chips. */
  fill: "#F4EADB",
  separator: "#EADFCF",
  label: "#17131F",
  secondaryLabel: "#6E6577",
  tertiaryLabel: "#B3AABB",
  /** Sunny amber accent. Use accentInk for text and icons on white; accent for fills. */
  accent: "#FFC233",
  accentInk: "#B86E00",
  accentSoft: "#FFF0C7",
  /** Text color on an accent fill. */
  onAccent: "#1F1400",
  /** Rain blue secondary. */
  rain: "#2F6BFF",
  rainSoft: "#E2ECFF",
  /** Coral for rainchecks. */
  coral: "#FF5A4E",
  coralSoft: "#FFE4E0",
  grape: "#7B5CFF",
  grapeSoft: "#EEE8FF",
  mint: "#1FC98E",
  mintSoft: "#DDF8EC",
  success: "#1DBF73",
  danger: "#FF3B30",
  white: "#FFFFFF",
};

/** Gradient stops for expo-linear-gradient. story is the ring for whoever checked in today. */
export const gradients = {
  story: ["#FFB547", "#FF6B5B", "#3D7BF7"],
  sunrise: ["#FFD45C", "#FF9A3D"],
  coral: ["#FF8A5B", "#FF4F6D"],
  rain: ["#4D8BFF", "#7B5CFF"],
  night: ["#2B2D6E", "#6A43E0"],
  mint: ["#2EDC9B", "#1FA9C9"],
} as const satisfies Record<string, readonly [string, string, ...string[]]>;

/** Font faces. Avenir Next ships with iOS; Lilita One loads through @expo-google-fonts in the root layout. */
const WEB_SANS = '"Avenir Next", Avenir, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const fonts =
  Platform.OS === "web"
    ? { display: "LilitaOne_400Regular", heavy: WEB_SANS, bold: WEB_SANS, demi: WEB_SANS, medium: WEB_SANS }
    : {
        display: "LilitaOne_400Regular",
        heavy: "AvenirNext-Heavy",
        bold: "AvenirNext-Bold",
        demi: "AvenirNext-DemiBold",
        medium: "AvenirNext-Medium",
      };

/** Avenir Next face for a numeric weight. */
export function fontForWeight(weight: string | number | undefined) {
  const w = Number(weight);
  if (w >= 800) return fonts.heavy;
  if (w >= 700 || weight === "bold") return fonts.bold;
  if (w >= 600) return fonts.demi;
  return fonts.medium;
}

/** Chunky social type scale: Lilita One for display and stickers, Avenir Next for UI. */
const webWeight = (fontWeight: TextStyle["fontWeight"]): TextStyle => (Platform.OS === "web" ? { fontWeight } : {});

export const type = {
  display: { fontSize: 52, lineHeight: 58, fontFamily: fonts.display },
  largeTitle: { fontSize: 38, lineHeight: 44, fontFamily: fonts.display },
  title1: { fontSize: 30, lineHeight: 36, fontFamily: fonts.heavy, ...webWeight("800") },
  title2: { fontSize: 23, lineHeight: 29, fontFamily: fonts.heavy, ...webWeight("800") },
  title3: { fontSize: 20, lineHeight: 26, fontFamily: fonts.bold, ...webWeight("700") },
  headline: { fontSize: 17, lineHeight: 22, fontFamily: fonts.demi, ...webWeight("600") },
  body: { fontSize: 17, lineHeight: 23, fontFamily: fonts.medium, ...webWeight("500") },
  callout: { fontSize: 16, lineHeight: 21, fontFamily: fonts.medium, ...webWeight("500") },
  subhead: { fontSize: 15, lineHeight: 20, fontFamily: fonts.medium, ...webWeight("500") },
  footnote: { fontSize: 13, lineHeight: 18, fontFamily: fonts.demi, ...webWeight("600") },
  caption: { fontSize: 12, lineHeight: 16, fontFamily: fonts.demi, ...webWeight("600") },
  sticker: { fontSize: 19, lineHeight: 23, fontFamily: fonts.display },
} as const;

export type TypeVariant = keyof typeof type;

export const spacing = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 48 };

export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 };

export const AVATARS = ["🦊", "🐻", "🐼", "🐸", "🦉", "🐙", "🌻", "🌙", "🔥", "🍓", "🎧", "🌈"];
export const GOAL_EMOJIS = ["💪", "📞", "📚", "🏃", "🧘", "💧", "🥗", "✍️", "🎸", "🧹", "😴", "🌱"];

/** Goal types stored on members.goalType. */
export const GOAL_TYPES = ["move", "read", "eat better", "sleep", "save money", "call family", "custom"] as const;

/** Today's date as YYYY-MM-DD in the device's local timezone. */
export function localToday() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}
