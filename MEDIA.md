# Media

Everything in `public/media/` is generated from the clinic's originals in
`../dr.jihad/assets/` by `scripts/media.sh`. The originals are not in this
repository. Re-run the script after adding or replacing any source file:

```sh
bash scripts/media.sh    # needs ffmpeg, sips (macOS) and cwebp
```

## What the clinic supplied, and what happened to it

| Source | Section | Outcome |
| --- | --- | --- |
| `xray device/IMG_3193.MOV` | Radiographic imaging | Full 19.2s → `xray-room-{hi,lo}.mp4` |
| `xray device/IMG_319*.HEIC` | Radiographic imaging | **Superseded** by the reshoot; no longer generated |
| `xray device/new images/*.jpeg` | Radiographic imaging | → `console-0{1..5}.webp`, all five on the page |
| `botox/IMG_8672–8675.jpeg` | Injectables | → `filler-0{1..4}.webp` |
| `laser/IMG_6335.MOV` | Skin laser | → `laser-face-{hi,lo}.mp4` |
| `laser/IMG_7889.MOV` | Skin laser | → `laser-hair-{hi,lo}.mp4` |

Nothing was supplied for the other six departments — cosmetic dentistry,
implants, endodontics, orthodontics, children's dentistry and dental laser. Those
sections have no gallery, because there is nothing to put in one.

## The named photographs

Two of the console shots — `console-01.webp` and `console-05.webp` — show a
patient's name legible across the machine's title bar, above that patient's own
scan. The clinic has confirmed it holds that patient's consent, and both are
published.

If that consent is ever withdrawn, the name must be removed from the pixels and
the files regenerated. Masking it with an overlay in the page does nothing: the
image can be opened directly.

## Why the videos are shaped the way they are

All three clips were shot with the phone upright and carry a `-90` rotation flag,
so the delivered frame is portrait. Scaling is therefore by **width**: a
height-based scale treats "1080" as the long edge and leaves 608px across.

Two renditions per clip, 720px and 480px wide, both H.264 — the one codec that
plays everywhere without a fallback. `Gallery.jsx` picks between them at the
moment of the press, using viewport width and `navigator.connection`, and honours
`saveData` even on a wide screen.

The originals total 162 MB. The delivered set is about 11 MB, and a visitor who
never presses play downloads none of it — only a poster, and only for the one
inline gallery.

## Consent

`filler-0*.webp`, `laser-face-*.mp4` and the frames of `laser-hair-*.mp4` are
photographs and footage of identifiable people — patients and staff. Written
consent to publish is the clinic's responsibility and has not been evidenced to
this repository. `filler-01` in particular carries a necklace and a facial mark
that make it identifying despite the crop.

## The font preview

`preview/` holds the Arabic type comparison, served at
<http://localhost:5190/font-preview> by a dev-only plugin in `vite.config.js`.

It is deliberately **not** in `public/`. Anything there is copied verbatim into
`dist/`, and several candidate faces are licensed for nothing at all — KO Okies
states in its own copyright string that it is a paid typeface. Keeping the
preview outside `public/` means a deploy cannot publish them even if the folder
is never cleaned up. `preview/fonts/` is gitignored.

Add candidates by dropping `.ttf`/`.otf` into `fonts-inbox/` and running
`bash scripts/fonts.sh`.
