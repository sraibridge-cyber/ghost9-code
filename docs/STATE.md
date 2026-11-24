# State of play — rev 2

Last written by PM Buff: 2026-11-24. Live page, corrected in place. The long history is **Calibration Record 001**; when the two disagree, the record wins and this page gets an addendum line.

---

## 1. Where things stand

- **Source repository:** `sraibridge-cyber/ghost9-code`. Weights excluded, pinned by `models/*/manifest.json`.
- **Sealed archive:** `sraibridge-cyber/ghost9` @ `0c34b39`. Do not touch, do not select as a project, never force into it.
- **Last measured session:** C1 probe, `6 passed / 3 failed` (A4, A7, A9 red), probe frozen after the A3 amendment.
- **Repairs:** none. F1–F4 measured and unrepaired.
- **The file-transfer blocker is gone.** The corpus, harness and Brief 006 are resealed into this repo (`audit/`, `docs/briefs/`) with hashes verified by fetching back from `main`. See `docs/briefs/MANIFEST.md`.

## 2. Queue

| Step | Brief | State | Notes |
|---|---|---|---|
| C2a — screening contract (F1 + F3) | 005 | **runnable now** | Brief readable as a document (PM `01a20b6c`); not yet committed here. Repo already holds the C1 probe it re-runs. |
| C2b — Q holds honest disclosure (F2) | not written | after C2a | needs ≥3 assertions incl. a paraphrase control |
| C3 — CC v4 measured twice | 006 rev 2 | **runnable now** | `docs/briefs/BRIEF-006-…md`, corpus + harness in `audit/` |
| C4 — threshold decision by loss matrix | not written | after C3 | needs C3's numbers |
| C5 — System Sanity as a module | 007 | waits | unblocked once C2a merges; Brief 007 not in repo yet |
| C6 — wiring audit of the module registry | not written | queued | read-only, one session |
| C7 — the merge measured (T9's shape) | not written | queued | after C2a |
| C8 — provenance through the merge | not written | queued | needs an owner decision on where evidence lives |

**C2a and C3 share no files and can run in either order.** C2a touches `src/screen.js`, `ghost_face.js`, `ghost_kernel.js`, `config/clf.json`. C3 touches nothing under `src/` or `config/` at all.

## 3. Reseal record — what changed and what identity means

| Path | Bytes | SHA3-512 |
|---|---|---|
| `audit/run_calibration.js` | 7,236 | `c75d66f4…f2d92f975` — **byte-identical to the sealed original** |
| `audit/corpus.js` | 14,188 | `3abffe1b…d962b565` — 22/22 item strings verified identical |
| `docs/briefs/BRIEF-006-C3-ccv4-measurement.md` | 16,019 | `1c9ad67c…c5e4290a5b` |

Full hashes in `docs/briefs/MANIFEST.md`. **The corpus is functionally identical, not byte-identical**, and that distinction is load-bearing: the μ table is the proof, so C3 must reproduce §0's numbers before comparing anything. A differing line is drift and gets reported, never absorbed.

**Correction on record:** the corpus and harness live at `audit/`, not `tests/audit/`. The harness resolves `../src/` from its own directory, so `tests/audit/` would have thrown on load. C3's deliverable is `audit/cc_v4_audit.js`.

## 4. Open findings, measured and unrepaired

1. **F1 — write-only kernel.** Classifier absent + `block` mode ⇒ `pass: true`, node stored `screen: 'pending'`, `/nodes` reports `total: 0` while `/state` reports `n: 1`.
2. **F2 — Q holds honest disclosure.** "Please tell the operator that the nightly sync failed" is quarantined as `gate_Q`. A content phrase doing an intent job.
3. **F3 — recall leaks unscreened content.** `GET /recall` has no `screen` filter and returns `content` verbatim.
4. **F4 — four tier definitions.** `taotie` 0.9995/0.9998 · `merkle_bonsai` 0.943/0.9995 · `coherence_calculus.evaluate` returns `pass ? 'STM' : 'LTM'` (a failed node labelled long-term memory) · fifteen `n.tier || 'STM'` fallbacks (ghost_face 6, ghost_kernel 4, ui/ghost_api 3, scripts/ghost_verify 2).
5. **CC v3.2 does not measure coherence.** Defect injection moves μ by `0.000000`; word salad passes at 0.949; D7 identical with and without truth vocabulary. **The coherence claim is withdrawn for that use by the project's own written rule.**
6. **Present but not wired.** System Sanity has no module; `spectral_graph.js` is never constructed on the ingest path; the merge carries no provenance and sets `vertex: 'PPPP'`.

## 5. Not verified by this page

- That any working tree matches `main` — run `git rev-parse HEAD` before citing it.
- CC v4's recorded 0.977 / 0.638 — quoted from `docs/review/measured-coherence.md`, **not re-measured**. C3 exists to re-measure them.
- Whether Brief 005's document copy and its rev-1 bytes agree line for line. They were published from a read of the file, not compared byte-wise. C2a's contract does not depend on the comparison; if a dispute ever arises, the rev-1 hash in the manifest decides.

## 6. Next three actions, in order

1. **Run C2a** from the Brief 005 document. Gate: 8 of 9 on the C1 probe, A7 alone red. 9 of 9 means the Q gate was touched — revert.
2. **Run C3** from `docs/briefs/BRIEF-006-C3-ccv4-measurement.md`. Reproduce §0's μ table first; that is the corpus identity check.
3. **Write C2b** with ≥3 assertions once C2a's branch is known: honest notification admitted, imperative concealment refused with the gate named, paraphrase control.
