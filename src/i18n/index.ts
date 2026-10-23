import content from "@/data/content.json";
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

// Editable from the admin panel (src/data/content.json → settings).
export const WHATSAPP_URL = content.settings.whatsappUrl;
export const CONTACT_EMAIL = content.settings.email;
export const SITE_URL = "https://cupofhope.id";
export const GITHUB_REPO = "rfim/cupofhope";
