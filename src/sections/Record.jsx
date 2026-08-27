import { SplitWords, Reveal, RevealGroup, CountUp } from '../components/Kinetic.jsx';
import Sub from './Sub.jsx';

/** Four counted figures. No images, so it costs the home page nothing. */
export default function Record({ t, lang }) {
  return (
    <section className="nr__section" id="record">
      <div className="nr__wrap">
        <SplitWords as="h2" text={t.record.heading} className="nr__h2 nr__h2--sm" />
        <Reveal><Sub text={t.record.sub} /></Reveal>
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
  );
}
