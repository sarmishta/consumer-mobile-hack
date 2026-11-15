function utcDay(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function localYmd(ms: number) {
  const date = new Date(ms);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function dayNumber(currentDay: string, groupCreatedAt: number) {
  const diff = Math.round((utcDay(currentDay) - utcDay(localYmd(groupCreatedAt))) / 86400000);
  return Math.max(1, diff + 1);
}

export function prettyDay(ymd: string) {
  return new Date(utcDay(ymd)).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function clockTime(ms: number) {
  return new Date(ms).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
