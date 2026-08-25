// Generates the stand-in portraits for the team section.
//
// Deliberately monograms, not faces. This is a real dental practice: a
// generated or stock portrait sitting under a doctor's name is a picture of
// somebody who does not work here, and if it ever reached production it would
// be the hardest thing on the page to spot as wrong. A monogram is unmistakably
// a placeholder while still occupying the exact 3:4 a real portrait will.
//
// Replace by dropping real photographs at the same paths as .webp and updating
// `photo` on each member in src/i18n.js.

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
  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
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
  <rect width="900" height="1200" fill="url(#g)"/>
  <rect width="900" height="1200" fill="url(#l)"/>
  <rect width="900" height="1200" filter="url(#n)" opacity="0.05"/>
  <text x="450" y="640" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif" font-size="300"
        fill="#f3b279" fill-opacity="0.5">${initial}</text>
  <text x="450" y="740" text-anchor="middle"
        font-family="system-ui, sans-serif" font-size="34" letter-spacing="6"
        fill="#fbf7f3" fill-opacity="0.28">PLACEHOLDER</text>
</svg>`;
};

const INITIALS = ['ج', 'ل', 'ع', 'ر', 'ك', 'ه'];
INITIALS.forEach((ch, i) => {
  const name = `doctor-0${i + 1}.svg`;
  writeFileSync(OUT + name, svg(ch, i));
  console.log('  ' + name);
});
