import { useEffect, useRef } from 'react';
import { animate, scroll } from 'motion';
import { SplitLines, SplitWords, Reveal, RevealGroup } from './components/Kinetic.jsx';
import Seam from './components/Seam.jsx';
import { headline, treatments, cases, contact, clinic, record } from './data.js';
import './noir.css';

/**
 * DIRECTION 4 — NOIR (my pick)
 *
 * Reasoning, not taste: patients judge dental work by looking at teeth, and
 * enamel reads truest against darkness — every clinical photographer shoots on
 * black for the same reason. It also matches the real use scene from PRODUCT.md,
 * a phone at night, and it is the one direction none of the cream-and-terracotta
 * competitors will ship. The logo ramp becomes the only light in the room.
 */
export default function Noir() {
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

      <section className="nr__hero" ref={heroRef}>
        <img
          ref={shotRef}
          className="nr__heroShot"
          src="/img/smile-a.webp"
          alt="Close-up of a finished smile, photographed at the clinic"
        />
        <div className="nr__heroVeil" aria-hidden="true" />
        <div className="nr__wrap nr__heroIn" ref={titleRef}>
          <SplitLines lines={headline.lines} className="nr__h1" delay={0.25} />
          <SplitWords text={headline.lede} className="nr__lede" />
          <Reveal className="nr__acts" delay={0.2}>
            <a className="nr__cta" href="#reach">Contact the clinic</a>
            <a className="nr__cta nr__cta--ghost" href="#cases">See real results</a>
          </Reveal>
        </div>
        <div className="nr__scope" aria-hidden="true">
          {treatments.map((t) => <span key={t.short}>{t.short}</span>)}
        </div>
      </section>

      <section className="nr__section" id="cases">
        <div className="nr__wrap">
          <SplitWords as="h2" text="Every seam remembers a hand." className="nr__h2" />
          <Reveal><p className="nr__sub">Drag the seam. Above it the work as it stands, below it as it came.</p></Reveal>
          <Reveal className="nr__lead">
            <Seam src={cases[0].src} id={cases[0].id} label={cases[0].label} theme="seam--nr" />
          </Reveal>
          <RevealGroup className="nr__grid" kind="scale" gap={0.1}>
            {cases.slice(1).map((c) => (
              <Seam key={c.id} src={c.src} id={c.id} label={c.label} theme="seam--nr" />
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="nr__section nr__section--rule" id="treatments">
        <div className="nr__wrap">
          <SplitWords as="h2" text="Everything, in one place." className="nr__h2" />
          <RevealGroup className="nr__rows" gap={0.05}>
            {treatments.map((t) => (
              <div className={`nr__row ${t.lead ? 'is-lead' : ''}`} key={t.name}>
                <h3>{t.name}</h3>
                <p>{t.note}</p>
              </div>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="nr__section">
        <div className="nr__wrap">
          <SplitWords as="h2" text="The record." className="nr__h2 nr__h2--sm" />
          <Reveal><p className="nr__sub">The practice in numbers.</p></Reveal>
          <RevealGroup className="nr__rows nr__rows--tight" gap={0.05}>
            {record.map((r) => (
              <div className="nr__recRow" key={r.label}>
                <span>{r.label}</span>
                <span className="nr__val">{r.value}</span>
              </div>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="nr__section nr__section--end" id="reach">
        <div className="nr__wrap">
          <SplitWords as="h2" text="Reach us." className="nr__h2" />
          <RevealGroup className="nr__rows nr__rows--tight" gap={0.06}>
            {contact.map((c) => (
              <div className="nr__recRow" key={c.label}>
                <span>{c.label}</span>
                <span className="nr__val">{c.value}</span>
              </div>
            ))}
          </RevealGroup>
          <Reveal>
            <img className="nr__tagline" src="/img/tagline.png" alt={clinic.tagline} />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
