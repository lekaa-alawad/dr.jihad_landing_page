# Jihad Dental Care — live

The chosen direction (Option 4, "Noir"), extracted from the review harness into
a standalone site. This is the folder to work in from here.

## Run

```bash
npm install     # once
npm run dev     # http://localhost:5190  and  /ar/
npm run build   # -> dist/  (vite build, then the prerender pass)
```

## Locales

Two real pages, not a client-side language toggle:

| URL | File | `<html>` |
|---|---|---|
| `/` | `index.html` | `lang="en" dir="ltr"` |
| `/ar/` | `ar/index.html` | `lang="ar" dir="rtl"` |

All copy for both lives in `src/i18n.js`; the Arabic is carried over from the
bilingual Astro build in `../dr.jihad` rather than freshly translated, so the
two say the same thing in the same voice. `src/seo.js` derives every `<head>`
tag, the JSON-LD, `sitemap.xml` and `robots.txt` from that one file, so the
locales cannot drift.

`SITE` in `src/i18n.js` is `https://drjihad.care` — canonical, hreflang,
`og:url` and the sitemap are all built from it. `SITE_URL=https://… npm run
build` overrides it for a one-off build.

## Hosting

Cloudflare Pages, building from `main`. Build command `npm run build`, output
directory `dist`. `public/_headers` carries the cache policy. Nothing here is
Vercel-specific any more.

## Where it came from

Noir was variant 4 inside `../dr.jidad preview`, where it shared modules with
the three other directions. Extracting it meant copying those shared modules in
and repointing the imports — nothing was rewritten, so what you see here is what
was reviewed.

| Here | Came from |
|---|---|
| `src/Noir.jsx` | `src/variants/Noir.jsx` |
| `src/noir.css` | `src/variants/noir.css` |
| `src/base.css` | shared — seam, kinetic text, reveal |
| `src/i18n.js` | shared — the single source of product truth (was `data.js`) |
| `src/components/Seam.jsx` | shared before/after control |
| `src/components/Kinetic.jsx` | shared SplitLines, SplitWords, Reveal |

`public/` carries only the files Noir actually references — 7 images and 5
fonts (2 Latin, 3 Arabic). The harness shipped 8 fonts and 10 images because
the other three directions needed them.

The harness and the old Astro build are untouched in `../dr.jidad preview` and
`../dr.jihad`, still deployed, if anything needs checking against them.

## Rules this build keeps

- **Nothing is invented.** No fabricated doctors, testimonials, or figures.
  Unconfirmed values are marked `confirmed: false` in `src/i18n.js` and are
  withheld from the JSON-LD, so no placeholder address or phone number is ever
  published as structured data. (They are still *displayed* — see Known gaps.)
- **The seam is shared.** One source image per case, cropped exactly in half by
  a 3:2 frame. A full before/after costs one download.
- **Reveals degrade to visible.** Every animation resolves to opacity 1, and the
  failsafe sweep in `main.jsx` catches anything a failed reveal left hidden.
  `.reveal` is only hidden under `html.js`, so no-JS never gets a blank page.
- `prefers-reduced-motion` is honoured.

## Known gaps

- **The `.pages.dev` origin must redirect.** Cloudflare serves every Pages
  project on `<project>.pages.dev` as well as the custom domain. Left alone
  that is a second crawlable copy of the whole site competing with
  `drjihad.care`. Redirect it before submitting to Search Console.
- **No `To confirm` chip in this direction.** The placeholder address, phone,
  WhatsApp, hours, case labels and record figures are all still displayed as
  though they were fact. They are correctly excluded from structured data, but
  a reviewer looking at the page cannot tell which values are real.
- **Contact details are not actionable.** Phone and WhatsApp are plain text,
  not `tel:` / `wa.me` links, because linking a placeholder number would dial a
  stranger. Wire them up in the same pass that supplies the real numbers.
- **Social preview image is portrait.** `og:image` reuses the 1080×1440 hero,
  so link unfurls centre-crop it. A dedicated 1200×630 export would be better.
- **Headline text appears twice in the HTML.** `SplitLines` / `SplitWords` keep
  a visually-hidden copy of each string for screen readers alongside the
  animated per-word spans. Harmless for ranking, but the `<h1>` reads doubled
  to anything parsing text content.
- **Hero at phone width:** the second button collides with the treatments band
  below it — see the note in the handover. Unverified below ~614px, which is as
  narrow as the test browser would go.
