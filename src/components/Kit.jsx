import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * The centre's equipment, behind a button.
 *
 * Seven devices, each with the clinical reason it is there. Run inline the
 * list is longer than the two paragraphs of the section it belongs to, and it
 * would be read first — so it opens over the page instead, the same bargain
 * the treatment galleries make: nothing is hidden, but nothing is spent on a
 * visitor who did not ask for it.
 *
 * The dialog mechanics are Gallery's, for the same reasons documented there:
 * a native <dialog> so Escape and the backdrop work without our help, the
 * `close` event listened for so state cannot drift out of step with the
 * screen, showModal() a commit after mount, and the whole thing portalled to
 * `.nr` — high enough to escape the reveal animation's transform, which would
 * otherwise centre it inside one paragraph, and still inside the scope that
 * declares the palette.
 */
export default function Kit({ kit, t }) {
  const dialogRef = useRef(null);
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const id = useId();

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const onClose = () => setOpen(false);
    d.addEventListener('close', onClose);
    return () => d.removeEventListener('close', onClose);
  }, [open]);

  useEffect(() => {
    const d = dialogRef.current;
    if (open && d && !d.open) d.showModal();
  }, [open]);

  const dialog = (
    <dialog ref={dialogRef} className="kit__dialog" aria-labelledby={`${id}-h`}>
      <div className="kit__bar">
        <h4 id={`${id}-h`}>{kit.title}</h4>
        <button type="button" className="kit__close" onClick={() => dialogRef.current?.close()}>
          <span aria-hidden="true">×</span>
          <span className="vh">{t.close}</span>
        </button>
      </div>
      <ul className="kit__list">
        {kit.items.map((d) => (
          <li className="kit__item" key={d.name}>
            {/* The dialog is only mounted once the button is pressed, so these
                are already deferred by not existing — `lazy` on top of that
                would hold back the very pictures the press asked for. Real
                dimensions so the row holds its height before the bytes land. */}
            {d.photo && (
              <img
                className="kit__shot"
                src={d.photo}
                alt={d.alt}
                width={d.w}
                height={d.h}
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
    </dialog>
  );

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        className="kit__open"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        {kit.see}
        <span className="kit__count">{kit.items.length}</span>
      </button>

      {/* Mounted only once opened: it keeps the list out of the prerendered
          HTML, where there is no `document` for the portal to target. */}
      {open && createPortal(dialog, anchorRef.current.closest('.nr') ?? document.body)}
    </>
  );
}
