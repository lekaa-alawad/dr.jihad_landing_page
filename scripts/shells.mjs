// Writes the eight page shells — four pages by two locales.
//
// They are generated rather than hand-kept because they differ in four small
// ways (lang, dir, data-page, and whether the intro curtain is emitted) and are
// otherwise identical, including an inline script whose behaviour matters. Eight
// hand-maintained copies of that script is eight chances for one of them to
// drift and for the drift to be invisible until a page ships with the reveals
// stuck shut.
//
// Run by `npm run build` before Vite, and safe to run any time: it only ever
// writes these eight files. They ARE committed — Vite needs them on disk to
// resolve /treatments/ in dev and to take them as build inputs.

import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { locales } from '../src/i18n.js';
import { PAGES, pathFor } from '../src/routes.js';

const root = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));

const shell = (lang, page) => {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const home = page === 'home';

  // Only the home shell carries the curtain. It is a first-visit device for the
  // front door, and the sections that wait on it (`afterIntro`) live in the hero
  // — which is a home-page section now. Emitting it elsewhere would put a
  // curtain over a page with nothing waiting behind it.
  const intro = home
    ? `
    <!-- First-visit curtain: styles and the opt-in decision, both before the
         first paint so it never flashes in after the page. See src/intro.js.
         Home only — the hero is what waits behind it. -->
    <!--intro-head-->`
    : '';

  return `<!doctype html>
<html lang="${lang}" dir="${dir}" data-page="${page}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#0e0b0a" />
    <link rel="icon" href="/img/mark.png" type="image/png" />

    <!-- Titles, canonical, hreflang, Open Graph and the JSON-LD are injected
         from src/seo.js by the plugin in vite.config.js, so no two documents
         can drift apart. Same in dev and in the build.

         GENERATED FILE — edit scripts/shells.mjs, not this. -->
    <!--seo-head-->${intro}

    <script>
      // The reveal styles only bite under html.js. Setting the class here,
      // before first paint, stops the prerendered sections flashing visible and
      // then hiding once the bundle arrives. If the bundle never arrives, the
      // timeout hands visibility straight back rather than leaving a blank page.
      document.documentElement.classList.add('js');
      setTimeout(function () {
        if (!document.documentElement.hasAttribute('data-hydrated')) {
          document.documentElement.classList.remove('js');
        }
      }, 4000);
    </script>
  </head>
  <body>
${home ? '    <!--intro-->\n' : ''}    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;
};

let n = 0;
for (const lang of locales) {
  for (const page of PAGES) {
    // pathFor gives the URL; the file that serves it is that path + index.html,
    // with the leading slash dropped so it is relative to the project root.
    const file = root(`${pathFor(lang, page).replace(/^\//, '')}index.html`);
    await mkdir(new URL('.', `file://${file}`), { recursive: true });
    await writeFile(file, shell(lang, page));
    n += 1;
  }
}
console.log(`shells       ${n} written`);
