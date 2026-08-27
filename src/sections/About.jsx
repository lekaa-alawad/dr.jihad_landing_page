import { SplitWords, Reveal, RevealGroup } from '../components/Kinetic.jsx';
import Kit from '../components/Kit.jsx';

/**
 * Who the centre is, in its own words, with the seven devices behind a button.
 *
 * It used to sit between the departments it runs and the numbers behind them,
 * and the second paragraph's nineteen years were the same nineteen the record
 * counted up to a moment later. The record stayed on the home page and this
 * moved, so that pairing is gone — the two now argue separately rather than in
 * sequence, which is the one thing the split costs.
 */
export default function About({ t }) {
  return (
    <section className="nr__section" id="about">
      <div className="nr__wrap nr__about">
        <SplitWords as="h2" text={t.about.heading} className="nr__h2 nr__h2--sm" />
        <div>
          <RevealGroup className="nr__aboutBody" gap={0.08}>
            {t.about.body.map((p) => <p key={p}>{p}</p>)}
          </RevealGroup>
          <Reveal className="nr__kit">
            <p className="nr__kitLead">{t.about.kit.lead}</p>
            {/* `t.gallery` only for the close label — the same chrome
                string every dialog on the page closes with. */}
            <Kit kit={t.about.kit} t={t.gallery} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
