# Jihad Dental Care — live

The chosen direction (Option 4, "Noir"), extracted from the review harness into
a standalone site. This is the folder to work in from here.

## Run

```bash
npm install     # once
npm run dev     # http://localhost:5190
npm run build   # -> dist/
```

## Where it came from

Noir was variant 4 inside `../dr.jidad preview`, where it shared modules with
the three other directions. Extracting it meant copying those shared modules in
and repointing the imports — nothing was rewritten, so what you see here is what
was reviewed.

| Here | Came from |
|---|---|
| `src/Noir.jsx` | `src/variants/Noir.jsx` |
| `src/noir.css` | `src/variants/noir.css` |
| `src/base.css` | shared — seam, kinetic text, reveal |
| `src/data.js` | shared — the single source of product truth |
| `src/components/Seam.jsx` | shared before/after control |
| `src/components/Kinetic.jsx` | shared SplitLines, SplitWords, Reveal |

`public/` carries only the 9 files Noir actually references — 7 images and the
2 fonts. The harness shipped 8 fonts and 10 images because the other three
directions needed them.

The harness and the old Astro build are untouched in `../dr.jidad preview` and
`../dr.jihad`, still deployed, if anything needs checking against them.

## Rules this build keeps

- **Nothing is invented.** No fabricated doctors, testimonials, or figures.
  Every unconfirmed fact renders as a visible `To confirm` chip.
- **The seam is shared.** One source image per case, cropped exactly in half by
  a 3:2 frame. A full before/after costs one download.
- **Reveals degrade to visible.** Every animation resolves to opacity 1, and the
  failsafe sweep in `main.jsx` catches anything a failed reveal left hidden.
  `.reveal` is only hidden under `html.js`, so no-JS never gets a blank page.
- `prefers-reduced-motion` is honoured.

## Known gaps

- **English only.** The Astro build in `../dr.jihad` was bilingual with real RTL;
  this direction was built as an English-only comparison piece, so Arabic and
  RTL are not carried over.
- **Client-rendered.** A crawler gets an empty `#root` until the bundle runs,
  unlike the static Astro build.
- **Hero at phone width:** the second button collides with the treatments band
  below it — see the note in the handover.
