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
import { locales } from '../src/i18n.js';

const dist = (p) => fileURLToPath(new URL(`../dist/${p}`, import.meta.url));

// Where each locale's built page lives, relative to dist/.
const pageFor = (lang) => (lang === 'en' ? 'index.html' : `${lang}/index.html`);

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

try {
  const { default: Noir } = await vite.ssrLoadModule('/src/Noir.jsx');

  for (const lang of locales) {
    const file = dist(pageFor(lang));
    const html = await readFile(file, 'utf8');

    const body = renderToString(createElement(Noir, { lang }));

    if (!html.includes('<div id="root"></div>')) {
      throw new Error(`${pageFor(lang)}: no empty #root to fill — did the shell change?`);
    }

    // A page that renders to almost nothing means the tree threw somewhere and
    // React swallowed it. Better to fail the build than to publish a shell and
    // quietly lose the one thing this script exists for.
    if (body.length < 2000) {
      throw new Error(`${pageFor(lang)}: rendered only ${body.length} bytes — prerender produced an empty page`);
    }

    await writeFile(file, html.replace('<div id="root"></div>', `<div id="root">${body}</div>`));
    console.log(`prerendered  ${pageFor(lang)}  (${(body.length / 1024).toFixed(1)} KB of markup)`);
  }
} finally {
  await vite.close();
}
