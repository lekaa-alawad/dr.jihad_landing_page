import { useEffect, useRef } from 'react';
import Nav from './components/Nav.jsx';
import Hero from './sections/Hero.jsx';
import Cases from './sections/Cases.jsx';
import Treatments from './sections/Treatments.jsx';
import About from './sections/About.jsx';
import Record from './sections/Record.jsx';
import Visitors from './sections/Visitors.jsx';
import Team from './sections/Team.jsx';
import Reach from './sections/Reach.jsx';
import { SECTIONS } from './routes.js';
import { strings } from './i18n.js';
import './noir.css';

/** Section id → component. The route table names the ids; this resolves them. */
const PARTS = {
  hero: Hero,
  cases: Cases,
  treatments: Treatments,
  about: About,
  record: Record,
  visitors: Visitors,
  team: Team,
  reach: Reach,
};

/**
 * DIRECTION 4 — NOIR (my pick)
 *
 * Reasoning, not taste: patients judge dental work by looking at teeth, and
 * enamel reads truest against darkness — every clinical photographer shoots on
 * black for the same reason. It also matches the real use scene from PRODUCT.md,
 * a phone at night, and it is the one direction none of the cream-and-terracotta
 * competitors will ship. The logo ramp becomes the only light in the room.
 *
 * This is now the LAYOUT rather than the page: the chrome that every document
 * shares — the lamp, the grain, the bar — plus whichever sections the route
 * table gives this page. `lang` picks the copy and `page` picks the sections;
 * direction is set on <html> by the page shell, and the stylesheet keys off it.
 *
 * Rendered once per page per locale — eight documents, not two.
 */
export default function Noir({ lang = 'en', page = 'home' }) {
  const t = strings[lang];
  const rootRef = useRef(null);
  const ids = SECTIONS[page] ?? SECTIONS.home;

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return undefined;

    // a warm light that follows the pointer, as if the room had one lamp
    const onMove = (e) => {
      rootRef.current?.style.setProperty('--mx', `${e.clientX}px`);
      rootRef.current?.style.setProperty('--my', `${e.clientY}px`);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <div className="nr" ref={rootRef} data-page={page}>
      <div className="nr__lamp" aria-hidden="true" />
      <div className="nr__grain" aria-hidden="true" />

      <Nav t={t} lang={lang} page={page} />

      <main id="main">
        {ids.map((id) => {
          const Part = PARTS[id];
          return Part ? <Part key={id} t={t} lang={lang} /> : null;
        })}
      </main>
    </div>
  );
}
