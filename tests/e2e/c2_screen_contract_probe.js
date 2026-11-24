// =====================================================================
// C2 SCREEN CONTRACT PROBE — BRIEF 005 (C2a), §2 and Addendum 1
// CSS Labs | 2026-11-24 | branch: fix/screen-contract
//
// Seven assertions over real HTTP against both services, run on scratch
// copies (mkdtemp, copy src/ + config/, symlink node_modules, own
// GHOST9_KEY_FILE). The real data/ is never touched.
//
// Run twice, once per classifier mode, because Addendum 1 makes the mode
// load-bearing:
//   advisory run — C1..C6 on a scratch copy whose config/clf.json mode is
//                  'advisory'. No classifier is running on this host, so
//                  advisory is the only mode in which a sentence can be
//                  admitted at all. That choice is the point of the run.
//   block run    — C7 on a second scratch copy whose mode is 'block'. With
//                  no classifier, block mode must hold, not admit.
//
// C1..C5 are the screening contract of §1 (S1..S4) and are expected RED
// before the repair. C6 is the legacy case and is expected GREEN before
// and after: a node with no `screen` key must still be served. C7 is
// Addendum 1 (S6) and is expected RED before the repair, because today
// prefilter.js fails open in block mode.
//
// Usage: node tests/e2e/c2_screen_contract_probe.js
// Exit 0 only when all seven pass. A red run is a result, not a crash.
// =====================================================================
'use strict';

const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');

const ROOT = path.join(__dirname, '..', '..');
const FACE_PORT = 7766;
const KERNEL_PORT = 7767;

const BENIGN = 'The quarterly audit found three invoices that were never approved by finance.';
const FRAGMENT = 'quarterly audit found three invoices that'; // six words, per C4
const LEGACY_TEXT = 'The harbour lights flickered as the ferry pulled away from the dock.';

let passed = 0, failed = 0;
const rows = [];

function assert(id, name, ok, got, expected) {
  if (ok) { passed++; rows.push({ id, name, ok }); console.log(`PASS  ${id}  ${name}`); }
  else {
    failed++; rows.push({ id, name, ok, got, expected });
    console.log(`FAIL  ${id}  ${name}\n         got: ${JSON.stringify(got)}\n    expected: ${JSON.stringify(expected)}`);
  }
}

function req(method, port, route, body) {
  return new Promise((resolve, reject) => {
    const payload = body === undefined ? null : JSON.stringify(body);
    const r = http.request({
      hostname: '127.0.0.1', port, path: route, method, agent: false,
      headers: payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {},
    }, res => {
      let buf = '';
      res.on('data', c => buf += c);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(buf); } catch { /* raw kept */ }
        resolve({ status: res.statusCode, body: json, raw: buf });
      });
    });
    r.on('error', reject);
    if (payload) r.write(payload);
    r.end();
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function waitFor(port, route, label, timeoutMs = 25000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    try { const r = await req('GET', port, route); if (r.status === 200) return true; } catch { /* not up */ }
    await sleep(250);
  }
  throw new Error(`${label} did not answer ${route} on ${port} within ${timeoutMs}ms`);
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

function scratchCopy(tag, qcMode) {
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), `ghost9-c2-${tag}-`));
  copyDir(path.join(ROOT, 'src'), path.join(scratch, 'src'));
  copyDir(path.join(ROOT, 'config'), path.join(scratch, 'config'));
  fs.symlinkSync(path.join(ROOT, 'node_modules'), path.join(scratch, 'node_modules'), 'dir');
  const clfPath = path.join(scratch, 'config', 'clf.json');
  const clf = JSON.parse(fs.readFileSync(clfPath, 'utf8'));
  clf.mode = qcMode;
  fs.writeFileSync(clfPath, JSON.stringify(clf, null, 2));
  return scratch;
}

function startServices(scratch) {
  const keyFile = path.join(scratch, 'at_rest.key');
  const env = { ...process.env, GHOST9_KEY_FILE: keyFile };
  const out = fs.openSync(path.join(scratch, 'probe.out'), 'a');
  const face = spawn(process.execPath, [path.join(scratch, 'src', 'ghost_face.js')],
    { cwd: scratch, stdio: ['ignore', out, out], env });
  const kernel = spawn(process.execPath, [path.join(scratch, 'src', 'ghost_kernel.js')],
    { cwd: scratch, stdio: ['ignore', out, out], env });
  return { face, kernel, keyFile };
}

function stopServices(children) {
  return Promise.all(children.map(child => new Promise(resolve => {
    if (!child || child.exitCode !== null) return resolve();
    const done = () => resolve();
    child.once('exit', done);
    try { child.kill('SIGTERM'); } catch { /* already gone */ }
    setTimeout(() => { try { child.kill('SIGKILL'); } catch { /* gone */ } resolve(); }, 3000).unref();
  })));
}

// The kernel recomputes this over state.nodes; the probe writes a coherent
// state.json so a patched-in legacy node does not show up as TAMPER noise.
function merkleRoot(nodes) {
  if (nodes.length === 0) return null;
  let layer = nodes.map(n => n.hash);
  while (layer.length > 1) {
    const next = [];
    for (let i = 0; i < layer.length; i += 2) {
      next.push(crypto.createHash('sha3-512').update(layer[i] + (layer[i + 1] || layer[i])).digest('hex'));
    }
    layer = next;
  }
  return layer[0];
}

async function advisoryRun() {
  console.log('\n--- advisory run (config/clf.json mode: advisory) ---');
  const scratch = scratchCopy('advisory', 'advisory');
  const children = startServices(scratch);
  try {
    await waitFor(FACE_PORT, '/state', 'FACE');
    await waitFor(KERNEL_PORT, '/verify', 'KERNEL');

    // C1 — one benign sentence admitted; /state counts it as pending.
    const d = await req('POST', FACE_PORT, '/devour', { text: BENIGN });
    const devoured = d.body || {};
    await sleep(300);
    const s1 = await req('GET', FACE_PORT, '/state');
    const state = s1.body || {};
    assert('C1', 'benign sentence admitted; /state n=1 pending_count=1',
      d.status === 200 && devoured.admitted === true && state.n === 1 && state.pending_count === 1,
      { admitted: devoured.admitted, screen: devoured.screen, n: state.n, pending_count: state.pending_count },
      { admitted: true, n: 1, pending_count: 1 });

    // C2 — /nodes lists the pending node as pending, with no content key.
    const n1 = await req('GET', FACE_PORT, '/nodes');
    const nodesBody = n1.body || {};
    const first = (nodesBody.nodes || [])[0] || {};
    const hasContentKey = JSON.stringify(nodesBody).includes('"content"');
    assert('C2', '/nodes total=1 pending=1 screen=pending, no content key',
      n1.status === 200 && nodesBody.total === 1 && nodesBody.pending === 1 &&
      first.screen === 'pending' && hasContentKey === false,
      { total: nodesBody.total, pending: nodesBody.pending, screen: first.screen, content_key: hasContentKey },
      { total: 1, pending: 1, screen: 'pending', content_key: false });

    // C3 — /recall returns the node as a record: no text, not served, named reason.
    await sleep(2600); // kernel polls state.json every 2 s
    const r1 = await req('GET', KERNEL_PORT, '/recall?q=quarterly');
    const recall = r1.body || {};
    const hit = (recall.results || [])[0] || {};
    assert('C3', '/recall count=1 content=null served=false reason=unscreened',
      r1.status === 200 && recall.count === 1 && hit.content === null &&
      hit.served === false && hit.reason === 'unscreened',
      { count: recall.count, content: hit.content, served: hit.served, reason: hit.reason, screen: hit.screen },
      { count: 1, content: null, served: false, reason: 'unscreened' });

    // C4 — the sentence's six-word fragment appears nowhere in the /recall body.
    const leaked = JSON.stringify(recall).includes(FRAGMENT);
    assert('C4', 'the 6-word fragment appears nowhere in the /recall body',
      leaked === false, { fragment_present: leaked }, { fragment_present: false });

    // C5 — no door reports a total that silently excludes pending.
    const v1 = await req('GET', KERNEL_PORT, '/verify');
    const verify = v1.body || {};
    assert('C5', '/verify n === served_count + pending_count',
      v1.status === 200 && verify.n === verify.served_count + verify.pending_count &&
      verify.pending_count === 1,
      { n: verify.n, served_count: verify.served_count, pending_count: verify.pending_count },
      { n: 1, served_count: 0, pending_count: 1 });

    // C6 — a legacy node with no `screen` key is still served.
    process.env.GHOST9_KEY_FILE = children.keyFile;
    const atRestPath = path.join(scratch, 'src', 'at_rest.js');
    delete require.cache[require.resolve(atRestPath)];
    const atRest = require(atRestPath);
    const statePath = path.join(scratch, 'data', 'state.json');
    const stored = atRest.readSealedJson(statePath, null);
    const ts = Date.now() - 1000;
    const hash = crypto.createHash('sha3-512').update(`${LEGACY_TEXT}|${ts}`).digest('hex');
    const legacy = {
      id: `${hash}_0`, hash, content: LEGACY_TEXT, mu: 0.97, tier: 'STM',
      scores: {}, vertex: 'PPPP', merge_count: 1, parent_ids: null, merkle_root: null, ts,
    };
    stored.nodes.push(legacy);
    stored.n = stored.nodes.length;
    stored.merkle_root = merkleRoot(stored.nodes);
    atRest.writeSealedJson(statePath, stored);
    await sleep(2600);

    // C6 is the invariant, not the new contract: a legacy node (no `screen`
    // key) must still be listed by /nodes and still serve its text through
    // /recall, before and after the repair. It must not assert the fields
    // S2/S3 add — that is C2's and C3's job.
    const n2 = await req('GET', FACE_PORT, '/nodes');
    const listed = ((n2.body && n2.body.nodes) || []);
    const legacyInNodes = listed
      .some(n => legacy.hash.startsWith(String(n.hash).replace('…', '')));
    const r2 = await req('GET', KERNEL_PORT, '/recall?q=harbour');
    const legacyHit = ((r2.body && r2.body.results) || [])
      .find(x => typeof x.content === 'string' && x.content.includes('harbour'));
    assert('C6', 'legacy node with no screen key is still served by both doors',
      n2.status === 200 && legacyInNodes && legacyHit !== undefined,
      { in_nodes: legacyInNodes, nodes_total: n2.body && n2.body.total, nodes_listed: listed.length,
        recall_count: r2.body && r2.body.count, legacy_hit: legacyHit !== undefined },
      { in_nodes: true, legacy_hit: true });
  } finally {
    await stopServices([children.face, children.kernel]);
    fs.rmSync(scratch, { recursive: true, force: true });
  }
}

async function blockRun() {
  console.log('\n--- block run (config/clf.json mode: block, no classifier) ---');
  const scratch = scratchCopy('block', 'block');
  const children = startServices(scratch);
  try {
    await waitFor(FACE_PORT, '/state', 'FACE');
    await waitFor(KERNEL_PORT, '/verify', 'KERNEL');

    const d = await req('POST', FACE_PORT, '/devour', { text: BENIGN });
    const held = d.body || {};
    const s1 = await req('GET', FACE_PORT, '/state');
    const n1 = await req('GET', FACE_PORT, '/nodes');
    const q1 = await req('GET', FACE_PORT, '/quarantine');
    const r1 = await req('GET', KERNEL_PORT, '/recall?q=quarterly');
    const item = ((q1.body && q1.body.items) || [])[0] || {};
    const state = s1.body || {}, nodes = n1.body || {}, recall = r1.body || {};

    assert('C7', 'block mode + no classifier: held at QC, nothing admitted, text held verbatim',
      d.status === 200 && held.admitted === false && held.held === true &&
      held.gate === 'QC' && held.disposition === 'classifier_unavailable' &&
      state.n === 0 && state.pending_count === 0 &&
      nodes.total === 0 && recall.count === 0 &&
      item.text === BENIGN && item.status === 'held' && item.gate === 'QC' &&
      JSON.stringify(recall).includes(FRAGMENT) === false,
      {
        admitted: held.admitted, gate: held.gate, disposition: held.disposition, n: state.n,
        pending_count: state.pending_count, nodes_total: nodes.total, recall_count: recall.count,
        quarantine_status: item.status, quarantine_gate: item.gate, text_verbatim: item.text === BENIGN,
      },
      {
        admitted: false, gate: 'QC', disposition: 'classifier_unavailable', n: 0,
        pending_count: 0, nodes_total: 0, recall_count: 0,
        quarantine_status: 'held', quarantine_gate: 'QC', text_verbatim: true,
      });
  } finally {
    await stopServices([children.face, children.kernel]);
    fs.rmSync(scratch, { recursive: true, force: true });
  }
}

async function main() {
  console.log('=== C2 SCREEN CONTRACT PROBE ===');
  console.log(`repo: ${ROOT}`);
  console.log(`node: ${process.version}`);

  await advisoryRun();
  await blockRun();

  console.log('\n=== RESULTS ===');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total:  ${passed + failed}`);
  console.log(failed === 0 ? '\nC2 GREEN' : '\nC2 RED');
  for (const r of rows.filter(x => !x.ok)) console.log(`  red: ${r.id} ${r.name}`);
  process.exitCode = failed === 0 ? 0 : 1;
}

main().catch(err => { console.error('HARNESS ERROR:', err.message); process.exit(2); });
