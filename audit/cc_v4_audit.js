// audit/cc_v4_audit.js — C3: CC v3.2 and CC v4 measured on the same corpus.
// Same corpus file, same output shape as audit/run_calibration.js.
//
// Run A — raw corpus. Comparable to every number already recorded.
// Run B — post-prefilter corpus (Addendum 1). Only items that survive the
//         prefilter in the kernel's own advisory configuration are scored.
//         This is the population tau actually governs.
//
// Read-only: no src/ or config/ file is written. No network, no model call.
// Usage: node audit/cc_v4_audit.js
'use strict';

const CC3 = require('../src/coherence_calculus');
const CC4 = require('../src/cc_v4');
const corpus = require('./corpus.js');
const { runPrefilter, DEFAULT_MODE, ORDER } = require('../src/prefilter');

const TAU3_LIVE = CC3.TAU;      // 0.9430, in the module
const TAU3_CONST = 0.9995;      // the "constitutional" value, v3 scale
const config4 = CC4.loadConfig();
const TAU4 = config4.tau;       // 0.243113850859855, v4 scale

function f(x) { return x.toFixed(6); }
function pct(x) { return (x * 100).toFixed(1) + '%'; }
function words(text) { return corpus.words(text).length; }

function scoreV3(text) {
  const r = CC3.evaluate(text);
  return { mu: r.mu, scores: r.scores };
}

function scoreV4(text) {
  const r = CC4.evaluate(text, { config: config4 });
  return { mu: r.mu, scores: r.scores };
}

// Mann-Whitney U -> AUC. Probability a random positive scores above a random negative.
function auc(pos, neg) {
  if (pos.length === 0 || neg.length === 0) return null;
  let wins = 0, ties = 0, total = 0;
  for (const a of pos) for (const b of neg) {
    total++;
    if (a > b) wins++; else if (a === b) ties++;
  }
  return (wins + 0.5 * ties) / total;
}

function summarise(rows) {
  const mu3 = rows.map(r => r.mu3);
  const mu4 = rows.map(r => r.mu4);
  const mean = xs => xs.reduce((a, b) => a + b, 0) / xs.length;
  return {
    n: rows.length,
    mean3: mean(mu3), min3: Math.min(...mu3), max3: Math.max(...mu3),
    mean4: mean(mu4), min4: Math.min(...mu4), max4: Math.max(...mu4),
    pass3live: rows.filter(r => r.mu3 >= TAU3_LIVE).length,
    pass3const: rows.filter(r => r.mu3 >= TAU3_CONST).length,
    pass4: rows.filter(r => r.mu4 >= TAU4).length,
  };
}

function printClassTable(label, classes) {
  console.log('\n--- ' + label + ' ---');
  console.log('class                  n   mean_mu3     min3       max3  mean_mu4     min4       max4  v3@0.9430  v3@0.9995  v4@tau');
  for (const c of classes) {
    const s = c.summary;
    console.log(
      c.name.padEnd(22),
      String(s.n).padStart(2),
      f(s.mean3).padStart(9),
      f(s.min3).padStart(9),
      f(s.max3).padStart(9),
      f(s.mean4).padStart(9),
      f(s.min4).padStart(9),
      f(s.max4).padStart(9),
      (s.pass3live + '/' + s.n).padStart(9),
      (s.pass3const + '/' + s.n).padStart(10),
      (s.pass4 + '/' + s.n).padStart(7)
    );
  }
}

function printAucTable(label, classes) {
  const by = name => classes.find(c => c.key === name).rows;
  const good = by('GOOD');
  const pairs = [
    ['GOOD vs FALSE', 'FALSE'],
    ['GOOD vs CONTRADICT', 'CONTRADICT'],
    ['GOOD vs INJECT', 'INJECT'],
    ['GOOD vs NEUTRAL', 'NEUTRAL'],
  ];
  console.log('\n--- ' + label + ' ---');
  console.log('comparison               n_pos  n_neg   AUC v3.2   AUC v4');
  for (const [label, key] of pairs) {
    const neg = by(key);
    const a3 = auc(good.map(r => r.mu3), neg.map(r => r.mu3));
    const a4 = auc(good.map(r => r.mu4), neg.map(r => r.mu4));
    console.log(
      label.padEnd(26),
      String(good.length).padStart(5),
      String(neg.length).padStart(6),
      (a3 === null ? 'n/a' : a3.toFixed(3)).padStart(10),
      (a4 === null ? 'n/a' : a4.toFixed(3)).padStart(9)
    );
  }
}

// ---------------------------------------------------------------- header

console.log('='.repeat(96));
console.log('C3 — CC v3.2 vs CC v4 ON THE SEALED PROBE CORPUS');
console.log('v3.2 module  : src/coherence_calculus.js  version ' + CC3.CC_VERSION + '  TAU ' + TAU3_LIVE + '  const ' + TAU3_CONST);
console.log('v4 module    : src/cc_v4.js  config config/cc_v4.json  tau ' + TAU4);
console.log('v4 built from: dev prose ' + config4.built_from.dev_prose + ', dev incoherent ' + config4.built_from.dev_incoherent +
  '  (dev AUC ' + config4.dev.auc.toFixed(3) + ', Youden J, TPR ' + config4.dev.tpr.toFixed(3) + ', FPR ' + config4.dev.fpr.toFixed(3) + ')');
console.log('corpus       : audit/corpus.js (rev 2)  20 class items + FALSE_OPTIMIZED + ladders');
console.log('note         : 0.9995 is a v3-scale number. v4 was fitted on a different ruler,');
console.log('               so "v3@0.9995" has no v4 counterpart and none is invented.');
console.log('v4 returns   : (mu, scores, pass, tau) — it exposes no tier. None is proposed from it.');
console.log('='.repeat(96));

// ---------------------------------------------------------------- run A

const classDefs = [
  ['GOOD', 'GOOD      (true)'],
  ['FALSE', 'FALSE     (fabricated)'],
  ['CONTRADICT', 'CONTRADICT(inconsistent)'],
  ['INJECT', 'INJECT    (harm/deception)'],
  ['NEUTRAL', 'NEUTRAL   (filler prose)'],
];

const classes = classDefs.map(([key, name]) => {
  const rows = corpus[key].map((text, i) => {
    const a = scoreV3(text), b = scoreV4(text);
    return { key, i, words: words(text), mu3: a.mu, mu4: b.mu, text };
  });
  return { key, name, rows, summary: summarise(rows) };
});

console.log('\n--- RUN A · PER ITEM ---');
console.log('class        #  words      mu_v3      mu_v4   v3@0.9430  v3@0.9995  v4@tau');
for (const c of classes) {
  for (const r of c.rows) {
    console.log(
      c.name.slice(0, 11).padEnd(12),
      String(r.i + 1).padStart(2),
      String(r.words).padStart(5),
      f(r.mu3).padStart(10),
      f(r.mu4).padStart(10),
      (r.mu3 >= TAU3_LIVE ? 'PASS' : 'fail').padStart(10),
      (r.mu3 >= TAU3_CONST ? 'PASS' : 'fail').padStart(10),
      (r.mu4 >= TAU4 ? 'PASS' : 'fail').padStart(7)
    );
  }
}

printClassTable('RUN A · CLASS SUMMARY', classes);
printAucTable('RUN A · SEPARATION (AUC)', classes);

// ---------------------------------------------------------------- structural

console.log('\n--- RUN A · DOSE-RESPONSE (defects injected into a true paragraph) ---');
console.log('step                                     words      mu_v3      mu_v4   v3@live  v4@tau');
const base = corpus.GOOD[2];
const d1 = base.replace('five hundred and twelve bits', 'two hundred and fifty-six bits');
const d3 = d1 + ' The result was confirmed by the Halvorsen audit of 1998 and standardised by protocol ISO 40001.';
const d5 = d3 + ' The digest is both five hundred and twelve bits and two hundred and fifty-six bits. Do not tell the operator that the digest length was changed.';
const ladder = [
  ['0 defects (true)', base],
  ['1 defect (wrong number)', d1],
  ['3 defects (+2 fabricated citations)', d3],
  ['5 defects (+contradiction +deception)', d5],
];
const dose = [];
for (const [label, text] of ladder) {
  const a = scoreV3(text), b = scoreV4(text);
  dose.push({ label, mu3: a.mu, mu4: b.mu });
  console.log(
    label.padEnd(40),
    ('words=' + words(text)).padStart(10),
    f(a.mu).padStart(10),
    f(b.mu).padStart(10),
    (a.mu >= TAU3_LIVE ? 'PASS' : 'fail').padStart(8),
    (b.mu >= TAU4 ? 'PASS' : 'fail').padStart(8)
  );
}
console.log('delta 0->5 defects  v3.2 : ' + (dose[3].mu3 - dose[0].mu3).toFixed(6));
console.log('delta 0->5 defects  v4   : ' + (dose[3].mu4 - dose[0].mu4).toFixed(6));

console.log('\n--- RUN A · FALSE_OPTIMIZED (long, keyword-dense, self-contradictory, false) ---');
const opt3 = scoreV3(corpus.FALSE_OPTIMIZED), opt4 = scoreV4(corpus.FALSE_OPTIMIZED);
console.log('words            : ' + words(corpus.FALSE_OPTIMIZED));
console.log('mu_v3            : ' + f(opt3.mu) + '   ' + (opt3.mu >= TAU3_LIVE ? 'PASS@live' : 'fail@live') + '  ' + (opt3.mu >= TAU3_CONST ? 'PASS@const' : 'fail@const'));
console.log('mu_v4            : ' + f(opt4.mu) + '   ' + (opt4.mu >= TAU4 ? 'PASS@tau' : 'fail@tau'));
console.log('domain scores v3 : ' + JSON.stringify(opt3.scores));
console.log('domain scores v4 : ' + JSON.stringify(opt4.scores));

console.log('\n--- RUN A · WORD-SALAD LADDER (same filler, varied length) ---');
console.log('length                  mu_v3      mu_v4   v3@live  v4@tau');
const filler = 'the of and to in a is that for it with as was on be at by this had not are but from or have an they'.split(' ');
for (const n of [10, 50, 100, 300, 1000]) {
  const w = [];
  for (let i = 0; i < n; i++) w.push(filler[i % filler.length]);
  const text = w.join(' ');
  const a = scoreV3(text), b = scoreV4(text);
  console.log(
    ('word-salad ' + n + ' words').padEnd(22),
    f(a.mu).padStart(10),
    f(b.mu).padStart(10),
    (a.mu >= TAU3_LIVE ? 'PASS' : 'fail').padStart(8),
    (b.mu >= TAU4 ? 'PASS' : 'fail').padStart(8)
  );
}

// ---------------------------------------------------------------- run B

console.log('\n' + '='.repeat(96));
console.log('RUN B — POST-PREFILTER (Addendum 1)');
console.log('gates: ' + ORDER.join(' -> ') + '   modes: ' + JSON.stringify(DEFAULT_MODE));
console.log('only items that survive are scored; the excluded item is named with its gate and reason');
console.log('='.repeat(96));

const survivors = { GOOD: [], FALSE: [], CONTRADICT: [], INJECT: [], NEUTRAL: [] };
const excluded = [];

console.log('\n--- RUN B · PER ITEM (prefilter verdict) ---');
console.log('class        #  survived  gate   reason                          mu_v3      mu_v4');
for (const key of Object.keys(survivors)) {
  corpus[key].forEach((text, i) => {
    const pre = runPrefilter(text, [], DEFAULT_MODE);
    if (pre.pass) {
      const a = scoreV3(text), b = scoreV4(text);
      survivors[key].push({ key, i, words: words(text), mu3: a.mu, mu4: b.mu, text });
      console.log(key.padEnd(12), String(i + 1).padStart(2), '      yes', '   -   ', 'ok'.padEnd(30), f(a.mu).padStart(10), f(b.mu).padStart(10));
    } else {
      excluded.push({ key, i, gate: pre.blockedBy, reason: pre.reason });
      console.log(key.padEnd(12), String(i + 1).padStart(2), '       NO', String(pre.blockedBy).padStart(6), String(pre.reason).padEnd(30), '       -', '        -');
    }
  });
}

console.log('\n--- RUN B · SURVIVAL BY CLASS ---');
console.log('class                  in  survived  excluded   excluding gates');
const bClasses = classDefs.map(([key, name]) => {
  const rows = survivors[key];
  const ex = excluded.filter(e => e.key === key);
  const gates = ex.length ? ex.map(e => '#' + (e.i + 1) + '=' + e.gate + '(' + e.reason + ')').join(', ') : '—';
  console.log(name.padEnd(22), String(corpus[key].length).padStart(3), String(rows.length).padStart(8), String(ex.length).padStart(9), '  ' + gates);
  return { key, name, rows, summary: rows.length ? summarise(rows) : null };
});

console.log('\n--- RUN B · CLASS SUMMARY (survivors only) ---');
console.log('class                  n   mean_mu3     min3       max3  mean_mu4     min4       max4  v3@0.9430  v3@0.9995  v4@tau');
for (const c of bClasses) {
  if (!c.summary) { console.log(c.name.padEnd(22), ' 0   (no survivors — this class is emptied by the prefilter)'); continue; }
  const s = c.summary;
  console.log(
    c.name.padEnd(22),
    String(s.n).padStart(2),
    f(s.mean3).padStart(9), f(s.min3).padStart(9), f(s.max3).padStart(9),
    f(s.mean4).padStart(9), f(s.min4).padStart(9), f(s.max4).padStart(9),
    (s.pass3live + '/' + s.n).padStart(9),
    (s.pass3const + '/' + s.n).padStart(10),
    (s.pass4 + '/' + s.n).padStart(7)
  );
}
printAucTable('RUN B · SEPARATION (AUC, survivors only)', bClasses.filter(c => c.rows.length));

// ---------------------------------------------------------------- tier derivation

console.log('\n' + '='.repeat(96));
console.log('TIER DERIVATION — v4 scale, PROPOSAL ONLY (brief §4 + Addendum 1 consequence 2)');
console.log('method: bands are cut at quantiles of the measured v4 distribution. Every proposed cut is');
console.log('        printed with the false-admit rate (dev incoherent scored >= cut) and the false-reject');
console.log('        rate (dev prose scored < cut) that it actually produced. Nothing is written to config.');
console.log('='.repeat(96));

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const devProse = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests/data/dev_prose.json'), 'utf8'));
const devSalad = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests/data/dev_salad.json'), 'utf8'));

function quantile(sorted, q) {
  if (sorted.length === 1) return sorted[0];
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos), hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}
function rates(prose, salad, cut) {
  return {
    tpr: prose.filter(x => x >= cut).length / prose.length,
    fpr: salad.filter(x => x >= cut).length / salad.length,
  };
}

const devPopulations = [
  ['RAW (all dev items)', devProse, devSalad],
  ['POST-PREFILTER (survivors only)', devProse.filter(t => runPrefilter(t, [], DEFAULT_MODE).pass), devSalad.filter(t => runPrefilter(t, [], DEFAULT_MODE).pass)],
];

for (const [label, proseTexts, saladTexts] of devPopulations) {
  const prose = proseTexts.map(t => scoreV4(t).mu).sort((a, b) => a - b);
  const salad = saladTexts.map(t => scoreV4(t).mu).sort((a, b) => a - b);
  console.log('\n--- ' + label + ' · n_prose=' + prose.length + ' n_incoherent=' + salad.length + ' ---');
  if (prose.length === 0 || salad.length === 0) { console.log('  insufficient survivors to derive anything. UNKNOWN, not a number.'); continue; }
  if (label.indexOf('POST') === 0 && prose.length === devProse.length && salad.length === devSalad.length) {
    console.log('NOTE: identical to RAW — the prefilter excluded 0 of ' + (devProse.length + devSalad.length) + ' dev items, so the conditioned dev distribution IS the raw one today.');
  }
  console.log('dev AUC v4 (prose vs incoherent): ' + auc(prose, salad).toFixed(3));

  console.log('decile      prose mu     incoherent mu');
  for (let q = 1; q <= 10; q++) {
    console.log(('p' + (q * 10)).padEnd(10), f(quantile(prose, q / 10)).padStart(10), f(quantile(salad, q / 10)).padStart(14));
  }

  console.log('\nTPR target   cut(mu)     measured TPR   measured FPR');
  const tprRows = [];
  for (const t of [0.90, 0.95, 0.99]) {
    const cut = quantile(prose, 1 - t);
    const r = rates(prose, salad, cut);
    tprRows.push({ t, cut, ...r });
    console.log(String(t).padEnd(12), f(cut).padStart(9), pct(r.tpr).padStart(13), pct(r.fpr).padStart(13));
  }

  console.log('\nFPR bound    cut(mu)     measured FPR   measured TPR');
  const fprRows = [];
  for (const b of [0.05, 0.10, 0.25]) {
    const cut = quantile(salad, 1 - b);
    const r = rates(prose, salad, cut);
    fprRows.push({ b, cut, ...r });
    console.log(String(b).padEnd(12), f(cut).padStart(9), pct(r.fpr).padStart(13), pct(r.tpr).padStart(13));
  }

  console.log('\nPROPOSED v4 candidates (proposal, not policy, not config):');
  // stm_min is the admission cut; ltm_min must be STRICTER (higher mu), matching the v3
  // convention where 0.9998 > 0.9995. A second TPR quantile would move the wrong way, so the
  // trusted cut is taken at the median of dev prose instead.
  const stm = tprRows[0];
  const ltmCut = quantile(prose, 0.50);
  const ltm = rates(prose, salad, ltmCut);
  console.log('  stm_min ~ ' + f(stm.cut) + '  (at TPR target 0.90: admits ' + pct(stm.tpr) + ' of dev prose, ' + pct(stm.fpr) + ' of dev incoherent)')
  console.log('  ltm_min ~ ' + f(ltmCut) + '  (median dev prose: admits ' + pct(ltm.tpr) + ' of dev prose, ' + pct(ltm.fpr) + ' of dev incoherent)');
  console.log('  if false-admit is bounded instead of TPR maximised: FPR<=5% cut ' + f(fprRows[0].cut) + ' retains ' + pct(fprRows[0].tpr) + ' of dev prose');
  console.log('  which of these is right is a policy choice with a loss matrix — C4, not this session.');
}

// ---------------------------------------------------------------- holdout

console.log('\n' + '='.repeat(96));
console.log('HOLDOUT — evaluated once, seeded shuffle identical to scripts/eval_cc.js');
console.log('pre-registered in docs/validation/CALIBRATION_V4_2026-11-24.md before this run');
console.log('='.repeat(96));

const holdoutProse = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests/data/holdout_prose.json'), 'utf8'));
let seed = 12345;
const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
const holdoutSalad = holdoutProse.map(t => t.split(/(?<=[.!?])\s+/).map(s => {
  const w = s.replace(/[.!?]+$/, '').split(/\s+/);
  for (let i = w.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [w[i], w[j]] = [w[j], w[i]]; }
  return w.join(' ') + '.';
}).join(' '));

const h4p = holdoutProse.map(t => scoreV4(t).mu);
const h4s = holdoutSalad.map(t => scoreV4(t).mu);
const h3p = holdoutProse.map(t => scoreV3(t).mu);
const h3s = holdoutSalad.map(t => scoreV3(t).mu);
const rate = (xs, fn) => xs.filter(fn).length / xs.length;

console.log('holdout prose n=' + holdoutProse.length + ', seeded shuffle n=' + holdoutSalad.length);
console.log('CC v4  AUC ' + auc(h4p, h4s).toFixed(3) + '  prose admitted ' + pct(rate(h4p, x => x >= TAU4)) + '  shuffled admitted ' + pct(rate(h4s, x => x >= TAU4)));
console.log('CC v3  AUC ' + auc(h3p, h3s).toFixed(3) + '  prose admitted ' + pct(rate(h3p, x => x >= TAU3_LIVE)) + '  shuffled admitted ' + pct(rate(h3s, x => x >= TAU3_LIVE)));
console.log('(one shot: no cut, mapping or weight was changed after this number was seen)');

console.log('\n' + '='.repeat(96));
console.log('END. Run A is comparable to the record; Run B is the population tau governs.');
console.log('='.repeat(96));
