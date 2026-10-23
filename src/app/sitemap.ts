import type { MetadataRoute } from "next";
import { articles, events } from "@/data";
import { locales, SITE_URL } from "@/i18n";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: [string, MetadataRoute.Sitemap[number]["changeFrequency"], number][] = [
    ["", "daily", 1],
    ["/about", "monthly", 0.9],
    ["/events", "weekly", 0.8],
    ["/article", "weekly", 0.8],
    ["/services", "monthly", 0.8],
    ["/our-team", "monthly", 0.8],
    ...events.map((e) => [`/events/${e.slug}`, "weekly", 0.7] as [string, "weekly", number]),
    ...articles.map((a) => [`/article/${a.slug}`, "weekly", 0.7] as [string, "weekly", number]),
  ];
  return locales.flatMap((l) =>
    pages.map(([path, changeFrequency, priority]) => ({ url: `${SITE_URL}/${l}${path}`, lastModified: now, changeFrequency, priority })),
  );
}
