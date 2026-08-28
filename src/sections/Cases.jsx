import { SplitWords, Reveal, RevealGroup } from '../components/Kinetic.jsx';
import Seam from '../components/Seam.jsx';
import { casePairs } from '../i18n.js';
import Sub from './Sub.jsx';

/**
 * The before/after sliders.
 *
 * They had a page to themselves for one revision and are back on the home
 * page, between the record and the visitors. Nothing about the section changed
 * in the move except the hairline above it, which it needs now that something
 * comes before it.
 *
 * Every slider is one lazy image — the frame shows the top half of the source
 * as the before and the bottom half as the after — so four of them cost the
 * home page four requests it only makes once they are scrolled to.
 */
export default function Cases({ t }) {
  return (
    <section className="nr__section nr__section--rule" id="cases">
      <div className="nr__wrap">
        <SplitWords as="h2" text={t.cases.heading} className="nr__h2" />
        <Reveal><Sub text={t.cases.sub} /></Reveal>
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
  );
}
