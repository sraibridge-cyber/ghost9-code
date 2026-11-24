# State of play

Last written by PM Buff: 2026-11-24, against `main` @ `fc13119` (head read from the API, not from a local clone).

This page is the single thing both roles read after `AGENTS.md`. It carries the queue, the hashes and the open findings. The long history is **Calibration Record 001**, which lives as a document outside the repo; when the two disagree, the record wins and this page gets an addendum line.

---

## 1. Where things stand

- **Source repository:** `sraibridge-cyber/ghost9-code`. Clones in seconds. Weights are excluded and pinned by `models/*/manifest.json`.
- **Sealed archive:** `sraibridge-cyber/ghost9` @ `0c34b39`. Do not touch it, do not select it as a project, do not force anything into it. It is the permanent record of the pre-split tree.
- **Last measured session:** C1 probe, `6 passed / 3 failed` (A4, A7, A9 red), probe frozen after the A3 amendment at `dd5afca9…`.
- **Repairs:** none. F1–F4 are measured and unrepaired.

## 2. Queue

| Step | Brief | State | Blocker |
|---|---|---|---|
| C2a — screening contract (F1 + F3) | 005 | issued, not run | brief bytes not in repo |
| C2b — Q holds honest disclosure (F2) | not written | specified in the record | policy call on intent vs content |
| C3 — CC v4 measured twice, on the sealed corpus | 006 | issued, not run | `corpus.js` bytes not in repo |
| C4 — threshold decision by loss matrix | not written | after C3 | needs C3's numbers |
| C5 — System Sanity as a module | 007 | issued, not run | brief bytes; needs C2a merged |
| C6 — wiring audit of the module registry | not written | queued | one session, read-only |
| C7 — the merge measured (T9's shape) | not written | queued | after C2a |
| C8 — provenance through the merge | not written | queued | needs an owner decision on where evidence lives |

## 3. The nine files that are missing

`docs/briefs/` currently holds implementation notes only. The issued briefs and the calibration corpus exist outside this repository, which is why C2a, C3 and C5 cannot start. Each must be committed byte-identically and its hash recorded in the queue row above. **Refuse any mismatch; do not retype.**

Recorded and verified on both sides as of 2026-11-24:

| File | Bytes | SHA3-512 |
|---|---|---|
| `BRIEF-003-integration-test.md` | 7,414 | `3f8aaccc…85cfed71b2` |
| `BRIEF-003-rev2-ghost9-combined.md` | 10,888 | `4c8591d7…303870319` |
| `BRIEF-004-C0-repo-split.md` | 9,632 | `4dcf26e0…e0ad987c23` |
| `BRIEF-004b-C0b-populate-ghost9-code.md` | 6,100 | `4b602f41…267c61d29ef` |
| `BRIEF-005-C2a-screen-contract.md` | 16,287 | `f62c8e82…5bff6388075` |
| `BRIEF-006-C3-ccv4-measurement.md` | 13,333 | `f22d7fb4…7c2542824` |
| `BRIEF-007-C5-system-sanity.md` | 8,035 | `a4ef3d99…6dcafa093` |
| `corpus.js` | 13,945 | `50cce458…12b922b936` |
| `run_calibration.js` | 7,236 | `c75d66f4…2d92f975` |

Full hashes are in Calibration Record 001 §18.4. Truncated forms here are for reading, not for verifying — **verify against the record, never against this table.**

## 4. Open findings, measured and unrepaired

1. **F1 — write-only kernel.** Classifier absent + `block` mode ⇒ `pass: true`, node stored `screen: 'pending'`, `/nodes` reports `total: 0` while `/state` reports `n: 1`.
2. **F2 — Q holds honest disclosure.** "Please tell the operator that the nightly sync failed" is quarantined as `gate_Q`. A content phrase doing an intent job.
3. **F3 — recall leaks unscreened content.** `GET /recall` has no `screen` filter and returns `content` verbatim.
4. **F4 — four tier definitions.** `taotie` 0.9995/0.9998 · `merkle_bonsai` 0.943/0.9995 · `coherence_calculus.evaluate` returns `pass ? 'STM' : 'LTM'` (a failed node labelled long-term memory) · fifteen `n.tier || 'STM'` fallbacks across `src/ghost_face.js` (6), `src/ghost_kernel.js` (4), `ui/ghost_api.js` (3), `scripts/ghost_verify.js` (2).
5. **CC v3.2 does not measure coherence.** Defect injection moves μ by `0.000000`; word salad passes at 0.949; D7 scores identically with and without truth vocabulary. Its own pre-registered falsifier (AUC ≥ 0.8) measured 0.503 on holdout and 0.64 on dev. **The coherence claim is withdrawn for that use by the project's own written rule.**
6. **Present but not wired.** System Sanity does not exist as a module; `spectral_graph.js` is never constructed on the ingest path; the merge carries no provenance and sets `vertex: 'PPPP'`.

## 5. Not verified by this page

- That the working tree matches `fc13119` on any given machine — read the API or run `git rev-parse HEAD` before citing it.
- That `docs/briefs/` is empty of issued briefs — that came from a session report, not from this read.
- CC v4's recorded 0.977 / 0.638 — quoted from `docs/review/measured-coherence.md`, **not re-measured**. C3 exists to re-measure them.

## 6. Next three actions, in order

1. Land the nine files, verify each hash, commit, and put the hashes in the queue rows. That converts *written* into *issued* and unblocks C2a, C3 and C5 at once.
2. Run **C2a** (BRIEF 005). Gate: 8 of 9 on the probe, A7 alone red. 9 of 9 means the Q gate was touched — revert it.
3. Run **C3** (BRIEF 006) in parallel — no shared files. Sealed corpus, v3.2 reproduced first, then v4 on the same bytes.
