# Media

Everything in `public/media/` is generated from the clinic's originals in
`../dr.jihad/assets/` by `scripts/media.sh`. The originals are not in this
repository. Re-run the script after adding or replacing any source file:

```sh
bash scripts/media.sh    # needs ffmpeg, cwebp, and macOS for sips and swift
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
| `clinic visitors/*.jpg,jpeg,JPG` | Visitors | → `visitor-{01..23}{,-sm}.webp`, all twenty-three in the deck |
| `Sans titre 6.pdf` | Orthodontics | 10 pages → `ortho-{before,after}-0{1..5}.webp` |
| `Untitled.pdf` | Orthodontics | 3 pages → `ortho-close-0{1..3}.webp` |
| `IMG_{0130,1783,2832,3436,9063}.HEIC`, `IMG_{0545,1411}.JPG.jpeg` | Children's dentistry | → `kids-0{1..7}.webp` |
| `5 (2).jpg` | The team | → `public/img/team/doctor-01.webp` (**not** `public/media`) |
| `1.psd.jpg` | The team | → `public/img/team/doctor-02.webp` |
| `3.psd.jpg` | The team | → `public/img/team/doctor-03.webp` |
| `2.psd.jpg` | The team | → `public/img/team/doctor-04.webp` |
| `IMG_71{57,60,61,62,63,64,65,70,72,73,74}.PNG`, `IMG_328{9}.PNG` | Equipment | 7 of 14 chosen → `kit-*.webp` |
| `IMG_0432.JPG.jpeg` → `esmail-card.jpg` | The team | composited into a card, then → `doctor-05.webp` |

### The visitor numbering

The clinic numbered these itself, and the deck follows that numbering as far as
it goes. Five files sit outside it and are placed by hand, so **from position 9
down, a card's place in the deck is no longer the number on its file**. The order
is decided by the `VISITORS` array in `scripts/media.sh` and mirrored by
`VISITOR_KINDS` in `src/i18n.js` — the two are one list kept in two places and
neither can be reordered alone.

- **Two files are numbered 8.** `8.jpeg` is a phone export, `8.JPG` a full-frame
  camera capture, and they are photographs of different people. Both are kept:
  the phone export holds position 8, the camera frame follows.
- **`99.jpg` and `122.jpg` were supplied later**, and the clinic asked for them
  at positions 9 and 10 — which is what pushed `8.JPG` and everything after it
  two places back.
- **Three files carry no position at all.** `23424.jpg`, the close-up of a
  finished smile, then `DSC06550.jpg` and `773A8850.jpg`. They are appended in
  the order the clinic supplied them, at 21, 22 and 23. The last two are 33 MB
  and 14 MB straight off a full-frame body; the pipeline takes each to about
  30 KB, which is why the visitors step is no longer instant.

Each is cropped to a square and delivered at two widths, 720 and 480, because
the deck's card is square and a browser cropping in CSS still downloads the
pixels it discards. Twenty-three files at the larger width is about 770 KB; the
page loads six of them when the deck is approached and one more per deal, so a
visitor who scrolls past sees a fraction of that.

Nothing was supplied for the other six departments — cosmetic dentistry,
implants, endodontics, orthodontics, children's dentistry and dental laser. Those
sections have no gallery, because there is nothing to put in one.

## The orthodontic sets, and why a PDF is involved

Both orthodontic sources arrived as PDFs. Neither is a document — each is a
camera roll wrapped one photograph per page, which is what a phone or a Mac
produces when someone chooses "print to PDF" over sending a folder of images.

`scripts/pdf-images.swift` lifts the embedded image objects out at their native
resolution rather than rendering the pages. Rendering would resample a picture
that has already been resampled once, and there is nothing on those pages worth
keeping except the photograph. The clinic's exports are Flate-encoded 16-bit
RGB, so the script reads the geometry out of each image dictionary and wraps the
raw buffer by hand; a DCT-encoded PDF would hand back a JPEG and skip that path.
It is macOS-only, like the `sips` calls already in `media.sh`, and needs only the
Command Line Tools.

`Sans titre 6.pdf` is **one patient**, the five standard intraoral views
photographed twice — before treatment on pages 1–5, after on pages 6–10, in the
same order both times. They are iPhone *screenshots*, so each 1179×2556 page is
mostly black letterbox with the photograph as a band across the middle. The
crops in `media.sh` are that band, found by scanning each page for its first and
last non-black row.

Each before/after pair is cropped to the **shorter** of its two bands, centred
in its own. The page sets a pair side by side, and two cells of different
heights read as a mistake rather than as a comparison; the teeth sit mid-frame
in all ten, so the rows given up are gum.

`Untitled.pdf` is a **different patient** and a different camera — three
close-range lateral views, no letterbox and no crop. They are kept under their
own heading in the dialog and the copy says so in both locales. Run into the
before/after grid they would read as more of the first case, which would be a
claim about someone's treatment that the photographs do not support. Whether the
third of them is the result of the first two is not recorded anywhere, and was
not guessed at.

## The children's set

Seven photographs of the paediatric dentist with her patients, taken around the
clinic — the yellow treatment room, the imaging corridor, the sign in reception.

They are whole frames. Nothing is cropped and no face is obscured, because a
child who is plainly not frightened is the thing the set exists to show, and a
blurred face would say the opposite. That decision is also why these carry the
longest consent note on the site — see below, and see `scripts/predeploy.mjs`,
which names them before every deploy.

HEIC and JPEG mixed, and every file carries an EXIF orientation tag. `sips` is
what applies it: ffmpeg reads the tag and leaves the pixels on their side, so a
straight ffmpeg pass lays four of these on their ninety. Going through `sips`
first also decodes the HEIC, which no ffmpeg build here can open, and hands the
rest of the chain an upright PNG that needs no special handling.

Each is fitted inside a 1200px box rather than scaled to a fixed width. The set
is six portraits and one landscape, and a fixed width would make a portrait
1955px tall to be shown in a gallery cell a fraction of that.

The dentist's name is legible on the scrubs in `kids-06` and `kids-07`: she is
Dr. Bushra Shamma, and she is now named — and pictured — in the team section
too. She was not when this set was first processed: the page carried an invented
paediatric dentist beside her own photograph, which is what the PLACEHOLDER
entry in `predeploy.mjs` exists to stop going unnoticed.

The alt sentences call her "the paediatric dentist" rather than naming her.
That was written when the page could not name her; it can now, and naming her
would be the better sentence for anyone reading with a screen reader.

## The equipment photographs

Seven pictures, one per device in the kit dialog. The clinic supplied fourteen —
a pair per device — and the dark one is used every time. Not a matter of taste:
the dialog is `#14100e`, and a manufacturer cut-out on white punches a lit
rectangle through it. The dark set also shares one warm key light, so seven of
them in a column read as one set rather than seven stock images.

Two pairs were not a with/without pair at all:

- **hair** — `IMG_7155` is a **screenshot of texaslaseracademy.com**, that site's
  chrome and URL still in frame. It is not the clinic's to publish and is not
  used; `IMG_7160` is the clean render and is what ships.
- **imaging** — both are dark studio shots. `IMG_3289` keeps the cephalometric
  arm in frame, and cephalometric imaging is one of the six modalities the page
  lists, so it is the honest one of the two.

720px wide, which covers the 210px column they render in at 2×, and nothing
more. Together they are about 240 KB, and none of it is fetched by a visitor who
never presses the button — the dialog is not mounted until then.

### Where these came from

They are manufacturer or stock product renders, not photographs of the units
standing in this clinic. Every other picture on the site is the clinic's own.
That one of the fourteen arrived as a screenshot of another company's website is
evidence that at least part of this set was collected from the web rather than
licensed, and a stock render is somebody's copyright even when it is a render of
a device you own. Nothing here evidences a licence to publish them.

This is the clinic's call, not this repository's — using manufacturer imagery for
equipment is ordinary practice and is often permitted by the maker — but it has
not been checked, so `scripts/predeploy.mjs` says so before every deploy. The
fix, if it is ever wanted, is the easy one: photograph the seven units in the
clinic, which is also the more honest picture.

## The team portraits

`doctor-01.webp` through `doctor-05.webp` are the real faces in the team
section — the sixth doctor has no card yet —
and the only outputs of `media.sh` that do not land in `public/media/`. The cards
read from `/img/team/`, where `scripts/team-placeholders.mjs` writes the
monograms, and a real portrait replaces one at the same path as `.webp`.

A card's `photo` is `doctor-0N.webp` for its own position N in `team.members`,
so the `PORTRAITS` table in `media.sh`, the `INITIALS` list in
`team-placeholders.mjs` and the member order in `src/i18n.js` are three views of
one ordering and are edited together.

The section shipped with six invented dentists and they were replaced one at a
time, in the order the clinic supplied real ones. Each time, the invented entry
whose discipline the real doctor covered was **deleted** rather than shuffled
down — a fabricated specialist standing next to the real one on the same row is
worse than one fewer card. All six are now real people.

A confirmed name can arrive before its portrait does, and `team.members` holds
that state: the card keeps `doctor-0N.svg` until the file lands, so it shows a
monogram under a real name rather than a broken image or an invented one. That
is where Dr. Haidara Habib stands, and `predeploy.mjs` names him until it
changes. It is the safer failure of the two — the page is missing something
rather than asserting something false — but it is still a real person appearing
on his employer's site without a face, so it should not sit there long. The count stays at six either way, which
is what `record` states.

Each supplied file is a 1080×1920 social card — the practice logo, the doctor's
name and a strapline across the top quarter, the portrait below. **It is kept
whole.** An earlier pass cropped the header away to fit the 3:4 the cards used
to reserve; that threw out the clinic's own framing of its own founder to
satisfy a ratio we had picked ourselves while every portrait was still a
monogram. The section now reserves **9:16**, `scripts/team-placeholders.mjs`
draws the remaining five at the same ratio so a row of cards still lines up, and
nothing is cut.

If the other five arrive in this same social-card format — which is likely, as
it is how the clinic publishes them — they drop straight in. One that arrives as
an ordinary portrait will be cropped to 9:16 by `object-fit: cover`, the same
way anything off-ratio was cropped before.

The beige studio ground is kept. Cutting the figure out and setting it on the
page's dark would be inventing a photograph nobody took, and this is the
clinic's own backdrop — the other five, when they come, will likely be shot on
it too.

The entry carries **no biography**. The clinic sent a name, a qualification and
a picture; a sentence of character written to fill the card would be a fiction
about a real, named, identifiable person, which is the one thing the rest of
that section is already flagged for. `Noir.jsx` renders `role`, `credential` and
`bio` only when present, so a short card is a supported state rather than a gap.

### The composited card

Four of the five confirmed doctors arrived as finished studio cards. Dr. Esmail
Mousa did not — the clinic had only a photograph of him taken in a dim room
strung with warm lights, against a wall of bokeh. `scripts/card-composite.mjs`
puts him on the same card as everyone else, and `scripts/segment.swift` and
`scripts/render-text.swift` are the two pieces it leans on.

Its output is written back beside the clinic's originals as `esmail-card.jpg`
and treated as a source from then on, so an ordinary `media.sh` run needs
neither macOS Vision nor a font download. Rebuild it with:

```sh
node scripts/card-composite.mjs "../dr.jihad/assets/esmail-card.jpg"
```

Four things in it were measured off the real cards rather than judged by eye,
and each is there because the obvious version looked wrong:

**The ground repeats every 146.875px, not 147.** A lag scan over a column of
clear background puts minima at 146.75 and 293.75, and only that period fits
both. An integer period walks out of phase over thirteen rows and leaves seams.
Row 0 of every card is also a black scan line; tiled, it reappears thirteen
times down the plate, which is what the first attempt looked like.

**The shading is the card's own.** The subject on the reference card clears both
edge columns at every row, so the falloff toward the bottom is read straight off
them and laid back onto the tiled pattern. Nothing models a vignette.

**He is scaled by head size, not by how much frame he fills.** He was shot
further back, so matching the silhouette's height gave him a visibly smaller
head than everyone else on the row. Head width is taken from Dr. Jihad's card,
the other short-haired subject — the women's silhouettes include hair volume and
read about 15% wider at the same head size.

**The colour is fitted twice and blended by luminance** — once on skin, once on
the charcoal uniform every one of them wears. Fitting once on the whole figure
matched the distributions and still left his face darker than theirs; fitting on
skin alone turned the charcoal brown. An earlier pass matched the full histogram
and was worse than either: his source is dark and low-contrast, so stretching it
to their spread opened gaps and his face came out blotchy.

The type was chosen by rendering four candidates per script and scoring their
shapes against the ink on a reference card, then calibrating each on a string
that card already carries. **Poppins SemiBold at −0.0291em** reproduces
`Dr. Leen Barakat` at 568px against the card's 568px — untracked it runs 600.
**Tajawal Medium** was the best of four for the Arabic and still lands 3.6%
wide, which is taken out of the horizontal scale rather than letter-spacing,
which would break the joins.

If the clinic ever supplies a real card for him, drop it in place of
`esmail-card.jpg` and nothing else changes.

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

`visitor-*.webp` is twenty-three identifiable faces, published at full size and with
no crop that obscures anyone. Several are evidently public figures photographed
with Dr. Jihad; several others are patients. Written consent to publish is the
clinic's responsibility and has not been evidenced to this repository. These are
the most exposed photographs on the site — a face on a marketing page is a claim
that the person endorses the practice — and any withdrawal means deleting the
file, removing its entry from `VISITOR_KINDS` in `src/i18n.js`, and re-running
`scripts/media.sh` so the numbering closes up.

`kids-0{1..7}.webp` is the most exposed set on the site. Nine identifiable
children and one teenager, faces in frame, published at full size and uncropped.
Children cannot consent for themselves; their guardians do, and nothing in this
repository evidences that the clinic holds that consent in writing for any of
the ten. It is named in `scripts/predeploy.mjs` so a deploy cannot happen
without someone reading it.

A withdrawal — or a guardian who was never asked — means deleting the file and
removing its entry from the children's gallery in `src/i18n.js`, in **both**
locales. Nothing in the page hides a face, and nothing should be made to: if a
photograph cannot be published, it comes off, it is not masked.

`ortho-*.webp` is thirteen intraoral photographs of two patients. No face is in
frame — the widest of them reaches the upper lip and a little of the nose — so
they are far less identifying than `visitor-*.webp`, but they are still clinical
photographs of named individuals in the clinic's records, and the before/after
pairing is a statement about a course of treatment. Written consent to publish
is the clinic's responsibility and has not been evidenced to this repository. A
withdrawal means deleting the files and removing the `gallery` block from the
orthodontics item in `src/i18n.js`, in **both** locales.

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
