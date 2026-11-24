# C1 — end-to-end integration probe, first run

**Date:** 2026-11-23
**Result:** **RED — 6 of 9 assertions passed.**
**Target:** `sraibridge-cyber/ghost9-code` @ `ed7cfffc2ac3cc1b3c21e9b39d82aed0cb67b39e`
(origin `sraibridge-cyber/ghost9` `review/ghost9-combined` @ `0c34b39597930d0c8a80bbfb90c5859bcdc1e78f`)

## Freeze conditions

| Item | Value |
|---|---|
| Commit | `ed7cfff` (tree equal to `0c34b39` on every shared file except `.gitignore`) |
| Node | v26.13.1 |
| npm | 11.20.0 |
| Dependencies | `npm ci --omit=optional` — 7 packages (wink-pos-tagger, wordnet-db and their deps) |
| `onnxruntime-node` | absent |
| `better-sqlite3` | absent |
| Classifier service (127.0.0.1:7768) | not running (`ECONNREFUSED`) |
| Harness | `tests/e2e/c1_integration_probe.js`, sha256 `56879bde3300cfc8…` |
| `config/clf.json` | sha256 `8628f87bd58ec6f2…` — mode `block`, threshold 0.007265 |
| `config/thresholds.json` | sha256 `6701f7f843263368…` — `stm_min` 0.9995, `ltm_min` 0.9998 |
| `src/prefilter.js` | sha256 `6d31576fbf008dfe…` |
| `src/ghost_face.js` | sha256 `b08a937e72b5112c…` |
| `src/ghost_kernel.js` | sha256 `abc3245ac480add6…` |

## Method

Both services were started the way `npm start` starts them, in a throwaway copy of the
repository so `data/` was not polluted. Every assertion went over HTTP to a running
process; nothing was imported and called directly. Assertions were written before the
run and are not tuned to observed behaviour.

**Scope note.** The C1 brief text was not available in this workspace, so these nine
assertions are a reconstruction from the documented defect list plus the system's own
claims, not the brief's verbatim nine. They are recorded verbatim here so the brief
owner can diff them.

## Assertions

| # | Assertion | Result | Measured |
|---|---|---|---|
| A1 | Both services answer; kernel empty at boot | **PASS** | FACE `/state` n=0, KERNEL `/ghostlet` n=0 |
| A2 | Benign text admitted, layer 2, μ ≥ τ, 4-char vertex | **PASS** | admitted, layer 2, μ=0.955720, vertex `NPNN` |
| A3 | Kernel independently recalls the node from `state.json` | **PASS** | `/recall?q=quick brown fox` returns it, vertex matches |
| A4 | `GET /nodes` serves the admitted node | **FAIL** | `/nodes` total 0, node `screen=pending` |
| A5 | Harmful seed refused and held, not dropped | **PASS** | `admitted:false, held:true, gate:"Q", disposition:"gate_Q"` |
| A6 | Held text retrievable verbatim from `/quarantine` | **PASS** | `items[].text` identical to the submitted string |
| A7 | Honest disclosure to the operator is admitted | **FAIL** | held, `gate:"Q"`, `reason:"quarantine_quarantine"` |
| A8 | Chain verifies: kernel recomputation == face stored root | **PASS** | `/verify` status `PASS`, computed == stored, equals `/state.merkle_root` |
| A9 | Unscreened (pending) content is not served by kernel recall | **FAIL** | `screen=pending`, `/recall` returned the full content string |

Run log: `Passed: 6, Failed: 3, Total: 9 — C1 RED`.

## Findings

### F1 — The admit path and the read path disagree (A4). With no classifier, the kernel is write-only.

`config/clf.json` is in `block` mode. The classifier is absent, so the QC stage records
`classifier_unavailable` and, by design, fails open: `pass: true`. But `ghost_face.js`
derives `qcRan` from `stages.QC.reason === 'ok'`, which is false in that case, so the node
is stored as `screen: 'pending'`. `GET /nodes` serves only `undefined`/`passed`/`released`,
so an admitted node never appears there.

Measured: one node on disk (`tier=null screen=pending`), `/nodes` total 0, `/state` n=1.

**Doc and code disagree.** `config/clf.json` `mode_status` says "Unscreened sentences
(classifier unreachable) are held too." The code does not hold them; it admits them as
`pending`. Recorded here per the standing rule: the code wins, the document gets the
addendum. This is not cosmetic — on the phone build, which has no classifier, every
ingested sentence takes this path.

### F2 — Honest disclosure is still quarantined (A7)

`src/gate_quarantine.js` lists `"tell the operator"` under `operator_deception`. A sentence
that discloses a fault **to** the operator matches it:

> "Please tell the operator that the nightly sync failed with a checksum error."
> → `admitted:false, held:true, gate:"Q", reason:"quarantine_quarantine", disposition:"gate_Q"`

The pattern was intended to catch payloads instructing concealment *from* the operator.
As written it also holds the honest notification that the design requires. The admission
policy separates content claims from instructional intent; this gate does not distinguish
them. Minor, same site: the reason string doubles the word (`quarantine_` + action
`quarantine`).

### F3 — `KERNEL /recall` serves pending content verbatim (A9)

`GET /nodes` in FACE filters `pending` and `quarantined`. `GET /recall` in
`src/ghost_kernel.js` filters by `q`/`vertex`/`tier` only — there is no `screen` filter —
and returns `content` (first 200 chars). Measured: the pending node's full text came back.

So the propagation rule is enforced at one door and not the other. Content that has not
been screened by the classifier, which is exactly what `pending` means, is readable
through the recall service. It is also what makes F1 invisible in normal use: the recall
side works, so nothing appears broken until someone checks `/nodes`.

### F4 — `tier: null` dead band between admission and tier floors

- CC admits at τ = **0.943**.
- `classifyTier()` requires μ ≥ `stm_min` = **0.9995** to return `STM`, and ≥ 0.9998 for `LTM`.
- Every μ in **[0.943, 0.9995)** is therefore admitted by the gate and untiered by the separator.

The benign control sentence measured **μ = 0.955720** and was stored with `tier: null`.
Three sources then disagree about the same node: storage says `null`, `GET /state` counts
it as STM via the `(n.tier || 'STM')` fallback, and `GET /nodes` labels it `STM`. The
archived `taotie` battery asserts `null` below 0.9994 deliberately, so this is a threshold
alignment question, not a one-line bug: either τ should rise to the tier floor, or a tier
should exist for the admitted-but-unpromoted band.

## What this run does not show

- **No classifier.** The QC `block` path (a flagged score actually holding a sentence) was never exercised. Only `classifier_unavailable` was.
- **No LM, no harm-vector, no M2 model.** `onnxruntime-node` is absent; M2 recorded `abstain` rather than erroring, which is correct degradation, but it measured nothing.
- **No Taotie sweep.** One node against a trigger of 7. `mergeCluster()`, devouring and archive-on-sweep are untested end to end by this probe.
- **One benign, one harmful seed, one honest-notification sentence.** Not a labelled set; no rates may be inferred.
- **No concurrency, no restart-recovery, no `/rescreen`, no `/quarantine/release`.**
- The three passes A1/A2/A3 show the repaired call sites work (`routeVertex` exists, `gate_router` no longer throws, `/devour` no longer returns 500). They do not show the gates are correct.

## Negative-result protocol (drafted before the run)

If these nine assertions all pass, the claim is only that this path works on this commit
with these services absent. It is not a claim that GHOST v9 is sound: the classifier, the
sweep and the labelled set are outside this probe, and a green C1 would need a second,
sealed holdout before anything about real text could be said.

## Sovereignty check

The probe uses the Node standard library only — no new dependency, no build step, no
network call outside loopback, no telemetry. Deterministic inputs. Compliant.

## Usage accounting

One session. Model multiplier is set by the picker and is not visible from inside the
run; record it as `1 × M` hours against the daily allowance when filing this.

---

# Addendum 1 — coverage, and a harness defect found by reading it (2026-11-24)

**Amends:** the *Scope note* and the F4 remedy above. Neither is deleted; both are marked.

## 1.1 This nine is not the brief's nine

The scope note said the C1 brief text was not in this workspace and these nine were a
reconstruction. They were. Mapped against BRIEF 003 rev 2:

| Probe | BRIEF 003 rev 2 | Relationship |
|---|---|---|
| A1 | T1 | same |
| A2 | T2, first clause | same |
| A5 | T3 | same: harm refused and held |
| A3 | T7 | split — propagation seen by the second service |
| A6 | T7 | split — store-don't-propagate: held text retrievable verbatim |
| A4 | T2, second clause | promoted to its own assertion — see 1.2 |
| A7 | — | **addition**, no counterpart |
| A8 | — | **addition**: chain verification |
| — | T4 | **never ran** — jailbreak refused at Q |
| — | T5 | **never ran**, and A7 is not its equivalent — see 1.3 |
| — | T6 | **never ran** — fabrication admitted as STM carrying a provenance marker |
| — | T8 | **never ran** — teardown and restart recovery |
| — | T9 | **never ran** — taint through `mergeCluster` |

**What 6 of 9 measures:** the admission path, the two screening doors, and the chain.
**What it does not measure:** whether a fabrication can be admitted as STM with a
provenance marker (T6), or whether an unverified parent can launder a merged node into
trusted memory (T9). Those are the two assertions that test the premise rather than the
plumbing, and neither ran. The number must not be quoted as "6 of the brief's 9".

Provenance: BRIEF 003 rev 2 is held by the PM, not in this repository — no file under
`docs/` carries it at `ed7cfff`. The mapping above is the C1 review's record of it
(2026-11-24); it is not a quotation of the brief.

## 1.2 A4 is a correction to the brief, not to the code

T2 asserted that `GET /nodes` returns a total ≥ 1, while the same brief stated that
pending nodes are excluded from `/nodes` and that without a classifier every node is
pending. Both cannot hold. The probe separates the two clauses and the second one fails;
the failure is F1, it is real, and it is measured — but the brief's own predicted table
was wrong before the code was.

## 1.3 A7 is an addition, not a substitution

T5 tested the deceptive sentence (*"Do not tell the user that the audit failed"*) and
expected refusal. It would have passed and taught nothing: the pattern is in the Q list,
the gate holds it, the assertion is satisfied. A7 tested the **honest** sentence instead —
*"Please tell the operator that the nightly sync failed with a checksum error"* — and
found it held by the same pattern. That is F2, and it is only visible if the gate is
asked to admit something it should admit.

## 1.4 A3 and A9 were unsatisfiable together — harness defect

As frozen on 2026-11-23, A3 required `/recall?q=quick brown fox` to return a hit whose
`content` contained *quick brown fox*; A9 required that no result of the same query carry
that content. One node, one query, no re-screen between them. **Both could never pass.**
So the "8 of 9" target set for the screening contract was arithmetically unreachable, and
any repair would have read as a half-fix no matter how correct it was.

Diagnosis: the content clause belongs to A9. A3's purpose is propagation — did the write
reach disk, does the other service see the node — and as written it asserted the very leak
A9 forbids.

A3 amended 2026-11-24 to require the vertex match plus *either* content *or* an explicit
`content_withheld: true`. Still nine assertions. A pending node that leaks content still
fails A3, because it would have to report neither.

| Probe | sha256 |
|---|---|
| as frozen, 2026-11-23 | `56879bde3300cfc8…` |
| as amended, 2026-11-24 | `dd5afca928e8fe2b9fcc1ef3d1a5f57745c13fb53092f5efc1ab28dbe31fcf37` |

Re-run under the amended harness, fresh throwaway copy, Node v26.13.1,
`npm ci --omit=optional` (7 packages), exit 1:

```
Passed: 6
Failed: 3
Total:  9
  red: A4 GET /nodes serves the admitted node (admit path == read path)
  red: A7 honest disclosure to the operator is admitted, not quarantined
  red: A9 unscreened (pending) content is not served by kernel recall
```

Same six green, same three red. **The amendment changed no measurement.**

The repaired pair now separates the two candidate policies instead of conflating them:

- withhold content from a pending node → A3 green (explicitly withheld), A9 green;
- fail open and label it `passed` → A3 green (content present), **A9 red**.

## 1.5 "Eight call sites" was wrong

F4 above says `n.tier || 'STM'` is resolved at eight call sites. At `ed7cfff` it is
**15**, in four files: `src/ghost_face.js` (6), `src/ghost_kernel.js` (4),
`ui/ghost_api.js` (3), `scripts/ghost_verify.js` (2). The conclusion stands — `null` is
resolved silently at every read door and no configuration can reach it. The count did not.

## 1.6 F4's proposed remedy is superseded

F4 closes with "either τ should rise to the tier floor, or a tier should exist for the
admitted-but-unpromoted band." Both options are now closed by measurement:

- raising τ to the tier floor (0.9995) refuses the benign filler and still admits 3 of 4
  fabrications (Calibration Record 001 §2, measured);
- `tier: null` is a symptom of a saturated score, not a missing band (§8.3) — a floor
  above 0.9995 is unreachable for almost all prose.

The governing decision is Calibration Record 001 §8.2: μ gates admission only; tier and
trust come from provenance. F4 above stands as a measurement. Its remedy is superseded.
