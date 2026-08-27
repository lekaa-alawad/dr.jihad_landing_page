import { SplitWords, Reveal } from '../components/Kinetic.jsx';
import Deck from '../components/Deck.jsx';
import Sub from './Sub.jsx';

/**
 * The people, before the credentials — the one argument on the site the clinic
 * did not have to write.
 *
 * Twenty-three shots is 744KB, which would be a lot to put on the entry page if
 * it arrived at once. Deck runs its own loader and marks each image eager only
 * as it hands the card over, so what the home page actually pays for is the
 * visible few.
 */
export default function Visitors({ t, lang }) {
  return (
    <section className="nr__section nr__section--rule" id="visitors">
      <div className="nr__wrap nr__visitors">
        <div>
          <SplitWords as="h2" text={t.visitors.heading} className="nr__h2 nr__h2--sm" />
          <Reveal><Sub text={t.visitors.sub} /></Reveal>
        </div>
        <Reveal>
          <Deck shots={t.visitors.shots} t={t.visitors} lang={lang} />
        </Reveal>
      </div>
    </section>
  );
}
