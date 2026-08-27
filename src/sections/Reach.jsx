import { SplitWords, RevealGroup, Reveal } from '../components/Kinetic.jsx';
import { dialable, waLink } from '../i18n.js';

/**
 * Address, numbers, hours — kept on the home page rather than given a page.
 *
 * Five rows is a section, not a document, and a `/contact/` carrying only this
 * would be the same empty page the split set out to remove. The nav still says
 * Contact; it points here.
 */
export default function Reach({ t }) {
  return (
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
                    {c.tel ? (
                      <a href={`tel:${dialable(v)}`}>{v}</a>
                    ) : c.href ? (
                      // rel is what stops the opened tab reaching back into
                      // this one through window.opener
                      <a href={c.href} target="_blank" rel="noopener noreferrer">{v}</a>
                    ) : (
                      v
                    )}
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
  );
}
