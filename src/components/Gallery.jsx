import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Section media, in two modes.
 *
 *  - `inline`  the strip sits in the section. For the clinic showing itself —
 *              the imaging room, the laser equipment. Nothing here is anyone's
 *              medical record, and it earns more trust visible than hidden.
 *  - `dialog`  a button opens the media over the page. For treatment results,
 *              which are photographs of patients: a visitor scrolling past a
 *              section on injectables has not asked to see a stranger's mouth,
 *              and should not be shown one to reach the next heading.
 *
 * Both modes load the same way, and it is the point of the component: a poster
 * and nothing else until the visitor asks. See `Frame` below.
 */

const MEDIA = '/media';

/**
 * Which rendition to fetch, decided at the moment of the click rather than at
 * render — by then we know the viewport, and `connection` has had time to
 * settle on a real reading.
 *
 * `saveData` is a request, not a hint: the visitor has turned on data saving in
 * their browser, and we honour it even on a wide screen.
 *
 * 3G counts as thrifty alongside 2G. `effectiveType` is a measured round-trip
 * estimate, not the radio in the handset, so a desktop on a congested or
 * distant link reports 3g too — which is exactly the visitor the smaller file
 * is for. The 480px rendition is around 40% of the bytes.
 */
const THRIFTY_NET = /(^|-)(2g|3g)$/;

function pick(base) {
  const c = navigator.connection;
  const thrifty = c && (c.saveData || THRIFTY_NET.test(c.effectiveType || ''));
  const small = window.innerWidth < 900;
  return `${MEDIA}/${base}-${thrifty || small ? 'lo' : 'hi'}.mp4`;
}

/**
 * One media cell.
 *
 * A video renders as its poster and a play control, with no `src` at all, so
 * the markup a crawler and a first-paint visitor get costs one small WebP. The
 * source is attached on the first press and never before — `preload="none"`
 * alone would not be enough, since browsers disagree about how much of a
 * sourced video they may fetch anyway.
 */
function Frame({ item, t, eager = false }) {
  const ref = useRef(null);
  const [live, setLive] = useState(false);

  const start = useCallback(() => {
    const el = ref.current;
    if (!el || live) return;
    el.src = pick(item.video);
    setLive(true);
    // No load() here. Assigning src already starts resource selection, and an
    // extra load() resets the element out from under the play() that follows —
    // the clip ends up sourced, sized, and sitting paused at zero. If play() is
    // refused for its own reasons the controls are showing by then, so the
    // visitor's press is never simply lost.
    el.play().catch(() => {});
  }, [item.video, live]);

  if (item.image) {
    return (
      // The cell takes the image's own proportions rather than one fixed ratio.
      // These stills are a mix now — portrait phone captures alongside console
      // shots cropped to a landscape screen — and forcing 3/4 on the latter
      // would slice the ends off the very scan the picture exists to show.
      <figure className="gal__cell" style={{ '--ar': `${item.w} / ${item.h}` }}>
        {/* Real intrinsic dimensions, so the cell holds its height before the
            bytes land and nothing below it jumps.

            Dialog images load eagerly. `lazy` is the right default in the page,
            but inside a dialog that was mounted a frame ago the viewport
            intersection has not been computed yet, and the browser holds the
            fetch — the visitor pressed a button asking for these exact images
            and would be looking at empty boxes. Deferring is already handled by
            not mounting the dialog at all until then. */}
        <img
          src={item.image}
          alt={item.alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          width={item.w}
          height={item.h}
        />
      </figure>
    );
  }

  return (
    <figure className="gal__cell gal__cell--video">
      <video
        ref={ref}
        className="gal__video"
        poster={`${MEDIA}/${item.video}-poster.webp`}
        preload="none"
        playsInline
        controls={live}
        loop
        muted
        aria-label={item.alt}
      />
      {!live && (
        <button type="button" className="gal__play" onClick={start}>
          <span className="gal__playIcon" aria-hidden="true" />
          <span className="vh">{t.play}</span>
          <span className="gal__playNote" aria-hidden="true">{item.alt}</span>
        </button>
      )}
    </figure>
  );
}

export default function Gallery({ gallery, t }) {
  const { mode, items } = gallery;
  const dialogRef = useRef(null);
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const id = useId();

  // Escape and the backdrop both close a native dialog on their own, but only
  // the `close` event tells us it happened — without this the open state drifts
  // out of step with what is on screen, and the media stays mounted.
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const onClose = () => setOpen(false);
    d.addEventListener('close', onClose);
    return () => d.removeEventListener('close', onClose);
  }, [open]);

  // showModal has to run after the node is in the document, which — because the
  // dialog is portalled — is a commit later than the click.
  useEffect(() => {
    const d = dialogRef.current;
    if (open && d && !d.open) d.showModal();
  }, [open]);

  if (mode === 'inline') {
    return (
      <div className={`gal gal--inline gal--n${items.length}`}>
        {items.map((it) => <Frame key={it.video || it.image} item={it} t={t} />)}
      </div>
    );
  }

  // Portalled, and not for tidiness. A `position: fixed` element is positioned
  // against the nearest ancestor carrying a transform, and every treatment row
  // ends its reveal animation holding an identity transform — so a dialog left
  // in place here centres itself inside one row instead of the viewport.
  //
  // The target is the `.nr` root rather than <body>, because the whole palette
  // is declared on `.nr`: portalling all the way out strands the dialog
  // somewhere `--peach` and `--void` do not resolve, and its controls render
  // transparent. `.nr` is high enough to escape the animated row and still
  // inside the scope that gives the tokens meaning.
  const dialog = (
    <dialog ref={dialogRef} className="gal__dialog" aria-labelledby={`${id}-h`}>
      <div className="gal__dialogBar">
        <h4 id={`${id}-h`}>{gallery.title}</h4>
        <button type="button" className="gal__close" onClick={() => dialogRef.current?.close()}>
          <span aria-hidden="true">×</span>
          <span className="vh">{t.close}</span>
        </button>
      </div>
      <div className={`gal gal--dialog gal--n${items.length}`}>
        {items.map((it) => <Frame key={it.video || it.image} item={it} t={t} eager />)}
      </div>
      {gallery.note && <p className="gal__note">{gallery.note}</p>}
    </dialog>
  );

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        className="gal__open"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        {gallery.see ?? t.see}
        <span className="gal__openCount">{items.length}</span>
      </button>

      {/* Rendered only once opened, so nothing in it — not a poster, not an
          image — is fetched by a visitor who never asks to see it. That also
          keeps it out of the prerendered HTML, where there is no `document`
          for the portal to target. */}
      {open && createPortal(dialog, anchorRef.current.closest('.nr') ?? document.body)}
    </>
  );
}
