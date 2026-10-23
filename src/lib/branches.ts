import type { Branch } from "@/data";

/** Current day/minute in WIB (Asia/Jakarta), where both branches are. */
function nowInWIB() {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jakarta", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
};

export function branchStatus(b: Branch) {
  const { day, minutes } = nowInWIB();
  const open = b.hours.days.includes(day) && minutes >= toMin(b.hours.open) && minutes < toMin(b.hours.close);
  const closingSoon = open && toMin(b.hours.close) - minutes <= 45;
  return { open, closingSoon };
}

export function mapsUrl(b: Branch) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Cup of Hope Coffee ${b.address}`)}`;
}
