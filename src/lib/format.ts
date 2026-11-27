export const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function formatPrice(price: number | null) {
  if (price == null) return "Ask staff";
  return `Rs ${price.toLocaleString("en-PK")}`;
}

export function to12h(t: string) {
  const [h, m] = t.split(":").map(Number);
  if (h === 0 && m === 0) return "Midnight";
  const suffix = h >= 12 ? "PM" : "AM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** Current time in Lahore regardless of server timezone. */
export function lahoreNow() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Karachi",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export function isOpenNow(hours: { dayOfWeek: number; opensAt: string; closesAt: string; closed: boolean }[]) {
  const { day, minutes } = lahoreNow();
  const check = (d: number, mins: number) => {
    const h = hours.find((x) => x.dayOfWeek === d);
    if (!h || h.closed) return false;
    const open = toMin(h.opensAt);
    let close = toMin(h.closesAt);
    if (close <= open) close += 24 * 60; // closes after midnight
    return mins >= open && mins < close;
  };
  // today, or still inside yesterday's past-midnight window
  return check(day, minutes) || check((day + 6) % 7, minutes + 24 * 60);
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export type PriceOption = { label: string; price: number };

/** Parses "Chicken 2030 | Beef 2475" into labelled prices. Parts without a trailing number are skipped. */
export function parseOptions(raw: string | null | undefined): PriceOption[] {
  if (!raw) return [];
  return raw
    .split("|")
    .map((part) => part.trim().match(/^(.*?)\s*(\d[\d,]*)$/))
    .filter((m): m is RegExpMatchArray => !!m && !!m[1])
    .map((m) => ({ label: m[1].trim(), price: Number(m[2].replace(/,/g, "")) }));
}
