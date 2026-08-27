// Builds a team card for a doctor the clinic photographed outside the studio.
//
// Every other doctor arrived as a finished 1080x1920 card: the practice logo and
// their name across the top quarter, the figure below, all on the same patterned
// beige ground. Dr. Esmail Mousa arrived as a photograph taken in a dim room
// strung with warm lights. This puts him on the same card.
//
//   node scripts/card-composite.mjs <out.jpg>
//
// Everything it reads is named in CONFIG below, beside the clinic's other
// originals. Subject mattes come from scripts/segment.swift (macOS Vision) and
// are cached in scripts/.cardtmp/. Fonts are fetched
// once into scripts/.fonts/ and cached; the run needs the network only the first
// time. Nothing here is re-run by media.sh — the finished card is written back
// beside the clinic's own originals and treated as a source from then on, so a
// normal media run needs neither Vision nor a font download. See MEDIA.md.
//
// Four things had to be measured off the real cards rather than eyeballed, and
// each is the reason this file is longer than a paste-and-scale would be.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const OUT = process.argv[2];
if (!OUT) { console.error('usage: card-composite <out.jpg>'); process.exit(2); }

const SRC = '/Users/lekaa/work files/dr.jihad/assets/';
const CONFIG = {
  photo: SRC + 'IMG_0432.JPG.jpeg',
  // The card whose ground, lockup and ink positions everything is measured
  // against. Dr. Leen's and Dr. Haya's are the same template to within a pixel;
  // Dr. Jihad's differs slightly, so it is not the one to measure from.
  reference: SRC + '3.psd.jpg',
  // Head width comes from Dr. Jihad's card — see headMetrics below for why.
  headFrom: SRC + '5 (2).jpg',
  // All three, for the colour fit: more skin and more uniform to average over.
  grading: [SRC + '3.psd.jpg', SRC + '1.psd.jpg', SRC + '5 (2).jpg'],
  refName: 'Dr. Leen Barakat', refSub: 'عيادة التقويم',
  name:    'Dr. Esmail Mousa', sub:    'جرّاح تجميل',
};

const W = 1080, H = 1920;

/** The ground repeats every 146.875px down the card. Measured, not guessed:
 *  a lag scan over a column of clear background puts minima at 146.75 and
 *  293.75, and the pair only agree on this. An integer period drifts out of
 *  phase over thirteen rows and leaves visible seams. */
const PERIOD = 146.875;
/** Row 0 of every card is a black scan line. Tiled, it reappears thirteen times
 *  down the plate, which is what the first attempt at this looked like. */
const FIRST_CLEAN_ROW = 2;
/** The logo lockup, identical on every card, lifted whole rather than redrawn. */
const LOCKUP = [180, 246];
/** Where the ink sits on the reference card: the name, then the strapline. */
const NAME_BAND = { x0: 255, x1: 822, y0: 284, y1: 338 };
const SUB_BAND  = { x0: 392, x1: 685, y0: 385, y1: 440 };
const NAME_INK = [255, 255, 255], SUB_INK = [67, 67, 69];
/** Poppins SemiBold set at this tracking reproduces the reference name to the
 *  pixel — 568px wide against the card's 568. Untracked it runs 600. */
const TRACKING = '-0.0291em';

const run = (cmd, args, opts = {}) => spawnSync(cmd, args, { maxBuffer: 1 << 29, ...opts });
const rgb = (f, vf) => run('ffmpeg', ['-v','error','-i',f,'-vf',vf,'-f','rawvideo','-pix_fmt','rgb24','-']).stdout;
const gry = (f, vf) => run('ffmpeg', ['-v','error','-i',f,'-vf',vf+',format=gray','-f','rawvideo','-']).stdout;
const dim = (f) => { const s = run('sips',['-g','pixelWidth','-g','pixelHeight',f]).stdout.toString();
  return [ +s.match(/pixelWidth: (\d+)/)[1], +s.match(/pixelHeight: (\d+)/)[1] ]; };
const bbox = (b, w, h, thr = 24) => { let x0=w,x1=-1,y0=h,y1=-1;
  for (let y=0;y<h;y++) for (let x=0;x<w;x++) if (b[y*w+x] > thr) {
    if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
  return { x0,x1,y0,y1, w:x1-x0+1, h:y1-y0+1 }; };

// ---------------------------------------------------------------- the ground
// The reference card's own background, with its subject removed. Tiling the
// clean band down the frame reproduces the pattern; it does not reproduce the
// shading, which falls off toward the bottom. Both edge columns are clear of
// the subject at every row, so the real shading is read off them and laid back
// on — no model of the vignette, just the card's own numbers.
function buildPlate(card) {
  const plate = Buffer.alloc(W*H*3);
  for (let y=0;y<H;y++) {
    const sy = FIRST_CLEAN_ROW + (y % PERIOD);
    const y0 = Math.floor(sy), y1 = y0+1, f = sy-y0;
    for (let x=0;x<W;x++) for (let c=0;c<3;c++)
      plate[(y*W+x)*3+c] = Math.round(card[(y0*W+x)*3+c]*(1-f) + card[(y1*W+x)*3+c]*f);
  }
  const corr = [];
  for (let y=0;y<H;y++) {
    const d=[0,0,0]; let n=0;
    for (const x0 of [0, 995]) for (let x=x0;x<x0+85;x++) {
      for (let c=0;c<3;c++) d[c] += card[(y*W+x)*3+c] - plate[(y*W+x)*3+c];
      n++;
    }
    corr.push(d.map(v => v/n));
  }
  const R = 25;
  for (let y=0;y<H;y++) {
    const o=[0,0,0]; let n=0;
    for (let k=Math.max(0,y-R);k<=Math.min(H-1,y+R);k++){ for(let c=0;c<3;c++) o[c]+=corr[k][c]; n++; }
    for (let x=0;x<W;x++) for (let c=0;c<3;c++) {
      const i=(y*W+x)*3;
      plate[i+c] = Math.max(0, Math.min(255, Math.round(plate[i+c] + o[c]/n)));
    }
  }
  return plate;
}

// ------------------------------------------------------------------ his tone
// His frame was shot in a dim, warm room and theirs in a studio, so the gap is
// exposure, contrast and colour cast at once — and it is not the same gap in
// the highlights as in the shadows. It is fitted twice, against the only two
// things that recur in all four photographs, and blended by luminance:
//
//   skin     what the eye actually compares in a row of portraits
//   uniform  the same charcoal garment, worn by every one of them
//
// Fitting once on the whole figure satisfied neither: it matched the
// distributions and still left his face darker than theirs. Fitting on skin
// alone turned the charcoal brown. An earlier pass matched the full histogram
// and looked worse than both — his source is dark and low-contrast, so
// stretching it to their spread opened gaps and his face came out blotchy.
const isSkin  = (r,g,b) => r>115 && r>g+12 && g>b+4 && (r+g+b)/3>95;
// Not the gloves. He is the only one wearing any, and that pool of near-black
// would drag the shadow fit down and brighten everything else to compensate.
const isCloth = (r,g,b) => { const l=(r+g+b)/3; return l>30 && l<110 && Math.max(r,g,b)-Math.min(r,g,b)<26; };
const STRENGTH = 0.8;   // eased, so his own side-lit modelling survives

function stats(pix, mask, n, pred) {
  const sum=[0,0,0], sq=[0,0,0]; let k=0;
  for (let i=0;i<n;i++) {
    if (mask[i] < 160) continue;
    const r=pix[i*3], g=pix[i*3+1], b=pix[i*3+2];
    if (!pred(r,g,b)) continue;
    sum[0]+=r; sum[1]+=g; sum[2]+=b; sq[0]+=r*r; sq[1]+=g*g; sq[2]+=b*b; k++;
  }
  const mean = sum.map(v => v/k);
  return { mean, sd: sq.map((v,c) => Math.sqrt(Math.max(1e-6, v/k - mean[c]*mean[c]))), k };
}
function grade(man, matte, SW, SH, refs) {
  const target = (pred) => {
    let M=[0,0,0], S=[0,0,0], K=0;
    for (const [card, mat] of refs) {
      const s = stats(rgb(card,`crop=${W}:${H}:0:0`), gry(mat,`scale=${W}:${H}`), W*H, pred);
      for (let c=0;c<3;c++){ M[c]+=s.mean[c]*s.k; S[c]+=s.sd[c]*s.k; } K += s.k;
    }
    return { mean: M.map(v=>v/K), sd: S.map(v=>v/K) };
  };
  const fit = (pred, label) => {
    const T = target(pred), O = stats(man, matte, SW*SH, pred);
    const gain = [0,1,2].map(c => 1 + ((T.sd[c]/O.sd[c]) - 1) * STRENGTH);
    const off  = [0,1,2].map(c => (O.mean[c] + (T.mean[c]-O.mean[c])*STRENGTH) - O.mean[c]*gain[c]);
    console.log(`  ${label.padEnd(8)} target ${T.mean.map(v=>v.toFixed(0)).join(',')}`
              + ` | his ${O.mean.map(v=>v.toFixed(0)).join(',')}`);
    return { gain, off, anchor: O.mean.reduce((a,b)=>a+b,0)/3 };
  };
  const SKIN = fit(isSkin,'skin'), CLOTH = fit(isCloth,'uniform');
  for (let i=0,n=SW*SH;i<n;i++) {
    if (matte[i] <= 1) continue;
    const L = (man[i*3]+man[i*3+1]+man[i*3+2])/3;
    let t = (L - CLOTH.anchor) / (SKIN.anchor - CLOTH.anchor);
    t = Math.max(0, Math.min(1, t));
    t = t*t*(3-2*t);                                    // smoothstep, no visible band
    for (let c=0;c<3;c++) {
      const gn = CLOTH.gain[c]*(1-t) + SKIN.gain[c]*t;
      const of = CLOTH.off[c]*(1-t)  + SKIN.off[c]*t;
      man[i*3+c] = Math.max(0, Math.min(255, Math.round(man[i*3+c]*gn + of)));
    }
  }
}

// -------------------------------------------------------------------- typing
// Poppins SemiBold and Tajawal Medium, chosen by rendering four candidates for
// each script and scoring their shapes against the ink on the reference card —
// not by eye. Both are then calibrated on a string the card already carries, so
// if the metrics are still off it shows up as a width that does not match.
const FONTS = fileURLToPath(new URL('.fonts/', import.meta.url));
const FACES = {
  latin:  ['Poppins-SemiBold.ttf', 'https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-SemiBold.ttf', 600],
  arabic: ['Tajawal-Medium.ttf',   'https://github.com/google/fonts/raw/main/ofl/tajawal/Tajawal-Medium.ttf',   500],
};
function ensureFonts() {
  if (!existsSync(FONTS)) mkdirSync(FONTS, { recursive: true });
  for (const [file, url] of Object.values(FACES).map(f => [f[0], f[1]])) {
    if (existsSync(FONTS + file)) continue;
    console.log('  fetching', file);
    const r = run('curl', ['-sSL','-o', FONTS+file, url]);
    if (r.status !== 0 || !existsSync(FONTS+file)) throw new Error('cannot fetch '+file);
  }
}
// ------------------------------------------------------------------ framing
// Scale him by head size, not by how much of the frame he fills. He was shot
// further back than the others, so matching the silhouette's height gave a
// head noticeably smaller than everyone else's on the row. The reference for
// head width is Dr. Jihad's card, the other short-haired subject — the women's
// silhouettes include hair volume and read 15% wider at the same head size.
function headMetrics(mattePath, w, h) {
  const b = gry(mattePath, `scale=${w}:${h}`);
  const width = (y) => { let x0=w, x1=-1;
    for (let x=0;x<w;x++) if (b[y*w+x] > 128) { if (x<x0) x0=x; x1=x; }
    return x1 < 0 ? 0 : x1-x0+1; };
  let crown = 0;
  for (let y=0;y<h;y++) if (width(y) > 4) { crown = y; break; }
  let headW = 0;
  for (let y=crown; y<crown+Math.round(h*0.075) && y<h; y++) headW = Math.max(headW, width(y));
  let x0=w, x1=-1;
  for (let y=0;y<h;y++) for (let x=0;x<w;x++) if (b[y*w+x] > 128) { if (x<x0) x0=x; if (x>x1) x1=x; }
  return { crown, headW, cx: (x0+x1)/2 };
}

// -------------------------------------------------------------------- typing
function renderLine(face, size, tracking, text, out) {
  const [file] = FACES[face];
  const r = run('swift', [fileURLToPath(new URL('render-text.swift', import.meta.url)),
                          FONTS + file, String(size), String(tracking), text, out]);
  if (r.status !== 0) throw new Error('render-text failed: ' + r.stderr.toString());
}
// Both lines are calibrated on a string the card already carries: render the
// reference, scale it until its ink is the height the card prints, and check
// the width lands on the card's width too. The Latin needs tracking to get
// there. The Arabic cannot be tracked without breaking its joins, so the last
// 3.6% is taken out of the horizontal scale instead.
function placeLine(out, face, refText, newText, band, ink, tmp) {
  const [file,, ] = FACES[face];
  const tracking = face === 'latin' ? TRACKING.replace('em','') : '0';
  const refPng = `${tmp}/ref-${face}.png`, newPng = `${tmp}/new-${face}.png`;
  renderLine(face, 300, tracking, refText, refPng);
  renderLine(face, 300, tracking, newText, newPng);
  const [rw, rh] = dim(refPng);
  const rb = bbox(gry(refPng, `crop=${rw}:${rh}:0:0`), rw, rh);
  const s = (band.y1 - band.y0 + 1) / rb.h;
  let sw = Math.round(rw*s), sh = Math.round(rh*s);
  const probe = bbox(gry(refPng, `scale=${sw}:${sh}:flags=lanczos`), sw, sh);
  const hx = (band.x1 - band.x0 + 1) / probe.w;
  sw = Math.round(sw*hx);
  const refS = gry(refPng, `scale=${sw}:${sh}:flags=lanczos`);
  const newS = gry(newPng, `scale=${sw}:${sh}:flags=lanczos`);
  const rbs = bbox(refS, sw, sh), nbs = bbox(newS, sw, sh);
  console.log(`  ${face.padEnd(6)} reference reproduces ${rbs.w}px against the card's ${band.x1-band.x0+1}px`
            + (Math.abs(hx-1) > 0.001 ? ` (width calibrated ${(hx*100).toFixed(1)}%)` : ''));
  // The reference maps its own ink top onto the card's, and the new string
  // inherits that mapping — so a descender hangs where it should rather than
  // being dragged up to sit flush.
  const dy = band.y0 - rbs.y0;
  const dx = Math.round((band.x0+band.x1)/2) - Math.round((nbs.x0+nbs.x1)/2);
  for (let y=0;y<sh;y++) { const cy = y+dy; if (cy<0||cy>=H) continue;
    for (let x=0;x<sw;x++) { const cx = x+dx; if (cx<0||cx>=W) continue;
      const alpha = newS[y*sw+x]/255; if (alpha <= 0.004) continue;
      const i = (cy*W+cx)*3;
      for (let c=0;c<3;c++) out[i+c] = Math.round(ink[c]*alpha + out[i+c]*(1-alpha));
    } }
}

// ---------------------------------------------------------------------- main
const TMP = fileURLToPath(new URL('.cardtmp/', import.meta.url));
if (!existsSync(TMP)) mkdirSync(TMP, { recursive: true });
ensureFonts();

// Mattes, cut once and cached — Vision takes a while on a 4672x7008 frame.
function matteFor(path) {
  const key = path.replace(/^.*\//,'').replace(/[^A-Za-z0-9]+/g,'_') + '.png';
  const out = TMP + key;
  if (!existsSync(out)) {
    console.log('  segmenting', path.replace(/^.*\//,''));
    const r = run('swift', [fileURLToPath(new URL('segment.swift', import.meta.url)), path, out]);
    if (r.status !== 0) throw new Error('segment failed: ' + r.stderr.toString());
  }
  return out;
}

const card = rgb(CONFIG.reference, `crop=${W}:${H}:0:0`);
console.log('plate...');
const out = buildPlate(card);
for (let y=LOCKUP[0]; y<=LOCKUP[1]; y++) card.copy(out, (y*W)*3, (y*W)*3, (y*W+W)*3);

const [pw, ph] = dim(CONFIG.photo);
const refM  = headMetrics(matteFor(CONFIG.headFrom), W, H);
const mineM = headMetrics(matteFor(CONFIG.photo), pw, ph);
const s  = refM.headW / mineM.headW;
const SW = Math.round(pw*s), SH = Math.round(ph*s);
const DX = Math.round(W/2 - mineM.cx*s), DY = Math.round(refM.crown - mineM.crown*s);
console.log(`framing: head ${mineM.headW}px -> ${refM.headW}px (scale ${s.toFixed(4)}), crown at y=${refM.crown}`);

const man = Buffer.from(rgb(CONFIG.photo, `scale=${SW}:${SH}:flags=lanczos`));
// A little blur on the matte: Vision returns a hard edge, and a cut-out with no
// transition reads as a sticker pasted on the card.
const matte = gry(matteFor(CONFIG.photo), `scale=${SW}:${SH}:flags=lanczos,gblur=sigma=1.2`);

console.log('grading...');
grade(man, matte, SW, SH, CONFIG.grading.map(c => [c, matteFor(c)]));

for (let y=0;y<SH;y++) { const dy = y+DY; if (dy<0||dy>=H) continue;
  for (let x=0;x<SW;x++) { const dx = x+DX; if (dx<0||dx>=W) continue;
    const a = matte[y*SW+x]/255; if (a <= 0.004) continue;
    const si = (y*SW+x)*3, di = (dy*W+dx)*3;
    for (let c=0;c<3;c++) out[di+c] = Math.round(man[si+c]*a + out[di+c]*(1-a));
  } }

console.log('type...');
placeLine(out, 'latin',  CONFIG.refName, CONFIG.name, NAME_BAND, NAME_INK, TMP);
placeLine(out, 'arabic', CONFIG.refSub,  CONFIG.sub,  SUB_BAND,  SUB_INK,  TMP);

const w = run('ffmpeg', ['-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',`${W}x${H}`,
                         '-i','-','-frames:v','1','-q:v','2',OUT], { input: out });
if (w.status !== 0) { console.error(w.stderr.toString()); process.exit(1); }
console.log('wrote', OUT);
