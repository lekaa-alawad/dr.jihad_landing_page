import { SplitWords, Reveal, RevealGroup } from '../components/Kinetic.jsx';
import Kit from '../components/Kit.jsx';

/**
 * Who the centre is, in its own words, with the seven devices under them.
 *
 * It used to sit between the departments it runs and the numbers behind them,
 * and the second paragraph's nineteen years were the same nineteen the record
 * counted up to a moment later. The record stayed on the home page and this
 * moved, so that pairing is gone — the two now argue separately rather than in
 * sequence, which is the one thing the split costs.
 *
 * The equipment is out of the two-column grid on purpose. The prose reads best
 * against the heading beside it, but each device is a photograph and a
 * paragraph, and in a 0.62/1 column those rows come out half the width of the
 * screen they are on with nothing under the heading to justify it. The grid
 * holds the words; the equipment gets the whole measure.
 */
export default function About({ t }) {
  return (
    <section className="nr__section" id="about">
      <div className="nr__wrap">
        <div className="nr__about">
          <SplitWords as="h2" text={t.about.heading} className="nr__h2 nr__h2--sm" />
          <RevealGroup className="nr__aboutBody" gap={0.08}>
            {t.about.body.map((p) => <p key={p}>{p}</p>)}
          </RevealGroup>
        </div>
        <Reveal className="nr__kit">
          <p className="nr__kitLead">{t.about.kit.lead}</p>
          <Kit kit={t.about.kit} />
        </Reveal>
      </div>
    </section>
  );
}
