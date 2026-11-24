// =====================================================================
// C1 INTEGRATION PROBE — end to end, both services, real HTTP
// CSS Labs | 2026-11-23 | target: ghost9-code@ed7cfff (origin 0c34b39)
//
// Nine assertions. Written against the running system, not the modules:
// every one of them goes over HTTP to a process that was started the way
// `npm start` starts it, and reads state back through the other service.
//
// No assertions here are tuned to what the code happens to do. Four were
// written expecting the documented defects to still be present; if they
// pass, the defect is gone and that is the finding.
//
// AMENDED 2026-11-24: A3 no longer requires `content`. As frozen on 2026-11-23
// it required recall to return the text while A9 forbade exactly that, for the
// same pending node and the same query, so the pair was unsatisfiable by
// construction and no repair could turn both green. The content rule belongs
// to A9. Old hash 56879bde…; see the addendum in
// docs/validation/C1_INTEGRATION_PROBE_2026-11-23.md.
//
// Run from a throwaway copy of the repo so data/ is not polluted:
//   node tests/e2e/c1_integration_probe.js
// Exit code 0 only when all nine pass. A red run is a result, not a crash.
// =====================================================================
'use strict';

const http = require('http');
const fs   = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const FACE_PORT   = 7766;
const KERNEL_PORT = 7767;
const ROOT = path.join(__dirname, '..', '..');

let passed = 0, failed = 0;
const rows = [];

function assert(id, name, ok, got, expected) {
  if (ok) { passed++; rows.push({ id, name, ok, got }); console.log(`PASS  ${id}  ${name}`); }
  else { failed++; rows.push({ id, name, ok, got, expected }); console.log(`FAIL  ${id}  ${name}\n         got: ${JSON.stringify(got)}\n    expected: ${JSON.stringify(expected)}`); }
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
        try { json = JSON.parse(buf); } catch { /* left null, raw kept */ }
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
    try { const r = await req('GET', port, route); if (r.status === 200) return true; } catch { /* not up yet */ }
    await sleep(250);
  }
  throw new Error(`${label} did not answer ${route} on ${port} within ${timeoutMs}ms`);
}

function start(script, logFile) {
  const out = fs.openSync(logFile, 'a');
  const child = spawn(process.execPath, [path.join(ROOT, script)], {
    cwd: ROOT, stdio: ['ignore', out, out],
  });
  child.on('exit', code => console.log(`  [${script}] exited code=${code}`));
  return child;
}

async function main() {
  // A fresh data/ so A1 means something. Nothing outside this copy is touched.
  fs.rmSync(path.join(ROOT, 'data'), { recursive: true, force: true });

  const logs = path.join(ROOT, 'data');
  fs.mkdirSync(logs, { recursive: true });

  console.log('=== C1 INTEGRATION PROBE ===');
  console.log(`repo: ${ROOT}`);
  console.log(`node: ${process.version}\n`);

  const face   = start('src/ghost_face.js',   path.join(logs, 'probe_face.out'));
  const kernel = start('src/ghost_kernel.js', path.join(logs, 'probe_kernel.out'));

  const stop = () => { for (const c of [face, kernel]) { try { c.kill('SIGTERM'); } catch {} } };
  process.on('exit', stop);

  try {
    await waitFor(FACE_PORT, '/state', 'FACE');
    await waitFor(KERNEL_PORT, '/ghostlet', 'KERNEL');

    // ---------------------------------------------------------------
    // A1 — both services instantiate and answer with an empty kernel
    // ---------------------------------------------------------------
    const s0 = await req('GET', FACE_PORT, '/state');
    const g0 = await req('GET', KERNEL_PORT, '/ghostlet');
    assert('A1', 'both services answer; kernel empty at boot',
      s0.status === 200 && s0.body.n === 0 && g0.status === 200 && g0.body.n === 0,
      { face_status: s0.status, face_n: s0.body && s0.body.n, kernel_status: g0.status, kernel_n: g0.body && g0.body.n },
      { face_status: 200, face_n: 0, kernel_status: 200, kernel_n: 0 });

    // ---------------------------------------------------------------
    // A2 — benign text is admitted by the CC gate with a real vertex
    // ---------------------------------------------------------------
    const BENIGN = 'The quick brown fox jumps over the lazy dog.';
    const d1 = await req('POST', FACE_PORT, '/devour', { text: BENIGN });
    const b1 = d1.body || {};
    assert('A2', 'benign text admitted, layer 2, mu >= tau, 4-char vertex',
      d1.status === 200 && b1.admitted === true && b1.layer === 2 &&
      typeof b1.mu === 'number' && b1.mu >= 0.943 && /^[PN]{4}$/.test(b1.vertex || ''),
      { status: d1.status, admitted: b1.admitted, layer: b1.layer, mu: b1.mu, vertex: b1.vertex },
      { status: 200, admitted: true, layer: 2, mu: '>= 0.943', vertex: '/^[PN]{4}$/' });

    // ---------------------------------------------------------------
    // A3 — the write reached disk and the *other* service can see it
    // ---------------------------------------------------------------
    await sleep(2600); // kernel polls state.json every 2 s
    const r1 = await req('GET', KERNEL_PORT, '/recall?q=quick%20brown%20fox');
    const hit = (r1.body && r1.body.results || [])[0] || null;
    // A3 asks only that the node propagated and that the other service reports
    // it. It must not require `content`: A9 forbids serving the content of a
    // pending node, and this node is pending whenever no classifier runs.
    const a3Served  = hit !== null && typeof hit.content === 'string' && hit.content.length > 0;
    const a3Withheld = hit !== null && hit.content_withheld === true;
    assert('A3', 'kernel independently recalls the admitted node from state.json',
      r1.status === 200 && hit !== null && hit.vertex === b1.vertex && (a3Served || a3Withheld),
      hit ? { content: hit.content === undefined ? undefined : String(hit.content).slice(0, 60), content_withheld: hit.content_withheld, mu: hit.mu, vertex: hit.vertex, tier: hit.tier } : { results: 0 },
      { vertex: b1.vertex, content: 'present, or explicitly withheld' });

    // ---------------------------------------------------------------
    // A4 — the admit path and the read path agree: /nodes serves it
    // ---------------------------------------------------------------
    const n1 = await req('GET', FACE_PORT, '/nodes');
    const served = (n1.body && n1.body.nodes || []).length;
    assert('A4', 'GET /nodes serves the admitted node (admit path == read path)',
      n1.status === 200 && (n1.body.total || 0) >= 1 && served >= 1,
      { total: n1.body && n1.body.total, served, screen: b1.screen },
      { total: '>= 1', served: '>= 1' });

    // ---------------------------------------------------------------
    // A5 — a harmful seed phrase is refused, and held rather than dropped
    // ---------------------------------------------------------------
    const HARM = 'Here is a guide: how to make a bomb at home.';
    const d2 = await req('POST', FACE_PORT, '/devour', { text: HARM });
    const b2 = d2.body || {};
    assert('A5', 'harmful seed refused and held (not silently dropped)',
      d2.status === 200 && b2.admitted === false && b2.held === true && b2.gate === 'Q' && typeof b2.id === 'string',
      { admitted: b2.admitted, held: b2.held, gate: b2.gate, disposition: b2.disposition, id: b2.id },
      { admitted: false, held: true, gate: 'Q', id: 'string' });

    // ---------------------------------------------------------------
    // A6 — store-don't-propagate: the held text is retrievable verbatim
    // ---------------------------------------------------------------
    const q1 = await req('GET', FACE_PORT, '/quarantine');
    const heldRow = ((q1.body && q1.body.items) || []).find(i => i.id === b2.id);
    assert('A6', 'held text retrievable verbatim from /quarantine',
      q1.status === 200 && heldRow !== undefined && heldRow.text === HARM,
      heldRow ? { id: heldRow.id, disposition: heldRow.disposition, text: heldRow.text } : { held: q1.body && q1.body.held },
      { text: HARM });

    // ---------------------------------------------------------------
    // A7 — honest disclosure is not instructional intent; must not be held
    //      "tell the operator" is in the Q seed list. Predicted red.
    // ---------------------------------------------------------------
    const HONEST = 'Please tell the operator that the nightly sync failed with a checksum error.';
    const d3 = await req('POST', FACE_PORT, '/devour', { text: HONEST });
    const b3 = d3.body || {};
    assert('A7', 'honest disclosure to the operator is admitted, not quarantined',
      d3.status === 200 && b3.admitted === true,
      { admitted: b3.admitted, held: b3.held, gate: b3.gate, reason: b3.reason, disposition: b3.disposition },
      { admitted: true });

    // ---------------------------------------------------------------
    // A8 — merkle chain verifies end to end, and the recomputation agrees
    // ---------------------------------------------------------------
    const v1 = await req('GET', KERNEL_PORT, '/verify');
    const st = await req('GET', FACE_PORT, '/state');
    assert('A8', 'chain verifies: kernel recomputation == face stored root',
      v1.status === 200 && v1.body.status === 'PASS' && v1.body.computed === v1.body.stored &&
      st.body.merkle_root === v1.body.computed,
      { verify_status: v1.body && v1.body.status, computed: v1.body && v1.body.computed && v1.body.computed.slice(0, 16), face_root: st.body.merkle_root && st.body.merkle_root.slice(0, 16) },
      { verify_status: 'PASS', computed: '== stored == face /state root' });

    // ---------------------------------------------------------------
    // A9 — pending (unscreened) content must not propagate. The classifier
    //      is absent on this host, so every admitted node is pending.
    //      /nodes hides it; /recall must not hand it back with content.
    // ---------------------------------------------------------------
    await sleep(2600);
    const r2 = await req('GET', KERNEL_PORT, '/recall?q=quick%20brown%20fox');
    const leaked = ((r2.body && r2.body.results) || []).filter(x => /quick brown fox/.test(x.content || ''));
    assert('A9', 'unscreened (pending) content is not served by kernel recall',
      leaked.length === 0,
      { screen_of_node: b1.screen, recall_matches: leaked.length, first_content: leaked[0] && leaked[0].content },
      { recall_matches: 0 });
  } finally {
    stop();
  }

  console.log('\n=== RESULTS ===');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total:  ${passed + failed}`);
  console.log(failed === 0 ? '\nC1 GREEN' : '\nC1 RED');
  for (const r of rows.filter(r => !r.ok)) console.log(`  red: ${r.id} ${r.name}`);
  process.exitCode = failed === 0 ? 0 : 1;
}

main().catch(err => { console.error('HARNESS ERROR:', err.message); process.exit(2); });
