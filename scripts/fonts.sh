#!/bin/bash
# Converts display-face candidates into what the preview page can load.
#
# Drop any .ttf or .otf into fonts-inbox/ and run this. Each becomes a .woff2 in
# preview/fonts/ under a slug matching the FONTS list in
# public/font-preview.html — lowercased, non-alphanumerics stripped:
#
#   "KO Okies Regular.otf"   -> kookies.woff2      (see MAP below)
#   "ArslanWessamB.ttf"      -> arslanwessamb.woff2
#
# The map exists because a font's filename is whatever the foundry shipped, and
# the preview needs a stable name to reference.
set -euo pipefail

ROOT="/Users/lekaa/work files/dr.jihad live"
IN="$ROOT/fonts-inbox"
OUT="$ROOT/preview/fonts"
mkdir -p "$IN" "$OUT"

# filename fragment (lowercase, no separators) -> preview slug
map_slug() {
  case "$1" in
    *arslanwessamb*)          echo arslanwessamb ;;
    *arslanwessama*|*arslanwessam*) echo arslanwessam ;;
    *okies*bold*|*kookies*bold*) echo kookies-bold ;;
    *okies*|*kookies*)        echo kookies ;;
    *gaded*bold*|*gadedbold*) echo gaded-bold ;;
    *gaded*|*jaded*)          echo gaded ;;
    *thmanyah*serif*display*) echo thmanyahserif ;;
    *thmanyah*serif*)         echo thmanyahserif ;;
    *thmanyah*)               echo thmanyahsans ;;
    *)                        echo "" ;;
  esac
}

shopt -s nullglob nocaseglob
found=0
for f in "$IN"/*.ttf "$IN"/*.otf; do
  found=1
  base=$(basename "$f")
  key=$(echo "${base%.*}" | tr '[:upper:]' '[:lower:]' | tr -cd 'a-z0-9')
  slug=$(map_slug "$key")
  if [ -z "$slug" ]; then
    printf '  ?  %-42s no slug — add a case to map_slug()\n' "$base"
    continue
  fi
  # woff2_compress writes next to its input and only accepts ttf, so an otf is
  # copied in first and the stray output moved into place afterwards.
  tmp="$IN/.$slug.ttf"
  cp "$f" "$tmp"
  woff2_compress "$tmp" >/dev/null
  mv "$IN/.$slug.woff2" "$OUT/$slug.woff2"
  rm -f "$tmp"
  printf '  ok %-42s -> %s.woff2 (%s)\n' "$base" "$slug" "$(du -h "$OUT/$slug.woff2" | cut -f1)"
done

[ "$found" = 0 ] && echo "  nothing in $IN — drop .ttf/.otf files there first"
echo "done"
