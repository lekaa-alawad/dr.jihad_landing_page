import { Fragment, useEffect, useRef } from 'react';
import { animate, inView, stagger } from 'motion';
import { formatNumber } from '../i18n.js';

/**
 * Text animation primitives.
 *
 * Splitting is done on a clone that is hidden from assistive tech, with the
 * original string kept in a visually-hidden node — a screen reader hears one
 * sentence, not a stream of single letters.
 */

/**
 * Seconds still to wait before the intro curtain starts lifting, or 0 when
 * there is no curtain. The page renders underneath it, so anything that plays
 * on mount would otherwise be over before it could be seen — `afterIntro`
 * shifts a block's entrance to the moment the curtain clears, leaving the
 * relative choreography between blocks untouched.
 */
const introOffset = () => Math.max(0, (window.__introLiftAt ?? 0) - performance.now()) / 1000;

export function SplitLines({ lines, className = '', delay = 0, afterIntro = false, as: Tag = 'h1' }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.querySelectorAll('.kin__inner').forEach((n) => (n.style.transform = 'none'));
      return;
    }
    const start = delay + (afterIntro ? introOffset() : 0);
    const inners = el.querySelectorAll('.kin__inner');
    animate(
      inners,
      { transform: ['translateY(105%) rotate(2deg)', 'translateY(0%) rotate(0deg)'] },
      { duration: 1.05, delay: stagger(0.085, { startDelay: start }), ease: [0.16, 1, 0.3, 1] }
    );
  }, [delay, afterIntro]);

  return (
    <Tag className={className} ref={ref}>
      <span className="vh">{lines.join(' ')}</span>
      {lines.map((line, i) => (
        <span className="kin__mask" key={i} aria-hidden="true">
          <span className="kin__inner">{line}</span>
        </span>
      ))}
    </Tag>
  );
}

/** Word-by-word rise, fired when the block scrolls into view. */
export function SplitWords({ text, className = '', delay = 0, afterIntro = false, as: Tag = 'p' }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.querySelectorAll('.kin__w').forEach((n) => (n.style.opacity = 1));
      return;
    }
    return inView(
      el,
      () => {
        // Resolved here rather than at mount: in view means the curtain is
        // about to clear, so this is the truest reading of what is left of it.
        const start = delay + (afterIntro ? introOffset() : 0);
        animate(
          el.querySelectorAll('.kin__w'),
          { opacity: [0, 1], transform: ['translateY(14px)', 'translateY(0px)'] },
          { duration: 0.6, delay: stagger(0.018, { startDelay: start }), ease: [0.16, 1, 0.3, 1] }
        );
      },
      { margin: '0px 0px -15% 0px' }
    );
  }, [text, delay, afterIntro]);

  return (
    <Tag className={className} ref={ref}>
      <span className="vh">{text}</span>
      <span aria-hidden="true">
        {text.split(' ').map((w, i) => (
          // the space is a text node BETWEEN spans: inside an inline-block it
          // gets trimmed and every word runs together
          <Fragment key={i}>
            <span className="kin__w">{w}</span>{' '}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}

/**
 * A record figure that counts up to its value the first time it is scrolled to.
 *
 * The final number is what renders on the server and what sits in the markup, so
 * a crawler and a no-JS visitor read the real figure — the count is something
 * the browser opts into afterwards, never the source of truth. Two consequences
 * follow from that, and both matter more here than the effect does:
 *
 *  - A figure already on screen at load is left alone. Snapping a settled
 *    "4,200" back to zero so it can climb again reads as a glitch, not an
 *    animation.
 *  - The value is written straight to the DOM node rather than through state:
 *    sixty renders a second across four rows is waste, and it keeps React's
 *    idea of the tree identical to the server's.
 *
 * This is a clinic's record. A number left stranded mid-count would be a false
 * claim, so the failsafe below always restores the true value.
 */
export function CountUp({ value, lang, className = '' }) {
  const ref = useRef(null);
  const final = formatNumber(value, lang);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Already visible on arrival: leave the settled number as it is.
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.textContent = formatNumber(0, lang);

    let controls;
    // If the observer never fires — broken IntersectionObserver, a browser that
    // keeps the section out of view forever — the zero above would stand as a
    // published figure. This puts the true number back regardless. It usually
    // fires long before the visitor scrolls this far, which is harmless: the
    // count still runs when they arrive, from whatever the value reads then.
    const settle = setTimeout(() => (el.textContent = final), 6000);

    const stop = inView(
      el,
      () => {
        controls = animate(0, value, {
          duration: 1.5,
          ease: [0.16, 1, 0.3, 1],
          onUpdate: (v) => (el.textContent = formatNumber(v, lang)),
        });
        controls.finished.then(() => (el.textContent = final)).catch(() => {});
      },
      { margin: '0px 0px -12% 0px' }
    );

    return () => {
      clearTimeout(settle);
      controls?.stop?.();
      stop();
      el.textContent = final;
    };
  }, [value, lang, final]);

  return (
    <span ref={ref} className={className}>
      {final}
    </span>
  );
}

/** Generic scroll reveal for blocks. Always resolves to visible. */
export function Reveal({ children, className = '', y = 26, blur = 8, delay = 0, afterIntro = false }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.opacity = 1;
      return;
    }
    return inView(
      el,
      () => {
        const start = delay + (afterIntro ? introOffset() : 0);
        animate(
          el,
          { opacity: [0, 1], filter: [`blur(${blur}px)`, 'blur(0px)'], transform: [`translateY(${y}px)`, 'translateY(0px)'] },
          { duration: 0.85, delay: start, ease: [0.16, 1, 0.3, 1] }
        ).finished.then(() => {
          el.style.opacity = 1;
          el.style.filter = 'none';
        });
      },
      { margin: '0px 0px -12% 0px' }
    );
  }, [y, blur, delay, afterIntro]);

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

/** Staggered children, one orchestrated run per group. */
export function RevealGroup({ children, className = '', gap = 0.06, kind = 'rise' }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const kids = Array.from(el.children);
    if (!kids.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      kids.forEach((k) => (k.style.opacity = 1));
      return;
    }
    return inView(
      el,
      () => {
        const from =
          kind === 'scale'
            ? { opacity: [0, 1], transform: ['scale(0.94)', 'scale(1)'] }
            : { opacity: [0, 1], transform: ['translateY(22px)', 'translateY(0px)'] };
        animate(kids, from, { duration: 0.7, delay: stagger(gap), ease: [0.16, 1, 0.3, 1] })
          .finished.then(() => kids.forEach((k) => (k.style.opacity = 1)));
      },
      { margin: '0px 0px -12% 0px' }
    );
  }, [gap, kind]);

  return (
    <div ref={ref} className={`rgroup ${className}`}>
      {children}
    </div>
  );
}
