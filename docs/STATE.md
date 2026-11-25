# State of play — rev 5

Last written by PM Buff: 2026-11-25. Live page, corrected in place. When this page and **Calibration Record 001** disagree, the record wins and this page gets an addendum line.

**Main:** `9f62cc7` (this page's parent; BRIEF 008 issued). **Open branches:** `audit/cc-v4-calibration` @ `5ced8f8` (measurement only, held); `fix/q-scope` @ `29e9b0a` (C2b, **unpushed**, F2). C2a merge is `bfc8cc2`.

---

## 1. Where things stand

- **Source repository:** `sraibridge-cyber/ghost9-code`. Weights excluded, pinned by `models/*/manifest.json`.
- **Sealed archive:** `sraibridge-cyber/ghost9` @ `0c34b39`. Do not touch, do not select as a project, never force into it.
- **C2a merged and verified.** Content leaves only through a screened node, from one predicate both doors import. Pending nodes are listed and never read. Block mode fails closed at `QC` when no classifier is reachable.
- **C3 measured, pushed and independently reproduced.** CC v4 does not detect fabrication: AUC `0.500`, exactly chance. It is a better contradiction detector (`1.000`) and harm-register detector (`0.938`) than v3.2. Nothing is wired.
- **F2 closed in content, not merged.** The bare phrase `"tell the operator"` is out of `operator_deception`; a request that the operator *be* told is admitted. A5/A6 unchanged. The branch is unpushed, so nothing about it is verified yet.
- **Two limits found while closing it**, both recorded and neither patched: Q's list tier is a **tripwire, not a classifier** (two paraphrases pass it), and **A8 had been passing on a race** while A7 masked it.
- **Still unrepaired:** F4 (four tier definitions), System Sanity absent, merge carries no provenance, spectral graph unreachable.

## 2. The numbers that matter, verified

Reproduced from a clean tarball at `5ced8f8`, Node v26.13.1, `npm install` exit 0:

| | v3.2 | v4 |
|---|---|---|
| AUC GOOD vs FALSE | 0.625 | **0.500** |
| AUC GOOD vs CONTRADICT | 0.875 | **1.000** |
| AUC GOOD vs INJECT | 0.875 | **0.938** |
| AUC GOOD vs NEUTRAL | 1.000 | 0.750 |
| Holdout (shuffled) | 0.503 | **0.977** |
| Dev (written nonsense) | 0.641 | 0.638 |

**At v4's own τ = 0.2431: 2 of 4 true admitted, 3 of 4 fabricated admitted, 1 of 4 filler admitted.** That threshold is not a candidate for anything. The dev distribution it was fitted to had **0 of 122 items excluded** by the prefilter, so every cut fitted today describes a population that changes when the QC tier lands.

## 3. Queue

| Step | State | Notes |
|---|---|---|
| **C2b — Q pattern scope (F2)** | **done in content, unpushed** | Branch `fix/q-scope`, two commits. A7 green. Q3/Q4 stay red as `KNOWN_LIMIT`; a list cannot separate *tell* from *need not be told* without fitting itself to the test. |
| **C2c — A8 bounded settle** | **next** | A8 compares the kernel's 2-second-polled state against the face's saved root and was green only while A7 wrote no node. Repair is a bounded wait that **fails on timeout**, matching whatever settle A3 already uses. Not a sleep, not retry-until-green. |
| **C9 — population audit** | after C2c | Every site where a term of C, R or G is filled by a constant or fallback. Read-only and enumerable. **Must precede C4.** |
| **C5 — System Sanity** | after C9 | Three-valued over populated terms, default UNKNOWN, Kleene conjunction. Brief 007 needs re-issuing with the term format folded in. |
| **C4 — thresholds** | after C9 | Per scope, one loss matrix each, on that scope's conditioned corpus. Cannot inherit τ = 0.2431. |
| **C6 — wiring audit + document sort** | queued | Registry entries: required by live code, constructed only by tests, or unreachable. Also the three-way sort of document-vs-code discrepancies. |
| **C7 / C8 — merge measured, then provenance** | queued | T9's shape first, then the data-model decision. |
| **C2d — does Q's list admit a gap mechanism** | latent | `keep X from Y` cannot be caught by any literal. Bounded gap matching would catch it at a false-positive cost that must be measured on honest prose before anything is added. |
| **C2a.2 — unknown screen values** | latent | An unknown `screen` value buckets as `quarantined`. Content handling is right; the label is loose. Unreachable today. |

## 4. Two residuals, so neither is "fixed" by mistake

1. **`screenCounts()` buckets an unknown screen value as `quarantined`.** Withheld is correct. The label would attribute a quarantine that did not happen. Unreachable while only four values are written.
2. **`screenOf()` resolves an absent `screen` to `passed` on purpose.** Legacy nodes are grandfathered as servable by decision and asserted by C6. It has the shape of an R11 violation and is not one. **Applying R11 mechanically here would make every pre-existing record unreadable and call it conformance.**

## 5. Not verified by this page

- That any working tree matches `main` — run `git rev-parse HEAD` before citing it.
- **Everything on `fix/q-scope`.** The branch is unpushed; its six Q lines, its C1 counts and A8's 3-of-3 are reported, not reproduced.
- **The UI renderer.** `ui/ghost_api.js` passes `node --check`; the new "withheld, unscreened" label in `ui/state.html` was inspected, not viewed.
- No classifier exists, so nothing has ever actually been screened by one.
- **The C1 gate's ceiling is 4 of 9 in shipped `block` mode without a classifier.** 8 of 9 and 9 of 9 exist only in `advisory`. A green advisory run is a statement about the probe, not about the product.
- The C3 pre-registration timestamp (`02:51:49Z`) is asserted in the record, not provable from the repository.

## 6. Next three actions

1. **Push `fix/q-scope`, then verify it from a fresh tarball** — read the diff, rerun the Q probe and C1 in both modes — before merging. The verdict waits for the fetch.
2. **C2c: give A8 a bounded settle that fails on timeout**, then re-run the gate in both modes. Until then, no count of the C1 gate is trustworthy, in either direction.
3. **Then C9**, the population audit, as the last brief before any threshold is discussed.
