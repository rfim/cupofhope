import content from "./content.json";
import type { Locale } from "@/i18n";

type Localized = { title: string; body: string[]; includes?: string[] };

export type Event = {
  slug: string;
  past: boolean;
  image: string;
  location: string;
  date: string;
  time: string;
  price?: string;
  en: Localized;
  id: Localized;
};

export type Article = {
  slug: string;
  image: string;
  date: string;
  en: Localized;
  id: Localized;
};

export const events = content.events as Event[];
export const articles = content.articles as Article[];

export const upcomingEvents = events.filter((e) => !e.past);
export const pastEvents = events.filter((e) => e.past);

export const getEvent = (slug: string) => events.find((e) => e.slug === slug);
export const getArticle = (slug: string) => articles.find((a) => a.slug === slug);

export function relatedEvents(slug: string, count = 3) {
  return events.filter((e) => e.slug !== slug).slice(0, count);
}

export function relatedArticles(slug: string, count = 3) {
  return articles.filter((a) => a.slug !== slug).slice(0, count);
}

export function excerpt(text: string, length = 150) {
  return text.length > length ? `${text.slice(0, length).trimEnd()}...` : text;
}

export const t = <T extends { en: Localized; id: Localized }>(item: T, locale: Locale) => item[locale];
