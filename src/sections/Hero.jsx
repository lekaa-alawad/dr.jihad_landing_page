import { useEffect, useRef } from 'react';
import { animate, scroll } from 'motion';
import { SplitLines, SplitWords, Reveal } from '../components/Kinetic.jsx';
import { HERO } from '../i18n.js';

/**
 * The hero, and the only section that owns a scroll animation.
 *
 * It lives on the home page alone, so the parallax and the `afterIntro` hold
 * came with it rather than staying in the layout. That matters: `afterIntro`
 * makes an element wait for the intro curtain to lift, and the curtain is only
 * emitted into the home shell now. On any other page nothing would ever release
 * the hold, and the copy would sit invisible waiting for a curtain that was
 * never built.
 */
export default function Hero({ t }) {
  const heroRef = useRef(null);
  const shotRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !heroRef.current) return undefined;

    const stops = [];
    if (shotRef.current) {
      stops.push(
        scroll(
          animate(shotRef.current, { transform: ['scale(1.06)', 'scale(1.2)'], opacity: [1, 0.45] }, { ease: 'linear' }),
          { target: heroRef.current, offset: ['start start', 'end start'] }
        )
      );
    }
    if (titleRef.current) {
      stops.push(
        scroll(
          animate(titleRef.current, { transform: ['translateY(0px)', 'translateY(-90px)'] }, { ease: 'linear' }),
          { target: heroRef.current, offset: ['start start', 'end start'] }
        )
      );
    }
    return () => stops.forEach((s) => s && s());
  }, []);

  return (
    <section className="nr__hero" ref={heroRef}>
      <img
        ref={shotRef}
        className="nr__heroShot"
        src={HERO.src}
        width={HERO.w}
        height={HERO.h}
        alt={t.hero.alt}
        fetchPriority="high"
        decoding="async"
      />
      <div className="nr__heroVeil" aria-hidden="true" />
      <div className="nr__wrap nr__heroIn" ref={titleRef}>
        {/* afterIntro only here: everything below the fold already waits
            for a scroll, so the curtain never steals its entrance. The
            three offsets are identical, so the choreography between them
            is exactly what it was before the curtain existed. */}
        <SplitLines lines={t.hero.lines} className="nr__h1" delay={0.25} afterIntro />
        <SplitWords text={t.hero.lede} className="nr__lede" afterIntro />
        <Reveal className="nr__acts" delay={0.2} afterIntro>
          {/* Both targets are sections of this page, so both stay bare
              fragments. `secondary` briefly pointed at a `/results/` document
              while the sliders had a page of their own; they are back on the
              home page, and a cross-document link to a section of the page you
              are already on would reload it to move a screen and a half. */}
          <a className="nr__cta" href="#reach">{t.hero.primary}</a>
          <a className="nr__cta nr__cta--ghost" href="#cases">{t.hero.secondary}</a>
        </Reveal>
      </div>
      <div className="nr__scope" aria-hidden="true">
        {t.scope.map((s) => <span key={s}>{s}</span>)}
      </div>
    </section>
  );
}
