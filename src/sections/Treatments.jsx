import { SplitWords, RevealGroup } from '../components/Kinetic.jsx';
import Gallery from '../components/Gallery.jsx';

/** The nine departments — the whole of the Treatments page. */
export default function Treatments({ t }) {
  return (
    <section className="nr__section" id="treatments">
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
                {/* The clinic writes these as two or three sentences, one
                    per line, and they stay that way — `\n` is a paragraph
                    break here rather than the line break it means in the
                    standfirsts, because at this length a run-on block is
                    what stops the section being readable. */}
                {String(item.note).split('\n').map((line, i) => <p key={i}>{line}</p>)}
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
  );
}
