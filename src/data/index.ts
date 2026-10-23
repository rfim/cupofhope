import content from "./content.json";
import type { Locale } from "@/i18n";

export type LocalizedEntry = { title: string; body: string[]; includes?: string[] };

export type Event = {
  slug: string;
  past: boolean;
  image: string;
  location: string;
  /** ISO date, e.g. "2025-05-18" */
  date: string;
  /** e.g. "20.00 - 21.00 WIB" */
  time: string;
  price?: string;
  en: LocalizedEntry;
  id: LocalizedEntry;
};

export type Article = {
  slug: string;
  image: string;
  /** ISO date, e.g. "2025-05-18" */
  date: string;
  en: LocalizedEntry;
  id: LocalizedEntry;
};

export type Testimonial = {
  name: string;
  image: string;
  en: { quote: string; story: string; origin: string };
  id: { quote: string; story: string; origin: string };
};

export type Stat = { value: string; en: string; id: string };

export type Branch = {
  name: string;
  address: string;
  instagram?: string;
  /** days: 0 = Sunday … 6 = Saturday; times in WIB (UTC+7) */
  hours: { days: number[]; open: string; close: string };
};

export type Settings = {
  whatsappUrl: string;
  /** Optional, digits only (e.g. 62812…). Enables "send order via WhatsApp". */
  whatsappNumber?: string;
  email: string;
  /** sha256("cupofhope:" + PIN), checked by the admin panel */
  pinHash: string;
  stats: Stat[];
  branches: Branch[];
  /** Card number given on a visitor's first visit */
  welcomeCard: number;
};

export type Rarity = "common" | "rare" | "epic" | "legendary";
export const RARITIES: Rarity[] = ["common", "rare", "epic", "legendary"];
export type Palette = "cream" | "lilac" | "sky" | "mint" | "lime" | "sun" | "pink" | "coral" | "clay";
export type Motif = "sun" | "heart" | "leaf" | "cup" | "star" | "wave" | "mountain" | "home" | "door" | "drop" | "spark" | "flower";

export type HopeCard = {
  number: number;
  rarity: Rarity;
  series: string;
  palette: Palette;
  motif: Motif;
  /** "script" renders the message in handwriting, like some printed cards */
  style: "classic" | "script";
  /** sha256("cupofhope-card:" + CODE) of the code printed on the physical card */
  codeHash?: string;
  /** Messages may wrap a phrase in *asterisks* to highlight it */
  en: { title: string; message: string };
  id: { title: string; message: string };
};

export type MenuTag = "rec" | "spicy" | "oat" | "new";

export type MenuItem = {
  id: string;
  name: string;
  /** In thousands of rupiah: 27 → Rp27.000 */
  price: number;
  tags?: MenuTag[];
  desc?: { en: string; id: string };
  image?: string;
  variants?: string[];
  soldOut?: boolean;
};

export type MenuGroup = { en: string; id_name: string; note?: { en: string; id: string }; items: MenuItem[] };
export type MenuCategory = { id: string; en: string; id_name: string; emoji: string; addons?: string; groups: MenuGroup[] };

export type Menu = {
  categories: MenuCategory[];
  promo: { en: { title: string; body: string }; id: { title: string; body: string }; price: number; items: string[]; images: string[] };
};

export type Content = {
  settings: Settings;
  events: Event[];
  articles: Article[];
  testimonials: Testimonial[];
  cards: HopeCard[];
  menu: Menu;
};

export const site = content as Content;
export const { settings, events, articles, testimonials, cards, menu } = site;

export const menuItems = menu.categories.flatMap((c) => c.groups.flatMap((g) => g.items.map((item) => ({ ...item, category: c.id }))));

export const formatPrice = (thousands: number) => `${thousands}k`;

export const upcomingEvents = events.filter((e) => !e.past);
export const pastEvents = events.filter((e) => e.past);

export const getEvent = (slug: string) => events.find((e) => e.slug === slug);
export const getArticle = (slug: string) => articles.find((a) => a.slug === slug);

export function relatedEvents(slug: string, count = 3) {
  const others = events.filter((e) => e.slug !== slug);
  // Prefer events that are still open for registration.
  return [...others.filter((e) => !e.past), ...others.filter((e) => e.past)].slice(0, count);
}

export function relatedArticles(slug: string, count = 3) {
  return articles.filter((a) => a.slug !== slug).slice(0, count);
}

export function excerpt(text: string, length = 150) {
  return text.length > length ? `${text.slice(0, length).trimEnd()}...` : text;
}

export function formatDate(iso: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

export function readingMinutes(paragraphs: string[]) {
  const words = paragraphs.join(" ").split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

/** Parses "20.00 - 21.00 WIB" into UTC start/end for calendar links (WIB = UTC+7). */
export function eventTimes(event: Pick<Event, "date" | "time">) {
  const m = event.time.match(/(\d{1,2})[.:](\d{2})\s*-\s*(\d{1,2})[.:](\d{2})/);
  if (!m) return null;
  const at = (h: string, min: string) => new Date(`${event.date}T${h.padStart(2, "0")}:${min}:00+07:00`);
  return { start: at(m[1], m[2]), end: at(m[3], m[4]) };
}

export function googleCalendarUrl(event: Event, locale: Locale) {
  const times = eventTimes(event);
  if (!times) return null;
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event[locale].title,
    dates: `${fmt(times.start)}/${fmt(times.end)}`,
    details: event[locale].body[0] ?? "",
    location: event.location,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
