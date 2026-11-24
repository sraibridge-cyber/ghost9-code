# C2a — the screening contract, measured

**Brief:** `BRIEF 005 — C2a: the screening contract (F1 + F3)`, as issued, plus
**Addendum 1 (2026-11-24)** which adds S6 and moves `src/prefilter.js` into scope.
**Branch:** `fix/screen-contract` off `main` at `002008d`.
**Session:** one, 2026-11-24. Code Buff executing; measurements below.

---

## 0. Freeze conditions — recorded before the repair

| Item | Value |
|---|---|
| Base commit | `002008d` (`AGENTS.md rev 2`) — the only commits since `ed7cfff` are documentation |
| Node / npm | v26.13.1 / 11.20.0 |
| Dependencies | `node_modules` present from the C3 session's `npm ci`; `package-lock.json` untouched (`git status` clean for it) |
| Classifier (127.0.0.1:7768) | not running — `ECONNREFUSED` |
| `tests/e2e/c1_integration_probe.js` | **unchanged**: 11,800 B, SHA3-512 `840b8a6b…e5778e34` |
| `src/prefilter.js` before | `6d31576f…` at `ed7cfff`; this branch's pre-repair byte state matches base |
| Probe written first | `tests/e2e/c2_screen_contract_probe.js` — SHA3-512 `62702d8d…6aefe85` at red, unchanged since |

## 1. Step 0 — the instrument, before anything else

`node tests/e2e/c1_integration_probe.js` on the repository at `002008d`:

**6 passed, 3 failed (A4, A7, A9), exit 1.** The committed probe is 11,800 B and hashes to
SHA3-512 `840b8a6b53a03ce8387df908e8a048a8acb6eb6f22ba0816576740156a2952b5957dbd5d029027411e371688b85e154af67c354a0904b235f16fc925e5778e34`,
which is the hash the session was told to expect. The record's `dd5afca9…` is a sha256 of
the amended probe quoted in the reconstruction brief; it is not this file's SHA3-512 and
the two are not comparable. Behaviour matches the record exactly, so the instrument is the
same instrument and the session proceeded.

Coverage caveat (§0.5): **already present** in
`docs/validation/C1_INTEGRATION_PROBE_2026-11-23.md` — Addendum 1 §1.1 (the nine are a
reconstruction; T4/T5/T6/T8/T9 never ran) and §1.3 (A7 is an addition, not a T5
substitution), corrected further by Addendum 2 §2.2. Nothing was appended: the entries
exist, and appending a duplicate would violate append-only.

> **Correction to the brief's §6, measured:** the expected red table says *"C1, C6
> passing"*. C6 passed. C1 did not, and could not: C1's own definition (§2) requires
> `GET /state → pending_count: 1`, and `pending_count` is added by S4 in this session. Red
> before the repair was therefore **C1, C2, C3, C4, C5, C7 failing; C6 passing.** C1's red
> was exactly one absent field; `admitted: true`, `n: 1` were already correct. The probe
> was not loosened to match the brief's parenthetical.

## 2. The decision as implemented

`screen` is a serving predicate, not a display flag. One authority, `src/screen.js`:

```js
const SERVABLE = new Set(['passed', 'released']);

function screenOf(node) {
  if (!node || node.screen === undefined || node.screen === null) return 'passed';
  return node.screen;
}

function isServed(node) {
  return mayServeContent(node);
}

function mayServeContent(node) {
  return SERVABLE.has(screenOf(node));
}
```

`GET /nodes` (FACE) and `GET /recall` (KERNEL) both import it. The local `isServed()` copy
in `src/ghost_face.js` is deleted; no second boolean survives.

| Rule | Where |
|---|---|
| S1 — content leaves only through a screened node | `src/screen.js`, imported by both services |
| S2 — pending visible as pending, no content, split counts | `GET /nodes`: `total, passed, pending, released, served_count, pending_count, offset, limit, nodes[]`; each node carries `screen` |
| S3 — `/recall` returns records, never text, never 404 | `content: null`, `served: false`, `reason: 'unscreened'`, `content_withheld: true`, `screen` present |
| S4 — no door reports a total that excludes pending | `pending_count` on `/state`, `/nodes`, `/nav`, `/recall`; `served_count`/`pending_count` on `/verify` |
| S5 — `config/clf.json` gets a dated addendum | `_addenda[0]`, appended; no sealed string edited |
| S6 — QC disposition by mode (Addendum 1) | `src/prefilter.js`: `pass: qcMode !== 'block'` when the classifier is unreachable; block mode holds under `gate:'QC'`, `disposition:'classifier_unavailable'` |

## 3. The six assertions, red then green

Red, before any `src/` edit (unedited console output, abridged to the six):

```
FAIL  C1  benign sentence admitted; /state n=1 pending_count=1
         got: {"admitted":true,"screen":"pending","n":1}
FAIL  C2  /nodes total=1 pending=1 screen=pending, no content key
         got: {"total":0,"content_key":false}
FAIL  C3  /recall count=1 content=null served=false reason=unscreened
         got: {"count":1,"content":"The quarterly audit found three invoices that were never approved by finance."}
FAIL  C4  the 6-word fragment appears nowhere in the /recall body
         got: {"fragment_present":true}
FAIL  C5  /verify n === served_count + pending_count
         got: {"n":1}
PASS  C6  legacy node with no screen key is still served by both doors
FAIL  C7  block mode + no classifier: held at QC, nothing admitted, text held verbatim
         got: {"admitted":true,"n":1,"nodes_total":0,"recall_count":0,"text_verbatim":false}
Passed: 1  Failed: 6  Total: 7
```

Green after the repair:

```
PASS  C1  benign sentence admitted; /state n=1 pending_count=1
PASS  C2  /nodes total=1 pending=1 screen=pending, no content key
PASS  C3  /recall count=1 content=null served=false reason=unscreened
PASS  C4  the 6-word fragment appears nowhere in the /recall body
PASS  C5  /verify n === served_count + pending_count
PASS  C6  legacy node with no screen key is still served by both doors
PASS  C7  block mode + no classifier: held at QC, nothing admitted, text held verbatim
Passed: 7  Failed: 0  Total: 7
```

## 4. The C1 gate — 8 of 9, A7 alone

The probe is unmodified and runs on a throwaway copy of `src/` + `config/` (the probe's own
method). **Mode is now load-bearing**, because S6 makes block mode refuse to admit anything
when no classifier is running. Both runs are reported; neither is adjusted.

**Advisory mode (the §5 definition-of-done run):**

```
A1 PASS  A2 PASS  A3 PASS  A4 PASS  A5 PASS  A6 PASS
A7 FAIL  {"admitted":false,"held":true,"gate":"Q","reason":"quarantine_quarantine","disposition":"gate_Q"}
A8 PASS  A9 PASS
Passed: 8  Failed: 1  Total: 9   exit 1
```

A7 is F2, named and left red by design — C2b, not this session. The Q gate was not touched.

**Block mode (the live `config/clf.json`, the S6 consequence):** `4 of 9` — A1, A5, A6, A9
pass; A2, A3, A4, A7, A8 fail. With no classifier and `mode: "block"`, nothing is admitted,
so there is no node to read back and no chain to verify. That is S6 working as written, and
it is the product consequence Addendum 1 requires be stated plainly: **on a phone with no
classifier and `mode:"block"`, nothing is admitted.** A build that wants admission sets
`advisory`, and that choice is now visible in config rather than hidden in a code comment.

## 5. The numbers §6 asks for

```
red before fix:    C1 C2 C3 C4 C5 C7 failing   (C6 passing)
green after fix:   7 of 7   (C1..C6 advisory; C7 block)
C1 probe re-run:   8 of 9   (A7 sole failure - F2), advisory mode, probe unmodified
C1 probe, block:   4 of 9   (A1 A5 A6 A9) - S6 consequence, reported, not a pass
recall of pending: content=null served=false reason=unscreened content_withheld=true screen=pending
/nodes:            total=1 passed=0 pending=1 served_count=0 pending_count=1   (was total=0)
/state:            n=1 served_count=0 pending_count=1
/verify:           n=1 served_count=0 pending_count=1
/quarantine:       item carries status=held, gate=QC, disposition=classifier_unavailable
legacy node:       screen absent -> screenOf 'passed' -> listed and content served
```

`git diff --stat` for the repair (probe excluded; it is its own commit):

```
 config/clf.json       |  13 +-
 src/ghost_face.js     |  40 +++--
 src/ghost_kernel.js   |  49 ++++--
 src/prefilter.js      |  12 +-   (Addendum 1, committed separately)
 src/screen.js         |  31 +++    (new)
 5 files changed
```

`node --check`: clean on `src/screen.js`, `src/ghost_face.js`, `src/ghost_kernel.js`,
`src/prefilter.js`, `tests/e2e/c2_screen_contract_probe.js`. `config/clf.json` parses as JSON.

## 6. Regressions, including one that the addendum invalidates

- `node tests/regression/run.js` — **19 passed, 0 failed.** The scratch end-to-end path,
  every FACE and KERNEL route, still works.
- `node tests/regression/prefilter_failopen.js` — **4 passed, 1 failed.** The failing line is
  the first one:

  ```
  FAIL  block mode + classifier unreachable: sentence passes (fail-open)
        Expected values to be strictly equal: false !== true
  ```

  That assertion pins exactly the behaviour Addendum 1 withdraws. **It was not edited.**
  Editing it would be changing an assertion to fit a decision, and the decision is the PM's
  to record. It needs a dated amendment citing BRIEF 005 Addendum 1 before merge. This is a
  finding, not a repair.

## 7. Limits — what this does not show

- **Still no classifier on this host.** No node has been screened. The probe proves the door
  behaves, not that the screening is correct.
- One sentence per class, both modes. Not a sample, not a rate.
- C6's legacy node is patched into a scratch `state.json` by the probe; real legacy nodes in
  a live `data/` directory were not exercised.
- `/rescreen`, `/quarantine/release` and the Taotie path were not exercised in either mode.
  `/rescreen` now inherits S6: with block mode and no classifier it would quarantine pending
  nodes rather than pass them. That consequence is reasoned, not measured.
- `ui/ghost_api.js` and `scripts/ghost_verify.js` read the old `/recall` and `/nodes` shapes
  and were not updated or tested (out of scope, §4). `/recall` now returns `content: null`
  for pending nodes; any UI that assumes a string will need its own look.
- The real `data/` directory was left absent, exactly as found at base; every probe run used
  scratch copies under `os.tmpdir()` and removed them.

## 8. Negative-result protocol

**Not used.** The gate was met: 8 of 9 with A7 alone red, without moving a threshold, a gate
pattern or a sealed string.

---

## Appendix A — Addendum 1 (S6), measured; code committed separately

Per the addendum's own instruction, the S6 code change (`src/prefilter.js`) is its own
commit whose message cites the addendum. It was measured in the same session.

| Mode | Classifier unreachable | Result, measured |
|---|---|---|
| `advisory` | yes | admitted, `screen:'pending'`, `/state n=1 pending_count=1`, content never served |
| `block` | yes | `admitted:false held:true gate:'QC' disposition:'classifier_unavailable'`, `/state n=0 pending_count=0`, text verbatim only through `/quarantine` (`status:'held'`, `gate:'QC'`) |

C7 above is that measurement in one assertion. The C1 block-mode run (4 of 9) is the same
fact at the integration level.
