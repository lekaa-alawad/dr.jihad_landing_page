#!/bin/bash
# Turns the clinic's camera-roll originals into what the site can actually serve.
#
# The originals are iPhone captures: HEIC stills no browser reliably decodes, and
# HEVC .MOV clips at up to 4K60 — 121 MB for nineteen seconds. Nothing here is a
# creative decision; it is the format and bitrate work needed before any of it
# can be put on a page. Re-runnable: every output is overwritten in place.
#
# Two renditions per clip — 720px and 480px across, both H.264. Not because
# H.264 is the best codec available, but because it is the one that plays
# everywhere without a fallback, and a clinic's visitors are not a population to
# experiment on. The page picks between the two by viewport and connection, and
# loads neither until the visitor asks — see the poster handling in Gallery.jsx.
set -euo pipefail

SRC="/Users/lekaa/work files/dr.jihad/assets"
OUT="/Users/lekaa/work files/dr.jihad live/public/media"
mkdir -p "$OUT"

# -movflags +faststart puts the index at the head of the file, so playback can
# begin on the first packets instead of after the whole download. On a slow
# connection this is the difference between "plays" and "spins".
# All three clips were shot with the phone upright and carry a -90 rotation, so
# ffmpeg hands us a portrait frame. Scaling is therefore by WIDTH: a height-based
# scale reads "1080" as the long edge and leaves only 608px across, which is the
# one dimension a portrait video can least afford to lose.
enc() {
  local in="$1" out="$2" w="$3" crf="$4" trim="${5:-}"
  # shellcheck disable=SC2086
  ffmpeg -v error -y ${trim} -i "$in" \
    -vf "scale=${w}:-2:flags=lanczos" \
    -c:v libx264 -profile:v high -preset slow -crf "$crf" \
    -pix_fmt yuv420p -movflags +faststart \
    -an "$out"
}

# --- x-ray room walkthrough ------------------------------------------------
# Full length, all 19.25s. An earlier pass cut this to 10s on the grounds that
# the tail was black frames; blackdetect finds none — the last stretch is dim
# footage of the room, not blank, and the clinic wants it kept.
echo "xray video..."
enc "$SRC/xray device/IMG_3193.MOV" "$OUT/xray-room-hi.mp4" 720 23
enc "$SRC/xray device/IMG_3193.MOV" "$OUT/xray-room-lo.mp4" 480 25

# --- skin laser, facial treatment -----------------------------------------
echo "laser face video..."
enc "$SRC/laser/IMG_6335.MOV" "$OUT/laser-face-hi.mp4" 720 24
enc "$SRC/laser/IMG_6335.MOV" "$OUT/laser-face-lo.mp4" 480 26

# --- skin laser, hair removal ---------------------------------------------
echo "laser hair video..."
enc "$SRC/laser/IMG_7889.MOV" "$OUT/laser-hair-hi.mp4" 720 23
enc "$SRC/laser/IMG_7889.MOV" "$OUT/laser-hair-lo.mp4" 480 25

# --- posters ---------------------------------------------------------------
# The frame a visitor sees before pressing play, and on a slow connection the
# only frame they may see for a while — so each is picked by hand rather than
# taken from t=0, which in two of the three clips is a wall.
echo "posters..."
poster() {
  local tmp="$OUT/.tmp-poster.png"
  ffmpeg -v error -y -ss "$2" -i "$1" -frames:v 1 \
    -vf "scale=760:-2:flags=lanczos" "$tmp"
  cwebp -quiet -q 80 -metadata none "$tmp" -o "$3"
  rm -f "$tmp"
}
poster "$SRC/xray device/IMG_3193.MOV" 9.0  "$OUT/xray-room-poster.webp"
poster "$SRC/laser/IMG_6335.MOV"       2.0  "$OUT/laser-face-poster.webp"
poster "$SRC/laser/IMG_7889.MOV"       1.0  "$OUT/laser-hair-poster.webp"

# --- stills -----------------------------------------------------------------
# -map_metadata -1 is not housekeeping. These come off a phone that was in the
# treatment room, so the EXIF carries a GPS fix and a capture timestamp for each
# one; publishing that alongside a patient's photograph would leak where and
# when they were treated. The pixels are the only part that ships.
# Needs cwebp (brew install webp) — this ffmpeg build has no libwebp encoder.
echo "stills..."
# $4 is an optional crop, applied after the scale and expressed against the
# scaled frame — so the numbers stay valid as long as $3 does.
still() {
  local tmp="$OUT/.tmp-resize.png"
  local vf="scale=${3}:-2:flags=lanczos"
  [ -n "${4:-}" ] && vf="$vf,crop=$4"
  ffmpeg -v error -y -i "$1" -map_metadata -1 -vf "$vf" "$tmp"
  cwebp -quiet -q 84 -metadata none "$tmp" -o "$2"
  rm -f "$tmp"
}

# Lip filler results. Portrait phone captures, so width is the constraint.
i=1
for f in "$SRC"/botox/IMG_867*.jpeg; do
  still "$f" "$OUT/filler-0$i.webp" 1100
  i=$((i + 1))
done

# The CS 9300 console, original captures. Superseded by the reshoot below and
# no longer used on the page, so they are not generated — the clinic supplied
# straight-on versions of the same six screens. Kept documented rather than
# deleted because these are the only copies that show the room around the unit.
# To bring one back, restore this loop and add the file to src/i18n.js.
#
#   crop_of() { case "$1" in 3194) echo "1060:660:20:430";; 3197) echo "1040:640:30:440";; *) echo "";; esac; }
#   for n in 3194 3195 3197 3198 3199 3200; do
#     sips -s format png "$SRC/xray device/IMG_$n.HEIC" --out "$OUT/.tmp-$n.png" >/dev/null
#     still "$OUT/.tmp-$n.png" "$OUT/console-$n.webp" 1100 "$(crop_of "$n")"
#     rm -f "$OUT/.tmp-$n.png"
#   done

# The console reshoot — the set that actually goes on the page.
#
# Same six screens as above, photographed straight-on with the display filling
# the frame instead of adrift in an unlit room, so no crop is needed and none is
# applied. Sizes vary and three are portrait, so this fits each inside a 1200px
# box rather than forcing a width; the min() on either axis is what stops a
# source smaller than the box being upscaled into softness.
# The 4th file — the temporomandibular-joint programme screen — is skipped: the
# clinic asked for it off the page, and generating it anyway would ship 216 KB
# nothing references. Drop the `continue` and re-add the item to src/i18n.js to
# bring it back.
echo "console reshoot..."
i=1
for f in "$SRC/xray device/new images"/*.jpeg; do
  if [ "$i" = 4 ]; then i=$((i + 1)); continue; fi
  ffmpeg -v error -y -i "$f" -map_metadata -1 \
    -vf "scale='min(1200,iw)':'min(1200,ih)':force_original_aspect_ratio=decrease:flags=lanczos" \
    "$OUT/.tmp-console.png"
  cwebp -quiet -q 84 -metadata none "$OUT/.tmp-console.png" -o "$OUT/console-0$i.webp"
  rm -f "$OUT/.tmp-console.png"
  i=$((i + 1))
done


# --- clinic visitors --------------------------------------------------------
# The wall of people who have come through the door, dealt as a card deck in
# the page. Three things about this set decide how it is processed:
#
#  - The order is the clinic's own numbering, but three files sit outside it and
#    are placed by hand. Two originals are both numbered 8 — a phone export and
#    a full-frame camera capture, of different people — and both are kept, the
#    phone one at 8 and the camera one after it. `99.jpg` and `122.jpg` were
#    supplied later and the clinic asked for them at 9 and 10. Three files carry
#    no position at all — `23424.jpg`, then `DSC06550.jpg` and `773A8850.jpg` —
#    and are appended in the order they were supplied. So from 9 onward a card's
#    position is no longer the number on its file, and this array is the only
#    place that knows the mapping — VISITOR_KINDS in src/i18n.js indexes into
#    the same order and must be edited with it.
#
#    The last two are 33 MB and 14 MB straight off a full-frame body. Nothing in
#    the pipeline needs to change for them — the crop and scale take each to
#    around 30 KB — but they are why this step is no longer instant.
#  - Orientation is mixed: three landscape, five portrait, the rest square. The
#    deck is a square card, so each is cropped to 1:1 here rather than left to
#    object-fit — a browser cropping in CSS still downloads the pixels it throws
#    away, and across twenty-three files that is the whole budget.
#  - The crop is biased a quarter of the way down the excess, not centred. In a
#    portrait photograph of a standing person, centring takes the head off.
#
# Two widths, 720 and 480, and the page's `srcset` picks. A phone at 2x asks for
# the 720; a laptop at 1x, where the card is 440px across, takes the 480 and
# saves half the bytes.
echo "visitors..."
VISITORS=(1.jpg 2.jpeg 3.jpg 4.jpeg 5.JPG 6.jpeg 7.jpg 8.jpeg 99.jpg 122.jpg \
          8.JPG 9.JPG 10.JPG 11.jpg 12.jpg 13.jpg 14.jpeg 15.jpeg 16.jpeg 17.jpg \
          23424.jpg DSC06550.jpg 773A8850.jpg)

square() {
  local in="$1" out="$2" w="$3" tmp="$OUT/.tmp-visitor.png"
  ffmpeg -v error -y -i "$in" -map_metadata -1 \
    -vf "crop='min(iw,ih)':'min(iw,ih)':'(iw-min(iw,ih))/2':'(ih-min(iw,ih))*0.25',scale=${w}:${w}:flags=lanczos" \
    -frames:v 1 "$tmp"
  cwebp -quiet -q 74 -metadata none "$tmp" -o "$out"
  rm -f "$tmp"
}

i=1
for name in "${VISITORS[@]}"; do
  n=$(printf %02d $i)
  square "$SRC/clinic visitors/$name" "$OUT/visitor-$n.webp"    720
  square "$SRC/clinic visitors/$name" "$OUT/visitor-$n-sm.webp" 480
  i=$((i + 1))
done

# --- orthodontics -----------------------------------------------------------
# Two orthodontic sets, both supplied as PDFs. A PDF is only a wrapper here —
# one photograph per page, no text — so scripts/pdf-images.swift lifts the
# embedded image objects out at native resolution rather than rendering the
# pages, which would resample an already-resampled picture.
#
# `Sans titre 6.pdf` is one patient's full five-view series photographed twice,
# before treatment on pages 1-5 and after on pages 6-10, in the same order both
# times: frontal bite, right lateral, left lateral, upper occlusal, lower
# occlusal. They are iPhone *screenshots*, so each 1179x2556 page is mostly
# black letterbox with the photograph as a band across the middle — the crops
# below are that band, found by scanning for the first and last non-black row.
#
# Each before/after pair is cropped to the SHORTER of the two bands, centred in
# its own. The page lays a pair side by side, and two cells of different heights
# read as a mistake rather than as a comparison; taking a few rows of gum off
# the taller one costs nothing, since the teeth sit mid-frame in all ten.
#
# `Untitled.pdf` is a different patient and a different camera — three
# close-range lateral views off a proper body, no letterbox, no crop needed.
echo "orthodontics..."
PDFS="$SRC"
TMPPDF="$OUT/.tmp-pdf"
rm -rf "$TMPPDF"; mkdir -p "$TMPPDF"
swift "$(dirname "$0")/pdf-images.swift" "$PDFS/Sans titre 6.pdf" "$TMPPDF" series >/dev/null
swift "$(dirname "$0")/pdf-images.swift" "$PDFS/Untitled.pdf"     "$TMPPDF" close  >/dev/null

# page  crop (w:h:x:y against the 1179x2556 screenshot)
ORTHO=(
  "01 1179:534:0:1011"   # before, frontal bite
  "02 1179:663:0:947"    # before, right lateral
  "03 1179:657:0:950"    # before, left lateral
  "04 1179:881:0:837"    # before, upper occlusal
  "05 1179:813:0:872"    # before, lower occlusal
  "06 1179:534:0:1011"   # after,  frontal bite
  "07 1179:663:0:946"    # after,  right lateral
  "08 1179:657:0:949"    # after,  left lateral
  "09 1179:881:0:837"    # after,  upper occlusal
  "10 1179:813:0:872"    # after,  lower occlusal
)
i=1
for row in "${ORTHO[@]}"; do
  page=${row%% *}; crop=${row##* }
  if [ "$i" -le 5 ]; then out="ortho-before-0$i"; else out="ortho-after-0$((i - 5))"; fi
  # Crop first, then scale: cropping the 1179-wide original keeps every pixel of
  # the band, where scaling first would soften it before the bars came off.
  ffmpeg -v error -y -i "$TMPPDF/series-p$page.png" -map_metadata -1 \
    -vf "crop=$crop,scale=1100:-2:flags=lanczos" "$OUT/.tmp-ortho.png"
  cwebp -quiet -q 84 -metadata none "$OUT/.tmp-ortho.png" -o "$OUT/$out.webp"
  rm -f "$OUT/.tmp-ortho.png"
  i=$((i + 1))
done

for n in 1 2 3; do
  ffmpeg -v error -y -i "$TMPPDF/close-p0$n.png" -map_metadata -1 \
    -vf "scale=1100:-2:flags=lanczos" "$OUT/.tmp-ortho.png"
  cwebp -quiet -q 84 -metadata none "$OUT/.tmp-ortho.png" -o "$OUT/ortho-close-0$n.webp"
  rm -f "$OUT/.tmp-ortho.png"
done
rm -rf "$TMPPDF"


# --- children's dentistry ---------------------------------------------------
# The paediatric dentist with her patients, around the clinic: the yellow
# treatment room, the imaging corridor, the logo wall in reception.
#
# Every one is a whole frame. Nothing is cropped and no face is obscured, which
# is the point of the set — a child who is not frightened is the thing being
# photographed — and also why MEDIA.md carries the longest consent note on the
# site about these seven. See the note there before touching them.
#
# HEIC and JPEG mixed, and every file carries an EXIF orientation. `sips` is
# what applies it: ffmpeg reads the tag but leaves the pixels on their side, so
# a straight ffmpeg pass turns four of these ninety degrees. Going through sips
# first also decodes the HEIC, which no ffmpeg build here can open. It writes
# the PNG upright and the rest of the chain never has to know.
#
# Fitted inside a 1200px box rather than scaled to a fixed width: the set is six
# portraits and one landscape, and a fixed width makes a portrait 1955px tall
# for no gain in a gallery whose widest cell is a fraction of that.
echo "children..."
KIDS=(IMG_0130.HEIC IMG_0545.JPG.jpeg IMG_1411.JPG.jpeg IMG_1783.HEIC \
      IMG_2832.HEIC IMG_3436.HEIC IMG_9063.HEIC)
i=1
for name in "${KIDS[@]}"; do
  sips -s format png "$SRC/$name" --out "$OUT/.tmp-kid-src.png" >/dev/null
  ffmpeg -v error -y -i "$OUT/.tmp-kid-src.png" -map_metadata -1 \
    -vf "scale='min(1200,iw)':'min(1200,ih)':force_original_aspect_ratio=decrease:flags=lanczos" \
    "$OUT/.tmp-kid.png"
  cwebp -quiet -q 82 -metadata none "$OUT/.tmp-kid.png" -o "$OUT/kids-0$i.webp"
  rm -f "$OUT/.tmp-kid-src.png" "$OUT/.tmp-kid.png"
  i=$((i + 1))
done


# --- the team portraits -----------------------------------------------------
# The one output of this script that does not land in public/media. The team
# cards read from /img/team/, where scripts/team-placeholders.mjs writes the
# monograms, and a real portrait replaces one at the same path as .webp — that
# is the swap the placeholder script documents.
#
# Each is a 1080x1920 social card: the practice logo, the doctor's name and a
# strapline across the top quarter, the portrait below. They are kept whole. An
# earlier pass cropped the header off to fit the 3:4 the cards used to reserve,
# which threw away the clinic's own framing to satisfy a ratio we had picked
# ourselves while every portrait was still a monogram. The section reserves 9:16
# now and the placeholders are drawn to match, so nothing is cut.
#
# The beige studio ground stays. Cutting a figure out and setting it on the
# page's dark would be inventing a photograph nobody took, and this is the
# clinic's own backdrop — every portrait so far has been shot on it.
#
# The order of this table is the order of `team.members` in src/i18n.js, and the
# two must be edited together: a card's `photo` is doctor-0N.webp for its own
# position N, and a position with no entry here still shows a monogram.
#
# `esmail-card.jpg` is the one entry here that is not a clinic original. The
# clinic had no studio card for Dr. Esmail Mousa, only a photograph taken in a
# dim room strung with warm lights, so the card was built from it by
# scripts/card-composite.mjs and written back beside the originals. Rebuild it
# with `node scripts/card-composite.mjs "$SRC/esmail-card.jpg"`; that step needs
# macOS Vision and one font download, which is exactly why it is not run from
# here. If the clinic ever supplies a real card for him, drop it in its place
# and nothing else changes.
echo "team portraits..."
TEAM_OUT="/Users/lekaa/work files/dr.jihad live/public/img/team"
mkdir -p "$TEAM_OUT"
PORTRAITS=(
  "01 5 (2).jpg"     # Dr. Jihad Alrashed
  "02 1.psd.jpg"     # Dr. Haya Allouni
  "03 3.psd.jpg"     # Dr. Leen Barakat
  "04 2.psd.jpg"     # Dr. Bushra Shamma
  "05 esmail-card.jpg"  # Dr. Esmail Mousa - see the note below
)
for row in "${PORTRAITS[@]}"; do
  n=${row%% *}; file=${row#* }
  ffmpeg -v error -y -i "$SRC/$file" -map_metadata -1 \
    -vf "scale=900:1600:flags=lanczos" "$OUT/.tmp-doc.png"
  cwebp -quiet -q 86 -metadata none "$OUT/.tmp-doc.png" -o "$TEAM_OUT/doctor-$n.webp"
  rm -f "$OUT/.tmp-doc.png"
done


# --- the equipment photographs ----------------------------------------------
# One picture per device in the kit dialog. The clinic supplied two of each:
# a manufacturer cut-out on white, and the same unit lit in a dark room. The
# dark one is used every time, and not as a matter of taste — the dialog is
# #14100e, and a white-ground product shot punches a lit rectangle through it.
# The dark set also shares one warm key light, so seven of them in a column read
# as one set rather than seven stock images.
#
# Two pairs were not a with/without pair at all:
#   hair    — IMG_7155 is a SCREENSHOT of texaslaseracademy.com, that site's
#             chrome and URL still in frame. Not ours to publish; IMG_7160 is
#             the clean render and is what ships.
#   imaging — both are dark studio. IMG_3289 keeps the cephalometric arm in
#             frame, which is one of the six modalities the page lists, so it
#             is the honest one of the two.
#
# 720px wide: the column they sit in is 280px at the dialog's widest, so this
# covers a 2x screen with a little room and nothing more.
echo "equipment..."
KIT=(
  "diode      IMG_7162"   # الدايود ليزر
  "piezo      IMG_7161"   # جهاز البييزو
  "microscope IMG_7164"   # المايكروسكوب
  "obturation IMG_7163"   # أجهزة التحضير و الحشي الحراري
  "sedation   IMG_7165"   # قناع غاز التركين
  "hair       IMG_7160"   # جهاز إزالة الشعر
  "imaging    IMG_3289"   # جهاز التصوير الشعاعي
)
for row in "${KIT[@]}"; do
  name=${row%% *}; file=${row##* }
  ffmpeg -v error -y -i "$SRC/$file.PNG" -map_metadata -1 \
    -vf "scale=720:-2:flags=lanczos" "$OUT/.tmp-kit.png"
  cwebp -quiet -q 82 -metadata none "$OUT/.tmp-kit.png" -o "$OUT/kit-$name.webp"
  rm -f "$OUT/.tmp-kit.png"
done


echo "done"
