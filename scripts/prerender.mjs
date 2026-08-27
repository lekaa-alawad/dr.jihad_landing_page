// Renders each locale to static HTML and writes it into the built pages.
//
// WHY: this is a client-rendered React app, so before this step a crawler that
// did not execute JavaScript received `<div id="root"></div>` and nothing else
// — no headline, no treatment names, no case captions. Google does render JS
// eventually, but on a second pass and with no guarantee of timing, and the
// other crawlers that matter here (Bing, and every social and messaging
// unfurler) largely do not render at all. For a clinic whose whole job is to be
// found, shipping an empty document is the most expensive thing on the page.
//
// The app stays a normal Vite SPA build. This runs after it, loads the same
// components through Vite's SSR pipeline, and injects the result — so there is
// no second bundle to keep in sync, and the client hydrates what it finds.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';
import { locales, strings } from '../src/i18n.js';
import { PAGES, SERVICES, pathFor } from '../src/routes.js';

const dist = (p) => fileURLToPath(new URL(`../dist/${p}`, import.meta.url));

// Where each document lives, relative to dist/. Same route table the shells and
// the Vite inputs come from, so the three cannot disagree about what exists.
const fileFor = (lang, page) => `${pathFor(lang, page).replace(/^\//, '')}index.html`;

// `noDiscovery` matters: a dev server would otherwise run esbuild's dependency
// scanner over the whole graph before serving anything. Nothing here is served
// to a browser — only `ssrLoadModule` is used, and SSR does not read the
// optimised bundles — so the scan is pure overhead, and it was the step failing
// in CI. Skipping it takes esbuild out of the prerender path altogether.
const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'warn',
  optimizeDeps: { noDiscovery: true, include: [] },
});

// SERVICES is coupled by position to treatments.items — it supplies the anchor
// each dropdown entry points at. If a department is added to i18n.js and not
// here, the last menu entries silently link to `undefined`; if one is removed,
// a menu entry points at a row that no longer exists. Both are invisible on the
// page and obvious here.
for (const lang of locales) {
  const n = strings[lang].treatments.items.length;
  if (n !== SERVICES.length) {
    throw new Error(
      `routes.js SERVICES has ${SERVICES.length} anchors but strings.${lang}.treatments.items has ${n} — the dropdown would point at the wrong departments`
    );
  }
}

try {
  const { default: Noir } = await vite.ssrLoadModule('/src/Noir.jsx');

  for (const lang of locales) {
    for (const page of PAGES) {
      const rel = fileFor(lang, page);
      const file = dist(rel);
      const html = await readFile(file, 'utf8');

      const body = renderToString(createElement(Noir, { lang, page }));

      if (!html.includes('<div id="root"></div>')) {
        throw new Error(`${rel}: no empty #root to fill — did the shell change?`);
      }

      // A page that renders to almost nothing means the tree threw somewhere and
      // React swallowed it. Better to fail the build than to publish a shell and
      // quietly lose the one thing this script exists for.
      //
      // The floor is per-page now. `results` is one section of four sliders and
      // legitimately renders a fraction of what home does, so a single 2000-byte
      // rule would either fail that page or be too slack to catch an empty one.
      const floor = page === 'home' ? 6000 : 1500;
      if (body.length < floor) {
        throw new Error(`${rel}: rendered only ${body.length} bytes, under the ${floor} floor — prerender produced an empty page`);
      }

      await writeFile(file, html.replace('<div id="root"></div>', `<div id="root">${body}</div>`));
      console.log(`prerendered  ${rel.padEnd(28)} ${(body.length / 1024).toFixed(1)} KB of markup`);
    }
  }
} finally {
  await vite.close();
}
