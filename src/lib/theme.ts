import { Platform } from "react-native";
import type { TextStyle } from "react-native";

/** Warm peach design tokens. Every color in the app comes from here. */
export const colors = {
  /** Cream screen background. */
  bg: "#FFF6EE",
  /** Cards, rows, sheets. */
  surface: "#FFFFFF",
  /** Secondary warm surface. */
  surfaceAlt: "#FFFBF7",
  /** Pressed state for rows and plain surfaces. */
  surfacePressed: "#FBEADF",
  /** Tracks, placeholders and inactive chips. */
  fill: "#FBEADF",
  separator: "#F1DCCD",
  /** Warm dark brown ink. */
  label: "#3B2A22",
  secondaryLabel: "#8A6F62",
  tertiaryLabel: "#C4AB9D",
  /** Peach. Fills for buttons and selected chips. */
  accent: "#FFB38A",
  /** Terracotta. Emphasis, pressed edges, text and icons on light surfaces. */
  accentDeep: "#E8744F",
  accentInk: "#C25A36",
  /** Soft peach tint for cards, stickers and placeholders. */
  accentSoft: "#FFE3D3",
  /** Text on a peach fill. */
  onAccent: "#3B2A22",
  /** Kept for older call sites; now part of the peach family. */
  rain: "#E8744F",
  rainSoft: "#FFE3D3",
  /** Dusty coral for rainchecks. */
  coral: "#E46B5A",
  coralSoft: "#FBE1DA",
  /** Warm plum-brown for the dusk moment. */
  grape: "#6B4246",
  grapeSoft: "#F3E2DC",
  /** Muted sage for success. */
  mint: "#7FAF8A",
  mintSoft: "#E4EFE5",
  success: "#7FAF8A",
  danger: "#E46B5A",
  white: "#FFFFFF",
  /** White text on colored blocks. */
  onColor: "rgba(255,255,255,0.88)",
  onColorFaint: "rgba(255,255,255,0.3)",
  /** Modal scrim and photo-chip scrim. */
  scrim: "rgba(59,42,34,0.4)",
  /** Warm shadow. */
  shadow: "#7A4A33",
};

/** Gradient stops for expo-linear-gradient: all peach and apricot, plus one dusk for Luna. */
export const gradients = {
  story: ["#E8744F", "#E8744F"],
  sunrise: ["#F7A47C", "#E8744F"],
  coral: ["#EC8D78", "#DC6655"],
  rain: ["#F5A27C", "#EE8B67"],
  night: ["#4E3236", "#7A4B4C"],
  mint: ["#F2AE86", "#DE845E"],
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
