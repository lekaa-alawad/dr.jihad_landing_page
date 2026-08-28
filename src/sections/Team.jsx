import { SplitWords, Reveal, RevealGroup } from '../components/Kinetic.jsx';
import Sub from './Sub.jsx';

/**
 * The six doctors — the top of the About page, ahead of the centre's own
 * words.
 *
 * They lead because a visitor asking who runs this place is asking about
 * people, and the faces answer that before a paragraph can. No rule above it:
 * it is the first section on the page, and there is nothing up there to be
 * separated from.
 */
export default function Team({ t }) {
  return (
    <section className="nr__section" id="team">
      <div className="nr__wrap">
        <SplitWords as="h2" text={t.team.heading} className="nr__h2 nr__h2--sm" />
        <Reveal><Sub text={t.team.sub} /></Reveal>
        <RevealGroup className="nr__team" gap={0.07} kind="scale">
          {t.team.members.map((m) => (
            <article className="nr__doc" key={m.name}>
              {/* Portraits are the one thing here a visitor reads before any
                  of the words, so the cell holds its 9:16 from first paint —
                  the placeholders and the real photographs share it. */}
              <img
                className="nr__docShot"
                src={m.photo}
                alt=""
                loading="lazy"
                decoding="async"
                width="900"
                height="1600"
              />
              <h3 className="nr__docName">{m.name}</h3>
              {/* All three are optional, and a confirmed entry is why. The
                  five invented members carry a role and a biography because
                  both were written to fill the card; the one real member
                  carries the credential line the clinic supplied and no
                  biography, because none was supplied. An empty <p> in its
                  place would leave the card's own spacing describing a
                  sentence that is not there. */}
              {m.role && <p className="nr__docRole">{m.role}</p>}
              {m.credential && <p className="nr__docCred">{m.credential}</p>}
              {m.bio && <p className="nr__docBio">{m.bio}</p>}
            </article>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
