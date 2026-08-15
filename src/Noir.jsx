import { useEffect, useRef } from 'react';
import { animate, scroll } from 'motion';
import { CountUp, SplitLines, SplitWords, Reveal, RevealGroup } from './components/Kinetic.jsx';
import Seam from './components/Seam.jsx';
import Gallery from './components/Gallery.jsx';
import { HERO, casePairs, dialable, strings, waLink } from './i18n.js';
import './noir.css';

/**
 * DIRECTION 4 — NOIR (my pick)
 *
 * Reasoning, not taste: patients judge dental work by looking at teeth, and
 * enamel reads truest against darkness — every clinical photographer shoots on
 * black for the same reason. It also matches the real use scene from PRODUCT.md,
 * a phone at night, and it is the one direction none of the cream-and-terracotta
 * competitors will ship. The logo ramp becomes the only light in the room.
 *
 * Rendered once per locale. `lang` picks the copy; direction is set on <html>
 * by the page shell, and the stylesheet keys off it.
 */
export default function Noir({ lang = 'en' }) {
  const t = strings[lang];
  const rootRef = useRef(null);
  const heroRef = useRef(null);
  const shotRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // a warm light that follows the pointer, as if the room had one lamp
    const onMove = (e) => {
      rootRef.current?.style.setProperty('--mx', `${e.clientX}px`);
      rootRef.current?.style.setProperty('--my', `${e.clientY}px`);
    };
    if (!reduce) window.addEventListener('pointermove', onMove, { passive: true });

    const stops = [];
    if (!reduce && heroRef.current) {
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
    }

    return () => {
      window.removeEventListener('pointermove', onMove);
      stops.forEach((s) => s && s());
    };
  }, []);

  return (
    <div className="nr" ref={rootRef}>
      <div className="nr__lamp" aria-hidden="true" />
      <div className="nr__grain" aria-hidden="true" />

      {/* A plain anchor to the other locale: a crawler follows it, and a
          visitor without JavaScript still gets the switch. */}
      <a className="nr__lang" href={t.switchTo.href} hrefLang={t.switchTo.code} lang={t.switchTo.code} title={t.switchTo.title}>
        {t.switchTo.label}
      </a>

      <main>
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
              <a className="nr__cta" href="#reach">{t.hero.primary}</a>
              <a className="nr__cta nr__cta--ghost" href="#cases">{t.hero.secondary}</a>
            </Reveal>
          </div>
          <div className="nr__scope" aria-hidden="true">
            {t.scope.map((s) => <span key={s}>{s}</span>)}
          </div>
        </section>

        <section className="nr__section" id="cases">
          <div className="nr__wrap">
            <SplitWords as="h2" text={t.cases.heading} className="nr__h2" />
            <Reveal><p className="nr__sub">{t.cases.sub}</p></Reveal>
            <Reveal className="nr__lead">
              <Seam {...casePairs[0]} label={t.cases.labels[0]} theme="seam--nr" t={t.cases} />
            </Reveal>
            <RevealGroup className="nr__grid" kind="scale" gap={0.1}>
              {casePairs.slice(1).map((c, i) => (
                <Seam key={c.id} {...c} label={t.cases.labels[i + 1]} theme="seam--nr" t={t.cases} />
              ))}
            </RevealGroup>
          </div>
        </section>

        <section className="nr__section nr__section--rule" id="treatments">
          <div className="nr__wrap">
            <SplitWords as="h2" text={t.treatments.heading} className="nr__h2" />
            <RevealGroup className="nr__rows" gap={0.05}>
              {t.treatments.items.map((item) => (
                <div className={`nr__row ${item.lead ? 'is-lead' : ''}`} key={item.name}>
                  <h3>{item.name}</h3>
                  {/* The note and the list are one cell, so on wide screens the
                      imaging modalities stay in the right-hand column with the
                      sentence that introduces them. */}
                  <div>
                    <p>{item.note}</p>
                    {item.list && (
                      <ul className="nr__subList">
                        {item.list.map((sub) => <li key={sub}>{sub}</li>)}
                      </ul>
                    )}
                    {item.gallery && <Gallery gallery={item.gallery} t={t.gallery} />}
                  </div>
                </div>
              ))}
            </RevealGroup>
          </div>
        </section>

        <section className="nr__section" id="record">
          <div className="nr__wrap">
            <SplitWords as="h2" text={t.record.heading} className="nr__h2 nr__h2--sm" />
            <Reveal><p className="nr__sub">{t.record.sub}</p></Reveal>
            <RevealGroup className="nr__rows nr__rows--tight" gap={0.05}>
              {t.record.items.map((r) => (
                <div className="nr__recRow" key={r.label}>
                  <span>{r.label}</span>
                  <CountUp value={r.value} lang={lang} className="nr__val nr__val--num" />
                </div>
              ))}
            </RevealGroup>
          </div>
        </section>

        <section className="nr__section nr__section--end" id="reach">
          <div className="nr__wrap">
            <SplitWords as="h2" text={t.reach.heading} className="nr__h2" />
            <RevealGroup className="nr__rows nr__rows--tight" gap={0.06}>
              {t.reach.items.map((c) => (
                <div className="nr__recRow" key={c.label}>
                  <span>{c.label}</span>
                  {/* `dir` goes on each value, never on the group: a Latin-digit
                      phone number reorders inside an RTL paragraph unless it is
                      marked as its own LTR run, but marking the group would also
                      flip which edge the values align to, and stack them against
                      the wrong side of the row. */}
                  <span className="nr__vals">
                    {c.values.map((v) => (
                      <span className="nr__val" key={v} dir={c.ltr ? 'ltr' : undefined}>
                        {c.tel ? <a href={`tel:${dialable(v)}`}>{v}</a> : v}
                      </span>
                    ))}
                    {c.wa && (
                      // rel is what keeps the opened tab from reaching back
                      // into this one through window.opener
                      <a
                        className="nr__wa"
                        href={waLink(c.values[0])}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t.reach.waLabel}
                      </a>
                    )}
                  </span>
                </div>
              ))}
            </RevealGroup>
            <Reveal>
              <img className="nr__tagline" src="/img/tagline.png" width="900" height="176" alt={t.tagline} loading="lazy" />
            </Reveal>
          </div>
        </section>
      </main>
    </div>
  );
}
