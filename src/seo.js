// Every per-locale <head> tag, the JSON-LD, the sitemap and robots.txt, all
// derived from src/i18n.js so the two locales can never drift apart.
//
// This runs at build time only (from vite.config.js and scripts/prerender.mjs).
// Nothing here is shipped to the browser.

import { HERO, SITE, dialable, locales, pathFor, strings } from './i18n.js';

/** Trailing slashes stripped so `origin() + pathFor()` never doubles up. */
export const origin = () => (process.env.SITE_URL || SITE).replace(/\/+$/, '');
export const urlFor = (lang) => origin() + pathFor(lang);

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Latin faces first, then the Arabic ones. Each @font-face in noir.css carries a
// unicode-range, so a visitor only ever downloads the script they are reading —
// but `preload` ignores unicode-range and fetches unconditionally, which is why
// the two preloads have to be chosen per locale rather than listed together.
const FONTS = {
  en: ['/fonts/bricolage.woff2', '/fonts/geist.woff2'],
  ar: ['/fonts/arslanwessam-arabic.woff2', '/fonts/almarai-arabic.woff2'],
};

/**
 * schema.org `Dentist` — a LocalBusiness subtype.
 *
 * Any `reach` row still carrying `confirmed: false` is withheld from here: a
 * wrong NAP propagated into the local index is far more expensive to correct
 * than a missing one. The address and phone numbers are now confirmed, so both
 * are published; `openingHours` is not, for the reason given below.
 */
export function jsonLd(lang) {
  const t = strings[lang];
  const confirmed = t.reach.items.filter((i) => i.confirmed);
  const find = (k) => confirmed.find((i) => i.key === k)?.values;

  const node = {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    '@id': `${origin()}/#clinic`,
    name: t.clinic,
    description: t.meta.description,
    url: urlFor(lang),
    inLanguage: lang,
    logo: `${origin()}/img/mark.png`,
    // `image` takes a list, and a local listing carrying more than one
    // photograph of the practice is something Google's own structured-data
    // guidance asks for by name. The hero leads, because it is also what an
    // unfurler shows; behind it go the four visitor photographs that have the
    // clinic itself in the frame. The rest of the deck is nineteen portraits of
    // near-identical framing, which is not what a knowledge panel is for.
    image: [
      `${origin()}${HERO.src}`,
      ...t.visitors.shots.slice(0, 4).map((shot) => origin() + shot.src),
    ],
    slogan: t.tagline,
    founder: { '@type': 'Person', name: t.doctor, jobTitle: lang === 'ar' ? 'طبيب أسنان' : 'Dentist' },
    // A service's sub-capabilities (the imaging modalities) are folded into the
    // description rather than dropped: the note alone ends on a colon, which
    // would publish a sentence that goes nowhere.
    availableService: t.treatments.items.map((s) => ({
      '@type': 'MedicalProcedure',
      name: s.name,
      description: s.list ? `${s.note} ${s.list.join(lang === 'ar' ? '، ' : ', ')}.` : s.note,
    })),
  };

  // The clinic's own street line, plus the locality and country spelled out
  // as their own fields — Google matches a local listing on those, and will
  // not parse them back out of a single streetAddress string.
  if (find('address')) {
    node.address = {
      '@type': 'PostalAddress',
      streetAddress: lang === 'ar' ? 'أوتوستراد المزة، بناء النقل' : 'Mazzeh Autostrad, Al-Naql Building',
      addressLocality: lang === 'ar' ? 'دمشق' : 'Damascus',
      addressCountry: 'SY',
    };
  }

  // Every number the clinic answers, landlines and mobile alike.
  const numbers = [...(find('phone') ?? []), ...(find('whatsapp') ?? [])].map(dialable);
  if (numbers.length) node.telephone = numbers;

  // `sameAs` is how a profile elsewhere is claimed as the same entity as this
  // one. Without it the Instagram account and this clinic are two unrelated
  // things to a search engine; with it they consolidate, and the profile can
  // surface in the knowledge panel.
  const social = confirmed.filter((i) => i.href).map((i) => i.href);
  if (social.length) node.sameAs = social;

  // No `openingHours`. The clinic confirmed the times but not which days it
  // keeps them, and the property's grammar has no way to say "these hours, days
  // unknown" — the value must name a day range. Guessing one would publish an
  // opening day the clinic never gave us, and Google surfaces that guess in the
  // knowledge panel as fact. The hours still render on the page; only the
  // machine-readable claim is withheld. Add `Mo-Su 10:00-20:00` (or whatever
  // the real range is) here once the days are confirmed.

  // `<` escaped so the payload can never terminate the script element early.
  return JSON.stringify(node).replace(/</g, '\\u003c');
}

/** The whole <head> payload for one locale, as an HTML string. */
export function headTags(lang) {
  const t = strings[lang];
  const { title, description, ogLocale } = t.meta;
  const alternates = locales
    .map((l) => `<link rel="alternate" hreflang="${l}" href="${urlFor(l)}" />`)
    .join('\n    ');

  return `<title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${urlFor(lang)}" />

    ${alternates}
    <link rel="alternate" hreflang="x-default" href="${urlFor('en')}" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${esc(t.clinic)}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${urlFor(lang)}" />
    <meta property="og:locale" content="${ogLocale}" />
    ${locales
      .filter((l) => l !== lang)
      .map((l) => `<meta property="og:locale:alternate" content="${strings[l].meta.ogLocale}" />`)
      .join('\n    ')}
    <meta property="og:image" content="${origin()}${HERO.src}" />
    <meta property="og:image:width" content="${HERO.w}" />
    <meta property="og:image:height" content="${HERO.h}" />
    <meta property="og:image:alt" content="${esc(t.hero.alt)}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${origin()}${HERO.src}" />

    ${FONTS[lang]
      .map((f) => `<link rel="preload" href="${f}" as="font" type="font/woff2" crossorigin />`)
      .join('\n    ')}
    <link rel="preload" href="${HERO.src}" as="image" fetchpriority="high" />

    <script type="application/ld+json">${jsonLd(lang)}</script>`;
}

export function sitemapXml() {
  const today = new Date().toISOString().slice(0, 10);
  const entry = (lang) => `  <url>
    <loc>${urlFor(lang)}</loc>
    <lastmod>${today}</lastmod>
${locales.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${urlFor(l)}" />`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${urlFor('en')}" />
  </url>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${locales.map(entry).join('\n')}
</urlset>
`;
}

export const robotsTxt = () => `User-agent: *
Allow: /

Sitemap: ${origin()}/sitemap.xml
`;
