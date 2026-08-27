// The site's four pages, and which sections each one holds.
//
// This table is the single source of truth for the split. Everything that used
// to assume "one document per locale" now reads from here instead: the page
// shells, the Vite inputs, the prerender loop, the canonical and hreflang tags,
// the sitemap, and the nav. Adding a page means adding a row, not editing seven
// files and hoping they agree.
//
// WHY A TABLE AND NOT A ROUTER: this stays a multi-page app. Every URL is a real
// prerendered document with its own <html lang> — that is what scripts/
// prerender.mjs exists to protect, and what wrangler.jsonc's `not_found_handling`
// warning is about. A client-side router would undo both.

/** In nav order. `home` is the only one whose slug is empty. */
export const PAGES = ['home', 'treatments', 'results', 'about'];

/**
 * Section ids per page, in render order.
 *
 * Every section listed here is one that already existed on the single page —
 * none were split, and none were dropped. Home keeps four because a homepage
 * carrying only the hero and the record is a doorway, not a page: the record
 * and the visitors are the two things that argue for the clinic without the
 * clinic having to claim anything, and `reach` is the only section a visitor
 * ever arrives *looking* for.
 */
export const SECTIONS = {
  home: ['hero', 'record', 'visitors', 'reach'],
  treatments: ['treatments'],
  results: ['cases'],
  about: ['about', 'team'],
};

/**
 * ASCII slugs in both locales — `/ar/treatments/`, not `/ar/الأقسام/`.
 *
 * An Arabic slug is percent-encoded the moment it leaves the address bar, so it
 * reaches a sitemap, a WhatsApp share and an analytics report as a run of %D8%
 * escapes. The gain would be cosmetic and only inside the browser chrome; the
 * cost lands everywhere the URL is read as text.
 */
export const slugOf = (page) => (page === 'home' ? '' : `${page}/`);

/** The path a page is served at. Always ends in `/` — these are directories. */
export const pathFor = (lang, page = 'home') =>
  `${lang === 'en' ? '/' : `/${lang}/`}${slugOf(page)}`;

/**
 * Which page a path belongs to.
 *
 * Takes both forms it is asked about: `/ar/treatments/` in dev, where Vite hands
 * over the request URL, and `ar/treatments/index.html` in the build, where
 * Rollup hands over the input name. Anything unrecognised is `home`, so a new
 * shell that has not been added to PAGES renders something rather than throwing.
 */
export const pageOf = (path) => {
  const parts = String(path)
    .replace(/index\.html$/, '')
    .split('/')
    .filter(Boolean);
  if (parts[0] === 'ar') parts.shift();
  return PAGES.includes(parts[0]) ? parts[0] : 'home';
};

/**
 * The nav, in order.
 *
 * `contact` is deliberately not a page. It is five rows — address, two phones,
 * WhatsApp, Instagram, hours — and a page carrying only that is exactly the
 * empty page this split exists to get rid of. It lives on the home page and the
 * menu points at it there, so the visitor still gets the affordance.
 */
export const NAV = [
  { id: 'home', page: 'home' },
  { id: 'treatments', page: 'treatments' },
  { id: 'results', page: 'results' },
  { id: 'about', page: 'about' },
  { id: 'contact', page: 'home', hash: 'reach' },
];
