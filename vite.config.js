import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';
import { introBody, introHead } from './src/intro.js';
import { headTags, robotsTxt, sitemapXml } from './src/seo.js';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));

// `/ar/index.html` in the build, `/ar/` in dev — one test covers both.
const langOf = (path) => (path.includes('/ar/') ? 'ar' : 'en');

/**
 * Fills the <!--seo-head--> marker in each page shell, and emits the two files
 * that only exist for crawlers. Both run in dev too, so what you check locally
 * is what ships.
 */
const seoPlugin = () => ({
  name: 'jdc-seo',
  transformIndexHtml: {
    order: 'pre',
    handler: (html, ctx) => {
      const lang = langOf(ctx.path);
      return html
        .replace('<!--seo-head-->', headTags(lang))
        .replace('<!--intro-head-->', introHead())
        .replace('<!--intro-->', introBody(lang));
    },
  },
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml() });
    this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt() });
  },
});

/**
 * Serves the Arabic type comparison at /font-preview from `preview/`, in dev
 * only.
 *
 * It used to live in `public/`, which meant Vite copied it — and every
 * candidate face with it — straight into `dist/`. That is the wrong place for
 * working files in general, and unacceptable for this one in particular: some
 * of the faces under evaluation are licensed for nothing at all, and a deploy
 * must not be able to publish them because someone forgot to delete a folder.
 * Here they are reachable while choosing and structurally incapable of shipping.
 */
const previewPlugin = () => ({
  name: 'jdc-font-preview',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = (req.url || '').split('?')[0];
      const rel =
        url === '/font-preview' || url === '/font-preview.html'
          ? 'index.html'
          : url.startsWith('/preview-fonts/')
            ? `fonts/${url.slice('/preview-fonts/'.length)}`
            : null;
      if (!rel) return next();
      const file = here(`./preview/${rel}`);
      if (!existsSync(file)) return next();
      res.setHeader(
        'Content-Type',
        rel.endsWith('.html') ? 'text/html; charset=utf-8' : 'font/woff2'
      );
      res.end(readFileSync(file));
    });
  },
});

export default defineConfig({
  // Two real pages, not one SPA shell: /ar/ has to be its own indexable
  // document with its own <html lang>, not a client-side route.
  appType: 'mpa',
  plugins: [react(), seoPlugin(), previewPlugin()],
  server: { port: 5190 },
  build: {
    rollupOptions: {
      input: {
        en: here('./index.html'),
        ar: here('./ar/index.html'),
      },
    },
  },
});
