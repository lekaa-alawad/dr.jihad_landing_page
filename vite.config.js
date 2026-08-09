import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
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
    handler: (html, ctx) => html.replace('<!--seo-head-->', headTags(langOf(ctx.path))),
  },
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml() });
    this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt() });
  },
});

export default defineConfig({
  // Two real pages, not one SPA shell: /ar/ has to be its own indexable
  // document with its own <html lang>, not a client-side route.
  appType: 'mpa',
  plugins: [react(), seoPlugin()],
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
