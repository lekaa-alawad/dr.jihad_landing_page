// Generates the stand-in portraits for the team section.
//
// Deliberately monograms, not faces. This is a real dental practice: a
// generated or stock portrait sitting under a doctor's name is a picture of
// somebody who does not work here, and if it ever reached production it would
// be the hardest thing on the page to spot as wrong. That is no longer a
// hypothetical risk here: every name in the section is real now, so the one
// remaining monogram is a real person without a photograph rather than a
// fictional person with one. A monogram is unmistakably
// a placeholder while still occupying the exact 9:16 a real portrait will.
//
// 9:16, not the 3:4 these were first drawn at, because that is the shape the
// clinic's portraits actually come in — a social card carrying the practice
// logo and the doctor's name above the figure. Reserving 3:4 meant cropping
// that header off to make a real photograph fit, so the ratio moved to the
// photograph rather than the other way round.
//
// Replace by dropping real photographs at the same paths as .webp and updating
// `photo` on each member in src/i18n.js.
//
// Five have been replaced that way already: `doctor-01.webp` through
// `doctor-05.webp`, written by the team-portraits step in scripts/media.sh.
// Four come from the clinic's own social cards; the fifth was built from a
// photograph by scripts/card-composite.mjs, because no card for him existed.

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const OUT = fileURLToPath(new URL('../public/img/team/', import.meta.url));

// Two warm tones off the site palette, alternated so a row of cards does not
// read as one flat block.
const TONES = [
  ['#241a16', '#3a2a21'],
  ['#1e1614', '#33241d'],
  ['#2a1d18', '#402e24'],
];

const svg = (initial, i) => {
  const [a, b] = TONES[i % TONES.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1600" viewBox="0 0 900 1600">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="${a}"/>
      <stop offset="1" stop-color="${b}"/>
    </linearGradient>
    <radialGradient id="l" cx="0.5" cy="0.38" r="0.62">
      <stop offset="0" stop-color="#f3b279" stop-opacity="0.16"/>
      <stop offset="1" stop-color="#f3b279" stop-opacity="0"/>
    </radialGradient>
    <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4"/></filter>
  </defs>
  <rect width="900" height="1600" fill="url(#g)"/>
  <rect width="900" height="1600" fill="url(#l)"/>
  <rect width="900" height="1600" filter="url(#n)" opacity="0.05"/>
  <text x="450" y="840" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif" font-size="300"
        fill="#f3b279" fill-opacity="0.5">${initial}</text>
  <text x="450" y="940" text-anchor="middle"
        font-family="system-ui, sans-serif" font-size="34" letter-spacing="6"
        fill="#fbf7f3" fill-opacity="0.28">PLACEHOLDER</text>
</svg>`;
};

// One initial per position in `team.members`, in that order. All six are
// confirmed people now. Five have a real portrait at the same number as .webp,
// so their monograms are written and never read; only the sixth is drawn and
// shown, and it stands under a real name — Dr. Haidara Habib, whose card the
// clinic has not supplied — so its initial is the one that has to be right.
// The other five are still written rather than special-cased, so that a
// doctor-0N.svg always exists for every N and a reorder cannot leave a card
// pointing at a file that was never drawn.
const INITIALS = ['ج', 'ه', 'ل', 'ب', 'ا', 'ح'];
INITIALS.forEach((ch, i) => {
  const name = `doctor-0${i + 1}.svg`;
  writeFileSync(OUT + name, svg(ch, i));
  console.log('  ' + name);
});
