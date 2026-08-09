import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * The before/after comparison, carried over from the shipped build.
 *
 * One source file stacks the original above the result. The frame is 3:2 and
 * the source 3:4, so `cover` shows exactly half — top crop is the before,
 * bottom crop the after. The clip sits on the outer layer and the 1.1 zoom on
 * the image inside it: the clip keeps the visible join under the handle, and
 * the zoom pushes the source watermark band out of both halves.
 *
 * A full comparison therefore costs one image download.
 *
 * All wording arrives through `t` (strings[lang].cases) — the control itself is
 * direction-agnostic, since the seam runs vertically in both locales.
 */
export default function Seam({ src, id, label = '', theme = '', t }) {
  const frameRef = useRef(null);
  const [pct, setPct] = useState(56);
  const dragging = useRef(false);
  const touched = useRef(false);

  const clamp = (v) => Math.min(90, Math.max(10, v));

  const fromPointer = useCallback((e) => {
    const r = frameRef.current?.getBoundingClientRect();
    if (!r) return;
    setPct(clamp(((e.clientY - r.top) / r.height) * 100));
  }, []);

  // The seam runs vertically, so on touch it competes directly with page
  // scroll. A coarse pointer therefore drags only from the handle, which opts
  // out of scrolling via `touch-action: none`; anywhere else on the frame the
  // swipe belongs to the page. A mouse keeps click-anywhere-to-set, since it
  // has no such conflict.
  const onDown = (e) => {
    if (e.pointerType !== 'mouse' && !e.target.closest('.seam__join')) return;
    e.preventDefault();
    touched.current = true;
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    fromPointer(e);
  };
  const onMove = (e) => dragging.current && fromPointer(e);
  const onUp = (e) => {
    dragging.current = false;
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const onKey = (e) => {
    const rtl = document.documentElement.dir === 'rtl';
    const step = e.shiftKey ? 10 : 4;
    const map = {
      ArrowUp: -step,
      ArrowDown: step,
      ArrowLeft: rtl ? step : -step,
      ArrowRight: rtl ? -step : step,
      PageUp: -10,
      PageDown: 10,
      Home: -100,
      End: 100,
    };
    if (!(e.key in map)) return;
    e.preventDefault();
    touched.current = true;
    setPct((v) => clamp(v + map[e.key]));
  };

  // One nudge on first sight, so the control reads as draggable without a label.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(
      ([en]) => {
        if (!en.isIntersecting) return;
        io.disconnect();
        if (touched.current) return;
        setPct(40);
        const timer = setTimeout(() => !touched.current && setPct(56), 420);
        return () => clearTimeout(timer);
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <figure className={`seam ${theme}`}>
      <div
        ref={frameRef}
        className="seam__frame"
        style={{ '--seam': `${pct}%` }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div className="seam__layer seam__layer--before">
          <img src={src} alt="" className="seam__shot seam__shot--top" loading="lazy" decoding="async" />
        </div>
        <div className="seam__layer seam__layer--after">
          <img src={src} alt="" className="seam__shot seam__shot--bottom" loading="lazy" decoding="async" />
        </div>

        <span className="seam__tag seam__tag--after">{t.after}</span>
        <span className="seam__tag seam__tag--before">{t.before}</span>
        <img className="seam__stamp" src="/img/mark.png" alt="" width="240" height="240" />

        <div
          className="seam__join"
          role="slider"
          tabIndex={0}
          aria-orientation="vertical"
          aria-valuemin={10}
          aria-valuemax={90}
          aria-valuenow={Math.round(pct)}
          aria-valuetext={`${Math.round(pct)}% ${t.shown}`}
          aria-label={`${t.caseWord} ${id} — ${t.handle}`}
          onKeyDown={onKey}
        >
          <span className="seam__grip" aria-hidden="true" />
        </div>
      </div>

      <figcaption className="seam__cap">
        <span className="seam__num">
          {t.caseWord} {id}
        </span>
        {label && <span className="seam__label">{label}</span>}
        <span className="vh">
          {t.caseWord} {id}: {t.compare}
        </span>
      </figcaption>
    </figure>
  );
}
