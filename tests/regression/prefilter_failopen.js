// Regression: the QC classifier stage fails open when unreachable, and blocks only on a flagged score in block mode.
// Usage: node tests/regression/prefilter_failopen.js
//
// AMENDED 2026-11-24 — the file name, and the line directly above, now understate this file's
// scope. It tests the QC stage's disposition BY MODE: fail-open in `advisory`, fail-closed in
// `block`. It was named when only the first half was true. The name is kept so the suite's
// history stays traceable; the stale first line is kept because this file is append-only too.
'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');
const { runPrefilterAsync, DEFAULT_MODE } = require(path.join(__dirname, '..', '..', 'src', 'prefilter'));
const { config: CLF } = require(path.join(__dirname, '..', '..', 'src', 'clf_client'));

const ROOT = path.join(__dirname, '..', '..');
const FACE_PORT = 7766;
const BENIGN = 'The committee approved the budget after a long debate.';
const modeWith = QC => ({ ...DEFAULT_MODE, QC });
const down = { classify: async () => ({ ok: false, error: 'connect ECONNREFUSED' }) };
const flagged = { classify: async () => ({ ok: true, scores: [CLF.threshold + 0.5], model: 'stub' }) };
const clear = { classify: async () => ({ ok: true, scores: [0.0], model: 'stub' }) };

let passed = 0, failed = 0;
async function check(name, fn) {
  try { await fn(); passed++; console.log('  ok    ' + name); }
  catch (e) { failed++; console.log('  FAIL  ' + name + ' :: ' + e.message); }
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dst);
    else fs.copyFileSync(src, dst);
  }
}

function request(method, route, body) {
  return new Promise((resolve, reject) => {
    const payload = body === undefined ? null : JSON.stringify(body);
    const r = http.request({
      hostname: '127.0.0.1', port: FACE_PORT, path: route, method, agent: false,
      headers: payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {},
    }, res => {
      let buf = '';
      res.on('data', c => buf += c);
      res.on('end', () => { try { resolve(JSON.parse(buf)); } catch (e) { reject(e); } });
    });
    r.on('error', reject);
    if (payload) r.write(payload);
    r.end();
  });
}

async function waitForState(timeoutMs = 20000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    try { await request('GET', '/state'); return; } catch { await new Promise(r => setTimeout(r, 150)); }
  }
  throw new Error(`FACE did not answer /state on ${FACE_PORT} within ${timeoutMs}ms`);
}

// Run the block-mode door on a scratch copy: the real data/ is never touched, and the
// classifier is genuinely absent here, which is the condition under test.
async function withScratchFace(fn) {
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'ghost9-failopen-'));
  copyDir(path.join(ROOT, 'src'), path.join(scratch, 'src'));
  copyDir(path.join(ROOT, 'config'), path.join(scratch, 'config'));
  const clfPath = path.join(scratch, 'config', 'clf.json');
  const clf = JSON.parse(fs.readFileSync(clfPath, 'utf8'));
  clf.mode = 'block';
  fs.writeFileSync(clfPath, JSON.stringify(clf, null, 2));
  fs.symlinkSync(path.join(ROOT, 'node_modules'), path.join(scratch, 'node_modules'), 'dir');
  const out = fs.openSync(path.join(scratch, 'face.out'), 'a');
  const face = spawn(process.execPath, [path.join(scratch, 'src', 'ghost_face.js')], {
    cwd: scratch, stdio: ['ignore', out, out],
    env: { ...process.env, GHOST9_KEY_FILE: path.join(scratch, 'at_rest.key') },
  });
  try {
    await waitForState();
    return await fn();
  } finally {
    await new Promise(resolve => {
      if (face.exitCode !== null) return resolve();
      face.once('exit', resolve);
      try { face.kill('SIGTERM'); } catch { resolve(); }
      setTimeout(() => { try { face.kill('SIGKILL'); } catch { /* gone */ } resolve(); }, 3000).unref();
    });
    fs.rmSync(scratch, { recursive: true, force: true });
  }
}

(async () => {
  // AMENDED 2026-11-24 (BRIEF 005 Addendum 1, S6). The REQUIREMENT changed; the code was not
  // reworded to suit it. `Ghost9 design proposal (v2)`, "Decisions (Kyle, 28 Oct 2026)",
  // item Fail policy: "`advisory` reports `classifier_unavailable` and passes. `block` fails
  // closed." Addendum 1's revised S6 turns that into: an unreachable classifier is UNKNOWN,
  // and in block mode it is held at gate QC, never admitted, its text kept for /quarantine.
  //
  // The expectation below is replaced because the old one — fail-open in BLOCK mode — was
  // WITHDRAWN, not because the implementation moved. The replacement asserts strictly more
  // than the line it replaces: the stage's verdict, its gate identity and reason, and five
  // end-to-end facts across two doors. It is harder to pass, not merely different.
  await check('block mode + classifier unreachable: held at QC, nothing admitted, text held verbatim', async () => {
    // The stage's own verdict.
    const r = await runPrefilterAsync(BENIGN, [], modeWith('block'), down);
    assert.strictEqual(r.pass, false, 'block mode must not pass an unscreened sentence');
    assert.strictEqual(r.blockedBy, 'QC', 'the block must be attributed to the QC gate');
    assert.strictEqual(r.reason, 'classifier_unavailable', 'UNKNOWN must be named, not folded into a score');
    assert.strictEqual(r.stages.QC.pass, false);
    assert.strictEqual(r.stages.QC.mode, 'block');
    assert.strictEqual(r.stages.QC.reason, 'classifier_unavailable');
    assert.strictEqual(r.stages.QC.score, null);

    // The same verdict at the door: nothing admitted, nothing stored, the text kept verbatim.
    const door = await withScratchFace(async () => {
      const dev = await request('POST', '/devour', { text: BENIGN });
      const state = await request('GET', '/state');
      const nodes = await request('GET', '/nodes');
      const quarantine = await request('GET', '/quarantine');
      return { dev, state, nodes, quarantine };
    });
    assert.strictEqual(door.dev.admitted, false, 'a held sentence must not be admitted');
    assert.strictEqual(door.dev.held, true, 'it must be held, not silently dropped');
    assert.strictEqual(door.dev.gate, 'QC');
    assert.strictEqual(door.dev.disposition, 'classifier_unavailable');
    assert.strictEqual(door.state.n, 0, 'nothing may be stored as a node');
    assert.strictEqual(door.state.pending_count, 0);
    assert.strictEqual(door.nodes.total, 0, 'no node door may report it');
    const item = (door.quarantine.items || [])[0];
    assert.ok(item, 'the held text must be listed by /quarantine');
    assert.strictEqual(item.text, BENIGN, 'held text must be retrievable verbatim');
    assert.strictEqual(item.status, 'held');
    assert.strictEqual(item.gate, 'QC');
  });
  await check('advisory mode + classifier unreachable: sentence passes', async () => {
    const r = await runPrefilterAsync(BENIGN, [], modeWith('advisory'), down);
    assert.strictEqual(r.pass, true);
  });
  await check('block mode + flagged score: blocked by QC', async () => {
    const r = await runPrefilterAsync(BENIGN, [], modeWith('block'), flagged);
    assert.strictEqual(r.pass, false);
    assert.strictEqual(r.blockedBy, 'QC');
    assert.strictEqual(r.stages.QC.flagged, true);
  });
  await check('advisory mode + flagged score: reported, not blocked', async () => {
    const r = await runPrefilterAsync(BENIGN, [], modeWith('advisory'), flagged);
    assert.strictEqual(r.pass, true);
    assert.strictEqual(r.stages.QC.flagged, true);
  });
  await check('block mode + clear score: passes', async () => {
    const r = await runPrefilterAsync(BENIGN, [], modeWith('block'), clear);
    assert.strictEqual(r.pass, true);
    assert.strictEqual(r.stages.QC.flagged, false);
  });
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
})();
