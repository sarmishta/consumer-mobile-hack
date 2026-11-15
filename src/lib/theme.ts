export const colors = {
  bg: "#0F1530",
  card: "#1A2142",
  cardRaised: "#232B52",
  amber: "#FFB547",
  rain: "#7FA7FF",
  text: "#FFFFFF",
  muted: "#A9B1D6",
  faint: "#5C6590",
  done: "#7BE0A6",
  ink: "#1B1300",
};

export const radius = 20;

export const AVATARS = ["🦊", "🐻", "🐼", "🐸", "🦉", "🐙", "🌻", "🌙", "🔥", "🍓", "🎧", "🌈"];
export const GOAL_EMOJIS = ["💪", "📞", "📚", "🏃", "🧘", "💧", "🥗", "✍️", "🎸", "🧹", "😴", "🌱"];

export function localToday() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}
