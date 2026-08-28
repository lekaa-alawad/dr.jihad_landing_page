import { SplitWords, RevealGroup } from '../components/Kinetic.jsx';
import Gallery from '../components/Gallery.jsx';
import { SERVICES } from '../routes.js';

/** The nine departments — the whole of the Treatments page. */
export default function Treatments({ t }) {
  return (
    <section className="nr__section" id="treatments">
      <div className="nr__wrap">
        <SplitWords as="h2" text={t.treatments.heading} className="nr__h2" />
        <RevealGroup className="nr__rows" gap={0.05}>
          {t.treatments.items.map((item, i) => (
            // The id is what the menu's dropdown links at. It comes from
            // SERVICES rather than the name, so the anchor is the same ASCII
            // string in both locales and a reader who switches script keeps
            // their place on the page.
            <div
              className={`nr__row ${item.lead ? 'is-lead' : ''}`}
              id={SERVICES[i]}
              key={item.name}
            >
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
                {/* A modality is either a bare string or a `{ name, note }`
                    pair. The English imaging list names each one and says what
                    it is for; the Arabic is still the older flat list, and
                    will render as it always did until it is rewritten. */}
                {item.list && (
                  <ul className="nr__subList">
                    {item.list.map((sub) =>
                      typeof sub === 'string' ? (
                        <li key={sub}>{sub}</li>
                      ) : (
                        <li key={sub.name}>
                          <span className="nr__subName">{sub.name}</span>
                          {sub.note}
                        </li>
                      )
                    )}
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
