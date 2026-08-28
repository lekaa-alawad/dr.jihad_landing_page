// The site's three pages, and which sections each one holds.
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
export const PAGES = ['home', 'treatments', 'about'];

/**
 * Section ids per page, in render order.
 *
 * Every section listed here is one that already existed on the single page —
 * none were split, and none were dropped. Home keeps the hero, the record and
 * the visitors because a homepage carrying only the hero is a doorway, not a
 * page: the record and the visitors are the two things that argue for the
 * clinic without the clinic having to claim anything.
 *
 * `cases` sits here rather than on a page of its own. The before/after sliders
 * are the strongest argument the clinic has and the one a visitor is most
 * likely to want without having gone looking for it — behind a nav entry they
 * were only seen by someone who already thought to ask. They land after the
 * record, so the counted figures are answered by the pictures behind them, and
 * before the visitors, so the proof comes ahead of the crowd.
 *
 * `reach` CLOSES EVERY PAGE, and is the one section that repeats. It is what a
 * visitor arrives looking for, and which page they happened to land on is not
 * something they chose — a reader who reaches the end of the departments and
 * wants to book should not have to find their way back to the home page to
 * learn where the clinic is. It carries the clinic's tagline with it, so every
 * document also ends on the same closing mark rather than stopping dead.
 *
 * That makes the address and the numbers duplicate content across three URLs.
 * For a contact block that is the normal shape of a footer and not something a
 * crawler penalises; the alternative — one page owning the only copy of the
 * clinic's address — is worse for the reader and no better for the index.
 */
export const SECTIONS = {
  home: ['hero', 'record', 'cases', 'visitors', 'reach'],
  treatments: ['treatments', 'reach'],
  about: ['team', 'about', 'reach'],
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
 * An anchor per department, in the order `treatments.items` lists them.
 *
 * These are URL fragments, so they are ASCII and they are the same in both
 * locales — /treatments/#orthodontics and /ar/treatments/#orthodontics are the
 * same row of the same page, which is what lets the menu be built once and the
 * language switch keep its place.
 *
 * COUPLED BY POSITION to `strings.<lang>.treatments.items`. Reordering the items
 * in i18n.js without reordering this list would point every menu entry at the
 * wrong department — silently, because every id would still resolve to a real
 * row. scripts/prerender.mjs checks the two lengths agree on every build, which
 * catches an added or removed department; a straight swap it cannot see, so
 * treat the two lists as one.
 */
export const SERVICES = [
  'cosmetic',
  'implants',
  'endodontics',
  'orthodontics',
  'childrens',
  'dental-laser',
  'injectables',
  'skin-laser',
  'imaging',
];

/**
 * The nav, in order.
 *
 * No `contact` entry: the two buttons in the bar — call and WhatsApp — are the
 * contact affordance on every page, and they act rather than navigate. A third
 * link pointing at a section of the home page was one more thing to read for
 * something the buttons beside it already did.
 *
 * No `results` entry either, for the opposite reason: the before/after sliders
 * are not a place to go, they are the argument itself, and they now sit on the
 * home page where everybody meets them rather than behind a tab only the
 * curious pressed.
 *
 * `menu: 'services'` marks the one entry that opens a dropdown of the nine
 * departments underneath it.
 */
export const NAV = [
  { id: 'home', page: 'home' },
  { id: 'treatments', page: 'treatments', menu: 'services' },
  { id: 'about', page: 'about' },
];
