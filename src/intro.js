// The first-visit curtain, carried over from the Astro build's Intro.astro and
// re-grounded in Noir's palette — it lifts onto near-black, not paper, so there
// is no white flash before the dark page appears.
//
// This is emitted into the page shell at build time rather than rendered by
// React, and that is the whole point: the bundle is ~90KB gzipped, so a curtain
// that waited for hydration would show the site first and cover it afterwards.
// In the shell it paints on the first frame.
//
// Three rules keep it from becoming a tax, all inherited from the original:
//   1. It only exists when the head script opts in (html.intro), so no JS means
//      no splash — the page is simply there.
//   2. The lift never waits on the bundle. It is triggered by the same inline
//      script that raised the curtain — if that script did not run there is no
//      curtain to lift — and a hard ceiling fires regardless of what loads.
//   3. prefers-reduced-motion and any repeat visit in the session skip it.

import { HERO, strings } from './i18n.js';

// The curtain used to hold for a flat 2000ms and take 800ms to lift, so every
// visitor — and every Lighthouse run, which is always a fresh session — watched
// 2.8s of blank near-black over a hero image that was already decoded. The hold
// is now a floor rather than a fixed wait: the lift starts as soon as the hero
// photograph is ready, and MIN_MS only stops it being so quick that the mark
// flashes past unread.
//
// MIN_MS is set against the choreography above it, not picked for feel. The
// curtain wipes bottom-to-top, and the tagline is the lowest element in the
// stack — so the tagline is the FIRST thing the wipe erases, not the last. It
// finishes fading in at 620ms (0.22s delay + 0.40s), and a floor below that
// destroys the wordmark on its way in, which is exactly what a first cut of
// this change did.
//
// MAX_MS is the ceiling. If an image is slow or never arrives, the curtain
// still leaves — a visitor must never be held behind it by a stalled request.
const MIN_MS = 820;
const MAX_MS = 1500;
const LIFT_MS = 500;
const LIFT = `${LIFT_MS}ms`;

export const introHead = () => `<style>
      /* The opt-in flag on <html> is deliberately NOT called "intro". These
         rules are global, unlike the scoped ones in the Astro original, so a
         bare ".intro" display:none rule would also match a document element
         carrying that same class and hide the whole page. */
      .intro { display: none; }

      html.intro-on .intro {
        position: fixed;
        inset: 0;
        z-index: 100;
        display: grid;
        place-items: center;
        background: #0e0b0a;
      }
      /* The lift is keyed to a class rather than an animation-delay, so the
         moment it starts can be decided at runtime instead of guessed at build
         time. */
      html.intro-on.intro-off .intro {
        animation: intro-lift ${LIFT} cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      /* Wiping the bottom edge upward reads as the curtain being drawn up.
         visibility settles it so nothing is left catching pointer events. */
      @keyframes intro-lift {
        to { clip-path: inset(0 0 100% 0); visibility: hidden; }
      }

      .intro__stack {
        display: flex; flex-direction: column; align-items: center;
        gap: 1.1rem;
        padding-inline: clamp(1.1rem, 4vw, 3.5rem);
      }

      .intro__mark {
        width: clamp(56px, 12vw, 76px); height: auto;
        animation: intro-mark 0.44s cubic-bezier(0.16, 1, 0.3, 1) both;
      }
      @keyframes intro-mark {
        from { opacity: 0; transform: translateY(14px) scale(0.92); filter: blur(6px); }
        to   { opacity: 1; transform: none; filter: blur(0); }
      }

      /* the sampled logo ramp, drawn out from the centre */
      .intro__rule {
        width: clamp(150px, 34vw, 260px); height: 2px;
        border-radius: 2px;
        background: linear-gradient(90deg, #f3b279, #c9895c);
        transform: scaleX(0);
        animation: intro-rule 0.34s cubic-bezier(0.16, 1, 0.3, 1) 0.14s forwards;
      }
      @keyframes intro-rule { to { transform: scaleX(1); } }

      .intro__tag {
        width: clamp(190px, 46vw, 300px); height: auto;
        animation: intro-tag 0.40s cubic-bezier(0.16, 1, 0.3, 1) 0.22s both;
      }
      @keyframes intro-tag {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: none; }
      }
    </style>
    <script>
      // Decides before first paint whether the curtain exists at all. Once per
      // session, never for reduced-motion, and silently skipped if storage is
      // unavailable (private mode) — the page just loads.
      try {
        if (
          !matchMedia('(prefers-reduced-motion: reduce)').matches &&
          !sessionStorage.getItem('jdc-intro')
        ) {
          var d = document.documentElement;
          d.classList.add('intro-on');
          sessionStorage.setItem('jdc-intro', '1');

          var t0 = performance.now();
          var fired = false;

          // When the curtain will start lifting, for the page underneath to
          // wait on. Without it the hero plays its whole entrance behind the
          // curtain and is finished before anyone can see it. Seeded with the
          // earliest possible moment so anything reading it before the decision
          // is made still gets a sane answer, then corrected below.
          window.__introLiftAt = t0 + ${MIN_MS};

          function lift() {
            if (fired) return;
            fired = true;
            // Never before MIN_MS: on a warm cache the image resolves in single
            // -digit milliseconds and the mark would flash past unread.
            var wait = Math.max(0, ${MIN_MS} - (performance.now() - t0));
            window.__introLiftAt = performance.now() + wait;
            setTimeout(function () { d.classList.add('intro-off'); }, wait);
          }

          // Not the load event: these two images specifically. The hero is
          // what the curtain reveals, the tagline is what the curtain is FOR,
          // and neither the fonts nor the 90KB bundle should hold it up. The
          // hero resolves off the <head> preload rather than a second request.
          var pending = 2;
          function ready() { if (--pending === 0) lift(); }
          [${JSON.stringify(HERO.src)}, '/img/tagline.png'].forEach(function (src) {
            var img = new Image();
            img.onload = ready;
            img.onerror = ready;
            img.src = src;
            if (img.complete) ready();
          });

          // The ceiling. A stalled or missing photograph must not trap anyone
          // behind the curtain.
          setTimeout(lift, ${MAX_MS});
        }
      } catch (e) {}
    </script>`;

export const introBody = (lang) => `<div class="intro" role="presentation" aria-hidden="true">
      <div class="intro__stack">
        <img class="intro__mark" src="/img/mark.png" alt="" width="240" height="240" />
        <span class="intro__rule"></span>
        <img class="intro__tag" src="/img/tagline.png" alt="${strings[lang].tagline}" width="900" height="176" />
      </div>
    </div>`;
