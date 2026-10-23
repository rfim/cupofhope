import dictionaries from "./dictionaries.json";

export const locales = ["en", "id"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export type Dictionary = (typeof dictionaries)["en"];

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export const WHATSAPP_URL = "https://wa.link/xxbdoa";
export const CONTACT_EMAIL = "service@qtnil.com";
export const SITE_URL = "https://cupofhope.id";
