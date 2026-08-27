// Prints what is still unconfirmed, immediately before a deploy.
//
// This exists because the four before/after case labels are invented — they were
// written so the page read as finished during review, and they describe
// treatments on real patients that nobody at the clinic has confirmed. That was
// knowingly accepted for one deploy, on the understanding it gets fixed. A note
// in a chat log does not survive; a step in the deploy command does.
//
// It has since taken on the heavier job of naming the photographs of patients
// whose consent to publish is not evidenced anywhere in this repository. Those
// entries are not copy that can be rewritten later; if the consent turns out not
// to exist, the files come off the site.
//
// It warns and continues rather than failing. Blocking a deploy over copy is not
// this script's call to make — being impossible to miss is.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const src = readFileSync(fileURLToPath(new URL('../src/i18n.js', import.meta.url)), 'utf8');

// Each entry: a marker in i18n.js, and what is still owed on it.
const OUTSTANDING = [
  {
    find: '!! CONSENT — children',
    what: "Children's photographs (treatments, both locales)",
    detail:
      'Seven photographs of nine identifiable children and one teenager, faces in\n' +
      '     frame and published at full size. Nothing here evidences that the clinic\n' +
      '     holds the guardians\' written consent. This is the most exposed set on\n' +
      '     the site; a withdrawal means deleting kids-0{1..7}.webp and removing the\n' +
      "     gallery from the children's item in src/i18n.js, in BOTH locales.",
  },
  {
    find: '!! STOCK IMAGERY',
    what: 'Equipment photographs (about.kit, both locales)',
    detail:
      'kit-*.webp are manufacturer or stock product renders, not photographs of\n' +
      "     these units in this clinic — the only pictures on the site that are not\n" +
      '     the clinic\'s own. One of the fourteen supplied files was a screenshot of\n' +
      '     texaslaseracademy.com, so at least part of the set was collected from\n' +
      '     the web. A render is somebody\'s copyright even for a device you own, and\n' +
      '     no licence to publish is evidenced here. Often permitted by the maker —\n' +
      '     but unchecked.',
  },
  {
    find: '!! UNCONFIRMED COPY',
    what: 'Dental Laser copy (treatments, both locales)',
    detail:
      "The clinic's own write-up covers eight departments; the site runs nine.\n" +
      '     Asked about it, the clinic said the dental laser had been missed rather\n' +
      '     than retired — so the department stays, but it is the one row whose note\n' +
      '     is not the clinic\'s writing. The other eight now carry their supplied\n' +
      '     text; this one still carries the short line an earlier pass wrote.',
  },
  {
    find: '!! PORTRAIT',
    what: 'One portrait (team.members, both locales)',
    detail:
      'Every name and qualification in the team section is now the clinic\'s own —\n' +
      '     no invented dentists remain. What is outstanding is one photograph:\n' +
      '     Dr. Haidara Habib has no card, so his entry shows a monogram under a\n' +
      '     real name. Nothing on the page is false; one sixth of it is a blank.',
  },
  {
    find: '// PLACEHOLDER',
    what: 'Case labels (cases.labels, both locales)',
    detail:
      'The four before/after captions are invented. They name treatments on real\n' +
      '     patient photographs and were never confirmed by the clinic.',
  },
];

const hits = OUTSTANDING.filter((o) => src.includes(o.find));

if (hits.length) {
  const y = (s) => `\x1b[33m${s}\x1b[0m`;
  const b = (s) => `\x1b[1m${s}\x1b[0m`;
  console.log('');
  console.log(y('  ┌─────────────────────────────────────────────────────────────┐'));
  console.log(y('  │  STILL UNCONFIRMED — going live anyway                      │'));
  console.log(y('  └─────────────────────────────────────────────────────────────┘'));
  for (const h of hits) {
    console.log(`  ${b('•')} ${b(h.what)}`);
    console.log(`     ${h.detail}`);
  }
  console.log('');
  console.log('  Remove the PLACEHOLDER markers in src/i18n.js once supplied,');
  console.log('  and this notice goes away on its own.');
  console.log('');
} else {
  console.log('\n  \x1b[32m✓\x1b[0m nothing outstanding in src/i18n.js\n');
}
