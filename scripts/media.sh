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

echo "done"
