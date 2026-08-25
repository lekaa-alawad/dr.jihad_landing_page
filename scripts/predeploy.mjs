// Prints what is still unconfirmed, immediately before a deploy.
//
// This exists because the four before/after case labels are invented — they were
// written so the page read as finished during review, and they describe
// treatments on real patients that nobody at the clinic has confirmed. That was
// knowingly accepted for one deploy, on the understanding it gets fixed. A note
// in a chat log does not survive; a step in the deploy command does.
//
// It warns and continues rather than failing. Blocking a deploy over copy is not
// this script's call to make — being impossible to miss is.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const src = readFileSync(fileURLToPath(new URL('../src/i18n.js', import.meta.url)), 'utf8');

// Each entry: a marker in i18n.js, and what is still owed on it.
const OUTSTANDING = [
  {
    find: '!! PLACEHOLDER — every name',
    what: 'The dentists (team.members, both locales)',
    detail:
      'All six names, specialisms and biographies are invented, and the portraits\n' +
      '     are monogram placeholders. Six real people work here; none of them is\n' +
      '     currently on the page.',
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
