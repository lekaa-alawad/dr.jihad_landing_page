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
//   2. The lift is a CSS animation, not a JS timer. If the bundle never
//      arrives, or arrives late, the curtain still leaves on schedule.
//   3. prefers-reduced-motion and any repeat visit in the session skip it.

import { strings } from './i18n.js';

/** How long the curtain holds before it starts to lift. */
const HOLD_MS = 2000;
const LIFT_MS = 800;
const HOLD = `${HOLD_MS}ms`;
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
        animation: intro-lift ${LIFT} cubic-bezier(0.16, 1, 0.3, 1) ${HOLD} forwards;
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
        animation: intro-mark 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
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
        animation: intro-rule 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.34s forwards;
      }
      @keyframes intro-rule { to { transform: scaleX(1); } }

      .intro__tag {
        width: clamp(190px, 46vw, 300px); height: auto;
        animation: intro-tag 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both;
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
          document.documentElement.classList.add('intro-on');
          sessionStorage.setItem('jdc-intro', '1');
          // When the curtain will start lifting, for the page underneath to
          // wait on. Without this the hero plays its whole entrance behind the
          // curtain and is already finished by the time anyone can see it.
          // Set here rather than in the bundle because the curtain's animation
          // starts at first paint, long before hydration.
          window.__introLiftAt = performance.now() + ${HOLD_MS};
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
