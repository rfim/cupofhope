# Cup of Hope

Website for Cup of Hope, a community café and event space in Surabaya. Built with Next.js (App Router), React 19 and Tailwind CSS v4, in English (`/en`) and Indonesian (`/id`).

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static site in out/
```

## Structure

```
src/
  app/[locale]/          pages: home, about, events, events/[slug], article, article/[slug], services, our-team
  app/fonts/             Lufga font files (loaded with next/font/local)
  components/            Navbar, Footer, EventCard, ArticleCard, EventsTabs, Testimonials, ConnectCta, ...
  data/content.json      events and articles (EN + ID)
  i18n/dictionaries.json UI and page copy (EN + ID)
  app/page.tsx           redirects / to /en or /id based on the browser language
public/images/           logos, illustrations and photos
```

## Admin panel (easter egg)

Type **`open sesame`** anywhere on the site (or tap the footer logo 5 times on a phone) to open `/admin/`, then enter the PIN. The default PIN is **111111**; change it under Pengaturan → Ganti PIN.

From the panel you can add, edit, reorder, duplicate and delete events, articles and testimonials in both languages, upload images (resized to WebP in the browser), and edit the WhatsApp link, email and impact stats. **Publikasikan** commits all changes to `main` as one commit, and GitHub Pages redeploys in about 1–2 minutes.

Saving needs a GitHub fine-grained personal access token, entered once per browser under Pengaturan:
- Repository access: only `rfim/cupofhope`
- Permissions: **Contents: Read and write**, **Actions: Read-only**

The token is stored only in that browser's localStorage. The PIN is an easter-egg lock, not real security: the site is static, so its hash ships with the page. What protects content is the token, since nobody can publish without one. Five wrong PINs lock the pad for 60 seconds.

## Editing content by hand

- **Events and articles**: edit `src/data/content.json`. Each entry has shared fields (`slug`, `date`, `image`, ...) plus `en` and `id` objects holding `title`, `body` paragraphs and optional `includes`. Events with `"past": true` appear under the "Past Event" tab.
- **Page copy, navigation and SEO metadata**: edit `src/i18n/dictionaries.json`.
- **Contact links** (WhatsApp, email) and the site URL: `src/i18n/index.ts`.

Every event and article page is pre-rendered at build time, and `sitemap.xml` and `robots.txt` are generated automatically.

## Deployment (GitHub Pages)

The site is built as a static export (`output: "export"`). Every push to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes `out/` to GitHub Pages.

- One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
- The base path (`/cupofhope`) comes from the Pages configuration. If you add a custom domain, it becomes empty automatically.
- To test a Pages build locally, run `NEXT_PUBLIC_BASE_PATH=/cupofhope npm run build`. Use `asset()` from `src/lib/asset.ts` for any `public/` path that isn't rendered through `next/image` or `next/link`.

## Notes

- Lufga is a commercial typeface. Check that the font license covers this deployment.
- The Services and Our Team pages show the "under development" placeholder, as on the live site.
