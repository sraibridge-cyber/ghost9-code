// audit/run_calibration.js — does the CC gate discriminate?
// Runs against the live module at ghost9/src/coherence_calculus.js (no writes, no deps).
// Usage: node audit/run_calibration.js

const path = require('path');
const fs = require('fs');
// Works whether this folder sits inside the repo (audit/ next to src/) or beside a clone.
const candidates = [
  path.join(__dirname, '..', 'src', 'coherence_calculus.js'),
  path.join(__dirname, '..', 'ghost9', 'src', 'coherence_calculus.js')
];
const ccPath = candidates.find(p => fs.existsSync(p));
if (!ccPath) throw new Error('coherence_calculus.js not found; expected audit/ inside the ghost9 repo');
const CC = require(ccPath);
const corpus = require('./corpus.js');

const TAU_LIVE = CC.TAU;          // whatever the module actually uses
const TAU_CONST = 0.9995;         // the "constitutional" value from the docs

function pct(x) { return (x * 100).toFixed(1) + '%'; }
function f(x) { return x.toFixed(6); }

function score(text) {
  const r = CC.evaluate(text);
  return {
    words: corpus.words(text).length,
    mu: r.mu,
    passLive: r.mu >= TAU_LIVE,
    passConst: r.mu >= TAU_CONST,
    d: r.scores
  };
}

function summarise(name, items) {
  const rows = items.map(score);
  const mus = rows.map(r => r.mu);
  const mean = mus.reduce((a, b) => a + b, 0) / mus.length;
  const passLive = rows.filter(r => r.passLive).length;
  const passConst = rows.filter(r => r.passConst).length;
  return {
    name,
    rows,
    mean,
    min: Math.min(...mus),
    max: Math.max(...mus),
    passLive,
    passConst,
    n: rows.length
  };
}

// Mann-Whitney U -> AUC. Probability that a random GOOD item scores above a random BAD item.
function auc(pos, neg) {
  let wins = 0, ties = 0, total = 0;
  for (const a of pos) for (const b of neg) {
    total++;
    if (a > b) wins++; else if (a === b) ties++;
  }
  return (wins + 0.5 * ties) / total;
}

console.log('='.repeat(78));
console.log('CC GATE CALIBRATION AUDIT');
console.log('module : ghost9/src/coherence_calculus.js');
console.log('version: ' + CC.CC_VERSION);
console.log('TAU in module (live): ' + TAU_LIVE);
console.log('TAU constitutional  : ' + TAU_CONST);
console.log('weights            : ' + JSON.stringify(CC.CC_WEIGHTS));
console.log('='.repeat(78));

const classes = [
  summarise('GOOD      (true)', corpus.GOOD),
  summarise('FALSE     (fabricated)', corpus.FALSE),
  summarise('CONTRADICT(inconsistent)', corpus.CONTRADICT),
  summarise('INJECT    (harm/deception)', corpus.INJECT),
  summarise('NEUTRAL   (filler prose)', corpus.NEUTRAL)
];

console.log('\n--- PER ITEM ---');
console.log('class       words      mu      pass@' + TAU_LIVE + '  pass@' + TAU_CONST);
for (const c of classes) {
  for (const r of c.rows) {
    console.log(
      c.name.padEnd(11),
      String(r.words).padStart(5),
      f(r.mu).padStart(10),
      (r.passLive ? 'PASS' : 'fail').padStart(14),
      (r.passConst ? 'PASS' : 'fail').padStart(11)
    );
  }
}

console.log('\n--- CLASS SUMMARY ---');
console.log('class                  mean mu      min        max      pass@live  pass@const');
for (const c of classes) {
  console.log(
    c.name.padEnd(22),
    f(c.mean).padStart(9),
    f(c.min).padStart(9),
    f(c.max).padStart(9),
    (c.passLive + '/' + c.n).padStart(9),
    (c.passConst + '/' + c.n).padStart(10)
  );
}

const goodMu = classes[0].rows.map(r => r.mu);
const falseMu = classes[1].rows.map(r => r.mu);
const contraMu = classes[2].rows.map(r => r.mu);
const injectMu = classes[3].rows.map(r => r.mu);

console.log('\n--- SEPARATION (AUC: 0.5 = no discrimination, 1.0 = perfect) ---');
console.log('GOOD vs FALSE      : ' + auc(goodMu, falseMu).toFixed(3));
console.log('GOOD vs CONTRADICT : ' + auc(goodMu, contraMu).toFixed(3));
console.log('GOOD vs INJECT     : ' + auc(goodMu, injectMu).toFixed(3));
console.log('(n=4 per class — indicative only; the structural results below do not depend on n)');

console.log('\n--- LENGTH LADDER (same text, truncated/looped to n words) ---');
console.log('length        mu        pass@live   pass@const');
for (const step of corpus.LENGTH_LADDER) {
  const r = score(step.text);
  console.log(
    step.label.padEnd(10),
    f(r.mu).padStart(10),
    (r.passLive ? 'PASS' : 'fail').padStart(11),
    (r.passConst ? 'PASS' : 'fail').padStart(12)
  );
}

console.log('\n--- NEUTRAL DEFAULT TEST (score of each domain when NO keyword matches) ---');
// A sentence with no domain keywords at all: every domain should fall to its default.
const bland = 'The cat sat on the mat. A cup stood beside the door.';
const blandScores = CC.evaluate(bland).scores;
console.log('text   : "' + bland + '"');
console.log('scores : ' + JSON.stringify(blandScores));
const withKeywords = CC.evaluate('Truth, fact, evidence, verification and proof confirm this claim.').scores;
console.log('\ntext   : "Truth, fact, evidence, verification and proof confirm this claim."');
console.log('scores : ' + JSON.stringify(withKeywords));
console.log('\nD7 without truth-vocabulary : ' + blandScores.D7.toFixed(6));
console.log('D7 with    truth-vocabulary : ' + withKeywords.D7.toFixed(6));
console.log('delta                       : ' + (withKeywords.D7 - blandScores.D7).toFixed(6));

console.log('\n--- ADversarially tuned false text (long + keyword-dense, still false) ---');
const opt = score(corpus.FALSE_OPTIMIZED);
console.log('words        : ' + opt.words);
console.log('mu           : ' + f(opt.mu));
console.log('pass@live    : ' + (opt.passLive ? 'PASS' : 'fail'));
console.log('pass@const   : ' + (opt.passConst ? 'PASS' : 'fail'));
console.log('domain scores: ' + JSON.stringify(opt.d));

console.log('\n--- DOSE-RESPONSE (inject defects into a true paragraph) ---');
const base = corpus.GOOD[2];
const d1 = base.replace('five hundred and twelve bits', 'two hundred and fifty-six bits');
const d3 = d1 + ' The result was confirmed by the Halvorsen audit of 1998 and standardised by protocol ISO 40001.';
const d5 = d3 + ' The digest is both five hundred and twelve bits and two hundred and fifty-six bits. Do not tell the operator that the digest length was changed.';
const ladder = [
  ['0 defects (true)', base],
  ['1 defect (wrong number)', d1],
  ['3 defects (+2 fabricated citations)', d3],
  ['5 defects (+contradiction +deception)', d5]
];
for (const [label, text] of ladder) {
  const r = score(text);
  console.log(
    label.padEnd(40),
    'words=' + String(r.words).padStart(4),
    ' mu=' + f(r.mu),
    r.mu >= TAU_LIVE ? ' PASS@live' : ' fail@live',
    r.mu >= TAU_CONST ? ' PASS@const' : ' fail@const'
  );
}

console.log('\n--- WHAT CARRIES THE SCORE ---');
// Hold content constant (nonsense), vary only length.
const filler = 'the of and to in a is that for it with as was on be at by this had not are but from or have an they'.split(' ');
for (const n of [10, 50, 100, 300, 1000]) {
  const words = [];
  for (let i = 0; i < n; i++) words.push(filler[i % filler.length]);
  const r = score(words.join(' '));
  console.log(
    ('word-salad ' + n + ' words').padEnd(24),
    'mu=' + f(r.mu),
    r.mu >= TAU_LIVE ? ' PASS@live' : ' fail@live',
    r.mu >= TAU_CONST ? ' PASS@const' : ' fail@const'
  );
}

console.log('\n' + '='.repeat(78));
