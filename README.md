# Cup of Hope

Website for Cup of Hope, a community café and event space in Surabaya. Built with Next.js (App Router), React 19 and Tailwind CSS v4, in English (`/en`) and Indonesian (`/id`).

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Structure

```
src/
  app/[locale]/          pages: home, about, events, events/[slug], article, article/[slug], services, our-team
  app/fonts/             Lufga font files (loaded with next/font/local)
  components/            Navbar, Footer, EventCard, ArticleCard, EventsTabs, Testimonials, ConnectCta, ...
  data/content.json      events and articles (EN + ID)
  i18n/dictionaries.json UI and page copy (EN + ID)
  middleware.ts          redirects / to /en or /id based on Accept-Language
public/images/           logos, illustrations and photos
```

## Editing content

- **Events and articles**: edit `src/data/content.json`. Each entry has shared fields (`slug`, `date`, `image`, ...) plus `en` and `id` objects holding `title`, `body` paragraphs and optional `includes`. Events with `"past": true` appear under the "Past Event" tab.
- **Page copy, navigation and SEO metadata**: edit `src/i18n/dictionaries.json`.
- **Contact links** (WhatsApp, email) and the site URL: `src/i18n/index.ts`.

Every event and article page is pre-rendered at build time, and `sitemap.xml` and `robots.txt` are generated automatically.

## Notes

- Lufga is a commercial typeface. Check that the font license covers this deployment.
- The Services and Our Team pages show the "under development" placeholder, as on the live site.
