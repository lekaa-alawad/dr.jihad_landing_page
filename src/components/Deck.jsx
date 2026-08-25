import { useEffect, useRef } from 'react';
import { animate, inView } from 'motion';
import { formatNumber } from '../i18n.js';

/**
 * The visitor deck — a fan of photographs that deals itself.
 *
 * Adapted from the CardSwap component in the meridian-expeditions template. The
 * behaviour is the same: the front card drops away, the rest promote forward one
 * slot, and the dropped card returns at the back. Four things had to change to
 * make it belong here, and each is the reason the file is not a straight copy.
 *
 *  - The template drives it with GSAP. Nothing else on this site does, and a
 *    second animation engine is 70 KB of JavaScript for one section. It runs on
 *    `motion`, which is already in the bundle for every other animation on the
 *    page.
 *  - The template deals four cards. This deals nineteen, so the fan is a
 *    *window*: slots are clamped at VISIBLE, and everything deeper waits at the
 *    back slot at zero opacity. Only four elements ever move on a deal.
 *  - Nineteen photographs is half a megabyte. All of them are in the markup —
 *    a crawler and a visitor without JavaScript get the lot — and hydration
 *    parks all but the front card in `data-` attributes, handing them back a
 *    few when the deck is approached and one per deal after that. See `pump`.
 *  - It has controls. Content that moves on its own for longer than five
 *    seconds needs a way to stop it (WCAG 2.2.2), and hovering is not a way a
 *    touch visitor has. Pause, previous and next are real buttons.
 *
 * A leaving card slides out of the deck at full opacity and is cut off by the
 * window it sits in, rather than fading where it stands. Fading meant the
 * photograph on its way out hung half-transparent over the one arriving
 * underneath, and two images at once reads as a dissolve gone wrong, not as a
 * card being dealt. It only turns invisible once it is out of sight, for the
 * journey back to the bottom of the deck.
 *
 * Paint order is left to the 3D scene rather than managed with `z-index`: the
 * container is `preserve-3d`, so the browser sorts the cards by their own
 * translateZ every frame. A card sinking to the back therefore passes behind the
 * fan on the way rather than snapping behind it at some chosen moment.
 */

/** Cards in the fan. Everything past this waits at the back slot, unseen. */
const VISIBLE = 4;
/** The skew every card carries, for depth. */
const SKEW = 4;
/** Milliseconds a card holds the front. */
const DEAL = 3600;
const DUR = 0.85;
const EASE = [0.16, 1, 0.3, 1];
/** Photographs fetched before the first deal — the fan, plus two in hand. */
const PRELOAD = VISIBLE + 2;

/**
 * Where the card in position `i` sits. Positions past the window all resolve to
 * the back slot, so a deep card has nowhere to travel and nothing to animate.
 *
 * The offsets come from the stylesheet — `--deck-dx` and `--deck-dy` on the deck
 * — because the same fan is laid out in CSS for the frames before hydration, and
 * it narrows on a phone. Reading them means there is one set of numbers rather
 * than two that have to be kept equal by hand.
 *
 * `sign` mirrors the fan for RTL: the deck should open away from the text, and
 * under Arabic the text starts on the other side.
 */
const slotter = (dx, dy, sign) => (i) => {
  const d = Math.min(i, VISIBLE - 1);
  return {
    x: d * dx * sign,
    y: -d * dy,
    z: -d * dx * 1.5,
    opacity: i < VISIBLE ? 1 : 0,
    skewY: SKEW * sign,
  };
};

export default function Deck({ shots, t, lang = 'en' }) {
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const pauseRef = useRef(null);
  const countRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    const pauseBtn = pauseRef.current;
    if (!stage) return;

    const nodes = Array.from(stage.querySelectorAll('[data-card]'));
    const total = nodes.length;
    if (!total) return;

    const sign = getComputedStyle(stage).direction === 'rtl' ? -1 : 1;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Measured from the stylesheet, and measured again on resize: the media
    // query that narrows the fan fires when a phone is turned on its side, and
    // a stale offset would leave the cards animating to where they used to sit.
    let slot = slotter(0, 0, sign);
    // Far enough that the card is wholly past the bottom of the window: its own
    // height, plus the sill the window leaves below it for the card's shadow.
    let fall = 0;
    const measure = () => {
      const read = (name) => parseFloat(getComputedStyle(stage).getPropertyValue(name)) || 0;
      slot = slotter(read('--deck-dx'), read('--deck-dy'), sign);
      fall = stage.offsetHeight + read('--deck-sill') + 8;
    };
    measure();

    /*
     * Every photograph is in the served HTML with a real `src`, which is what a
     * crawler indexes and what a visitor without JavaScript sees. Here, at
     * hydration and long before the section is near the fold, every one of them
     * is parked in a `data-` attribute and handed back over time — nothing is
     * fetched until the deck is approached. Nothing about what is published
     * changes; only when it is asked for.
     *
     * `loading="lazy"` cannot do this job. The cards sit in a `preserve-3d`
     * scene, and Chrome does not fetch a lazy image inside one until something
     * else disturbs it — measured here as five cards still unfetched six
     * seconds after the deck was scrolled to and had already dealt twice, which
     * on the page is a card arriving blank and filling in afterwards. The
     * attribute stays for the no-JavaScript path; the queue is what actually
     * decides, and it marks each image eager as it hands it over.
     */
    let loaded = 0;
    nodes.forEach((node) => {
      const img = node.querySelector('img');
      if (!img || !img.getAttribute('src')) return;
      img.dataset.src = img.getAttribute('src');
      img.dataset.srcset = img.getAttribute('srcset') || '';
      img.removeAttribute('srcset');
      img.removeAttribute('src');
    });

    /**
     * Hand one photograph back to the browser, by its index in the deck.
     * Idempotent: a card already handed over has no `data-src` left to read.
     */
    const reveal = (idx) => {
      const img = nodes[idx]?.querySelector('img');
      if (!img?.dataset.src) return;
      img.loading = 'eager';
      if (img.dataset.srcset) img.setAttribute('srcset', img.dataset.srcset);
      img.setAttribute('src', img.dataset.src);
      delete img.dataset.src;
      delete img.dataset.srcset;
    };

    /**
     * Hand back the next `n` photographs in dealing order.
     *
     * `loaded` is a watermark for this queue alone, not a count of what has
     * been fetched: stepping backwards reveals cards from the far end of the
     * deck out of turn, and the walk must not spend one of its `n` on a card
     * that is already in the browser — or the fan would run out of photographs
     * ahead of it by however many the visitor had stepped back through.
     */
    const pump = (n) => {
      while (n > 0 && loaded < total) {
        if (nodes[loaded].querySelector('img')?.dataset.src) n--;
        reveal(loaded);
        loaded++;
      }
    };

    let order = nodes.map((_, i) => i);
    let running = [];

    const play = (el, keyframes, options) => {
      const controls = animate(el, keyframes, options);
      running.push(controls);
      return controls;
    };

    const stamp = () => {
      if (!countRef.current) return;
      countRef.current.textContent = formatNumber(order[0] + 1, lang);
    };

    /*
     * The compositor hint follows the window rather than the source order.
     * Motion writes these transforms from JavaScript, so the cards in play do
     * benefit from a layer — but the ones behind them are perfectly still, and
     * nineteen promoted 400px textures is a lot of GPU memory to hold for a
     * section showing four.
     */
    const hint = () =>
      order.forEach((idx, i) => {
        nodes[idx].style.willChange = i <= VISIBLE ? 'transform, opacity' : '';
      });

    /** Put every card where it belongs, with no transition. */
    const settle = () => {
      hint();
      order.forEach((idx, i) => play(nodes[idx], slot(i), { duration: 0 }));
    };

    /*
     * One deal. `back` is where the leaving card ends up; in a deck this long
     * that slot is invisible, so the card fades out as it falls and never has to
     * fade back in where anyone can see it happen.
     */
    const deal = (animated) => {
      const [front, ...rest] = order;
      order = [...rest, front];
      // A deal lasts 1.6s against a 3.6s clock, so anything still in `running`
      // on an automatic deal has already finished; a control press stops them
      // first. Either way the list starts empty rather than growing all session.
      running = [];

      if (!animated) {
        settle();
      } else {
        const head = slot(0);
        const back = slot(total - 1);
        play(
          nodes[front],
          {
            x: [head.x, head.x, back.x],
            y: [head.y, head.y + fall, back.y],
            z: [head.z, head.z, back.z],
            skewY: head.skewY,
          },
          // One easing per segment: a card that is leaving accelerates away
          // like something dropped, and the long swing back to the bottom of
          // the deck settles instead of arriving.
          { duration: DUR * 1.9, times: [0, 0.5, 1], ease: ['easeIn', EASE] }
        );
        // A second animation, because opacity is not on the same clock as the
        // travel: the card holds full strength for the whole slide and only
        // goes out once the window has swallowed it, so it makes the trip back
        // to the bottom of the deck unseen.
        play(nodes[front], { opacity: [1, 1, 0, back.opacity] }, {
          duration: DUR * 1.9, times: [0, 0.5, 0.52, 1], ease: 'linear',
        });
        // Only the window moves. A card at position VISIBLE or deeper was
        // already at the back slot and is staying there.
        rest.slice(0, VISIBLE).forEach((idx, i) =>
          play(nodes[idx], slot(i), { duration: DUR, delay: DUR * 0.35 + i * 0.07, ease: EASE })
        );
      }

      hint();
      pump(1);
      stamp();
    };

    /** The deal, run backwards: the card at the bottom rises into the front. */
    const undeal = (animated) => {
      const last = order[total - 1];
      order = [last, ...order.slice(0, total - 1)];
      running = [];

      // The card rising into the front comes off the *bottom* of the deck, and
      // the forward queue has never reached it — on the first press that is the
      // last photograph of twenty-three, which arrived with no `src` at all and
      // showed its alt text. It is revealed here, before the rise, rather than
      // by `pump`: the queue hands out the next card in dealing order, which is
      // not the card a visitor stepping backwards is about to be looking at.
      reveal(last);

      if (!animated) {
        settle();
      } else {
        const head = slot(0);
        const back = slot(total - 1);
        play(
          nodes[last],
          {
            x: [back.x, head.x, head.x],
            y: [back.y, head.y + fall, head.y],
            z: [back.z, head.z, head.z],
            skewY: head.skewY,
          },
          // The first segment is travelled unseen, so only the rise is shaped.
          { duration: DUR * 1.9, times: [0, 0.5, 1], ease: ['linear', EASE] }
        );
        // The mirror of the drop: nothing at all until it is under the window,
        // then it slides up into the deck at full strength.
        play(nodes[last], { opacity: [0, 0, 1, 1] }, {
          duration: DUR * 1.9, times: [0, 0.48, 0.5, 1], ease: 'linear',
        });
        order.slice(1, VISIBLE + 1).forEach((idx, i) =>
          play(nodes[idx], slot(i + 1), { duration: DUR, delay: DUR * 0.2 + i * 0.07, ease: EASE })
        );
      }

      hint();
      // A visitor stepping backwards is looking, not waiting: keep one in hand
      // behind them too, so the press after this one has nothing to wait for.
      reveal(order[total - 1]);
      stamp();
    };

    // --- running state ------------------------------------------------------
    // The deck cycles only while it is on screen and not paused. Reduced motion
    // starts paused: the fan is the composition and it stays, but nothing moves
    // until the visitor asks it to.
    let onScreen = false;
    let paused = reduce;
    let timer = 0;

    const sync = () => {
      clearInterval(timer);
      timer = onScreen && !paused ? setInterval(() => deal(true), DEAL) : 0;
      if (pauseBtn) {
        pauseBtn.setAttribute('aria-pressed', String(paused));
        pauseBtn.setAttribute('aria-label', paused ? t.play : t.pause);
        pauseBtn.title = paused ? t.play : t.pause;
      }
    };

    settle();
    stamp();
    sync();

    /*
     * A press interrupts whatever is in flight, and stopping a motion animation
     * freezes the element exactly where it stood. That is the whole reason for
     * the `settle` here: a card caught halfway through its slide stays at the
     * bottom of the window, and the deal that follows only animates the four
     * cards in the new fan — a card now deep in the order is never told to move
     * again, so it sits there, stranded, until the deck happens to reach it.
     * Snapping every card to where it belongs first means each deal starts from
     * the layout it assumes.
     */
    const step = (dir) => {
      running.forEach((c) => c.stop?.());
      running = [];
      settle();
      (dir > 0 ? deal : undeal)(!reduce);
      // Pressing a control restarts the clock, so the card just asked for gets
      // its full turn rather than the remainder of the last one.
      sync();
    };

    const onPrev = () => step(-1);
    const onNext = () => step(1);
    const onPause = () => {
      paused = !paused;
      sync();
    };
    const hold = () => {
      clearInterval(timer);
      timer = 0;
    };
    const release = () => sync();

    stage.addEventListener('pointerenter', hold);
    stage.addEventListener('pointerleave', release);
    stage.addEventListener('focusin', hold);
    stage.addEventListener('focusout', release);

    const root = rootRef.current;
    const prevBtn = root?.querySelector('[data-prev]');
    const nextBtn = root?.querySelector('[data-next]');
    prevBtn?.addEventListener('click', onPrev);
    nextBtn?.addEventListener('click', onNext);
    pauseBtn?.addEventListener('click', onPause);

    const onResize = () => {
      // Same reasoning as `step`: anything mid-flight is measured against the
      // old geometry, so it is stopped and the deck re-laid rather than left to
      // finish travelling to a slot that has moved.
      running.forEach((c) => c.stop?.());
      running = [];
      measure();
      settle();
    };
    window.addEventListener('resize', onResize, { passive: true });

    const unwatch = inView(
      stage,
      () => {
        onScreen = true;
        // The deck is being approached: fill the fan, and keep two in hand.
        pump(PRELOAD);
        // And the one behind the front card, which is the last of the deck and
        // nowhere near the forward queue. `undeal` reveals it too, but only at
        // the press — and it is under the window for barely three quarters of a
        // second before it has to be on screen. One photograph buys the
        // previous button the same readiness the next button has by default.
        reveal(total - 1);
        sync();
        return () => {
          onScreen = false;
          sync();
        };
      },
      { margin: '200px 0px 200px 0px' }
    );

    return () => {
      clearInterval(timer);
      // Stopped, not left running: a live animation goes on writing transforms
      // to nodes that have already left the document.
      running.forEach((c) => c.stop?.());
      unwatch();
      window.removeEventListener('resize', onResize);
      stage.removeEventListener('pointerenter', hold);
      stage.removeEventListener('pointerleave', release);
      stage.removeEventListener('focusin', hold);
      stage.removeEventListener('focusout', release);
      prevBtn?.removeEventListener('click', onPrev);
      nextBtn?.removeEventListener('click', onNext);
      pauseBtn?.removeEventListener('click', onPause);
    };
  }, [shots, t, lang]);

  return (
    <div className="nr__deck" ref={rootRef}>
      <div className="nr__deckClip">
        <div className="nr__deckStage" ref={stageRef}>
          {shots.map((shot) => (
            <figure className="nr__card" data-card="" key={shot.src}>
              <img
                className="nr__cardShot"
                src={shot.src}
                srcSet={`${shot.small} 480w, ${shot.src} 720w`}
                sizes="(min-width: 900px) 400px, 78vw"
                alt={shot.alt}
                width="720"
                height="720"
                /* For the no-JavaScript path only. With JavaScript the queue in
                   the effect takes these over before the browser has reason to
                   act on them; see the note there on why the attribute alone is
                   not enough inside a 3D scene. */
                loading="lazy"
                decoding="async"
              />
            </figure>
          ))}
        </div>
      </div>

      <div className="nr__deckBar" role="group" aria-label={t.controls}>
        <button className="nr__deckBtn" type="button" data-prev aria-label={t.previous} title={t.previous}>
          <span aria-hidden="true">‹</span>
        </button>
        <button className="nr__deckBtn nr__deckBtn--pause" type="button" ref={pauseRef} aria-pressed="false" aria-label={t.pause} title={t.pause}>
          <span aria-hidden="true" />
        </button>
        <button className="nr__deckBtn" type="button" data-next aria-label={t.next} title={t.next}>
          <span aria-hidden="true">›</span>
        </button>
        {/* Three elements rather than one string: see the bidi note on
            .nr__deckNum in noir.css. */}
        <span className="nr__deckNum" dir="ltr" aria-hidden="true">
          <span ref={countRef}>{formatNumber(1, lang)}</span>
          <span>/</span>
          <span>{formatNumber(shots.length, lang)}</span>
        </span>
      </div>
    </div>
  );
}
