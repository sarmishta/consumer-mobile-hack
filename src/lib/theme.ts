/** Light native-iOS design tokens. Import from "@/lib/theme" or a relative path. */
export const colors = {
  /** systemGroupedBackground: screen background behind inset-grouped sections. */
  bg: "#F2F2F7",
  /** secondarySystemGroupedBackground: cards, rows, sheets. */
  surface: "#FFFFFF",
  /** Pressed state for rows and plain surfaces. */
  surfacePressed: "#E5E5EA",
  /** Neutral fill for placeholders, tracks, and inactive chips. */
  fill: "#EEEEF0",
  separator: "#C6C6C8",
  label: "#000000",
  secondaryLabel: "#6C6C70",
  tertiaryLabel: "#AEAEB2",
  /** Warm amber accent. Use accentInk for text and icons on white; accent for fills. */
  accent: "#FFB547",
  accentInk: "#C77700",
  accentSoft: "#FFF4E0",
  /** Text color on an accent fill. */
  onAccent: "#2A1A00",
  /** Rain blue secondary. */
  rain: "#3D7BF7",
  rainSoft: "#E7EFFF",
  /** Coral for rainchecks. */
  coral: "#FF6B5B",
  coralSoft: "#FFEAE7",
  success: "#34C759",
  danger: "#FF3B30",
  white: "#FFFFFF",
};

/** SF-like type scale (iOS default Dynamic Type sizes). */
export const type = {
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: "700" },
  title1: { fontSize: 28, lineHeight: 34, fontWeight: "700" },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: "700" },
  title3: { fontSize: 20, lineHeight: 25, fontWeight: "600" },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: "600" },
  body: { fontSize: 17, lineHeight: 22, fontWeight: "400" },
  callout: { fontSize: 16, lineHeight: 21, fontWeight: "400" },
  subhead: { fontSize: 15, lineHeight: 20, fontWeight: "400" },
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: "400" },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: "400" },
} as const;

export type TypeVariant = keyof typeof type;

export const spacing = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 48 };

export const radius = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 };

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
