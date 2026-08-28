/**
 * The centre's equipment, on the page.
 *
 * Seven devices, each with the clinical reason it is there. It used to open
 * over the page behind a button, on the argument that the list runs longer
 * than the two paragraphs of the section it belongs to and would otherwise be
 * read first. The list is what the section is *for*, though, and a dialog puts
 * it behind a press that only a visitor already convinced would make — so it
 * runs inline now, under its own heading and below the prose it answers.
 *
 * Nothing is deferred by not existing any more, so the photographs are `lazy`
 * — seven renders sit well below the fold of a page whose first screen is two
 * paragraphs, and eagerly fetching them would have every visitor pay for the
 * bottom of the section on the way to the top of it.
 *
 * No state, no portal, no `document`: it renders the same in the prerender as
 * it does in the browser, which is also what puts the seven device names into
 * the HTML a crawler reads.
 */
export default function Kit({ kit }) {
  return (
    <div className="kit">
      <h4 className="kit__title">{kit.title}</h4>
      <ul className="kit__list">
        {kit.items.map((d) => (
          <li className="kit__item" key={d.name}>
            {/* Real dimensions so the row holds its height before the bytes
                land — with the list in the document from first paint, a
                missing box here is seven reflows down the page. */}
            {d.photo && (
              <img
                className="kit__shot"
                src={d.photo}
                alt={d.alt}
                width={d.w}
                height={d.h}
                loading="lazy"
                decoding="async"
              />
            )}
            <div className="kit__body">
              <h5 className="kit__name">
                {d.name}
                {/* A Latin make inside an Arabic line reorders unless it is
                    marked as its own LTR run — the same rule the phone numbers
                    in `reach` are marked by. The span also gives the make its
                    own weight, so it reads as a model number and not as more of
                    the sentence. */}
                {d.model && <span className="kit__model" dir="ltr">{d.model}</span>}
              </h5>
              {/* Two of these carry a second sentence, so `\n` is a paragraph
                  break here as it is in the treatment rows. */}
              {String(d.note).split('\n').map((line, i) => (
                <p className="kit__note" key={i}>{line}</p>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
