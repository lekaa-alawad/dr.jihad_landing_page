import { Fragment, useEffect, useRef } from 'react';
import { animate, inView, stagger } from 'motion';

/**
 * Text animation primitives.
 *
 * Splitting is done on a clone that is hidden from assistive tech, with the
 * original string kept in a visually-hidden node — a screen reader hears one
 * sentence, not a stream of single letters.
 */

export function SplitLines({ lines, className = '', delay = 0, as: Tag = 'h1' }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.querySelectorAll('.kin__inner').forEach((n) => (n.style.transform = 'none'));
      return;
    }
    const inners = el.querySelectorAll('.kin__inner');
    animate(
      inners,
      { transform: ['translateY(105%) rotate(2deg)', 'translateY(0%) rotate(0deg)'] },
      { duration: 1.05, delay: stagger(0.085, { startDelay: delay }), ease: [0.16, 1, 0.3, 1] }
    );
  }, [delay]);

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
export function SplitWords({ text, className = '', as: Tag = 'p' }) {
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
        animate(
          el.querySelectorAll('.kin__w'),
          { opacity: [0, 1], transform: ['translateY(14px)', 'translateY(0px)'] },
          { duration: 0.6, delay: stagger(0.018), ease: [0.16, 1, 0.3, 1] }
        );
      },
      { margin: '0px 0px -15% 0px' }
    );
  }, [text]);

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

/** Generic scroll reveal for blocks. Always resolves to visible. */
export function Reveal({ children, className = '', y = 26, blur = 8, delay = 0 }) {
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
        animate(
          el,
          { opacity: [0, 1], filter: [`blur(${blur}px)`, 'blur(0px)'], transform: [`translateY(${y}px)`, 'translateY(0px)'] },
          { duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }
        ).finished.then(() => {
          el.style.opacity = 1;
          el.style.filter = 'none';
        });
      },
      { margin: '0px 0px -12% 0px' }
    );
  }, [y, blur, delay]);

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
