# BRIEF 006 — C3: measure CC v4 on the same corpus, and derive the tier scale honestly

> **REV 2 — resealed 2026-11-24.** Re-issued because the rev-1 bytes could not be moved into this repository. The body below is carried over verbatim from rev 1; Addendum 2 records what the reseal changes. Rev 1's hash is superseded for *location* purposes but remains the record of what was measured on 2026-11-24.

**Repo:** `sraibridge-cyber/ghost9-code` · **Base:** `main` after C2a merges · **Branch:** `audit/cc-v4-calibration`
**Model:** Solar Pro 4 (unmetered). **Hours:** 1 session, 60 min. **Queued behind:** BRIEF 005 (C2a).
**Issued by:** Buff (PM) · 2026-11-24 · **Measurement only. No `src/` change. Nothing gets wired.**

---

## 0. Why this session exists

Kyle asked for a recalibration of the kernel. The honest answer is that **the value being thresholded does not measure what it claims**, so picking new numbers first would be fitting a threshold to a ruler that only counts words. C3 measures the alternative — CC v4, already in the tree — on the same corpus, and pre-registers what the numbers would have to look like to justify wiring it.

### Measured now, on his own corpus, at `ed7cfff` (v3.2, τ=0.943)

Reproduced in this session with `node audit/run_calibration.js` — 20 items, 4 per class, Node v26.13.1:

| Class | μ range | pass @0.943 | pass @0.9995 |
|---|---|---|---|
| GOOD (true) | 0.999900 | 4/4 | 4/4 |
| FALSE (fabricated) | 0.998906 – 0.999900 | 4/4 | 3/4 |
| CONTRADICT | 0.996869 – 0.999900 | 4/4 | 2/4 |
| INJECT (harm/deception) | 0.997912 – 0.999900 | 4/4 | 1/4 |
| NEUTRAL (filler prose) | 0.997912 | 4/4 | 0/4 |

Four structural results, none of which depend on sample size:

1. **Dose-response is exactly flat.** Inject 1, 3, then 5 defects into a true paragraph — a wrong number, two fabricated citations, then an outright contradiction plus a deception instruction — and μ stays `0.999900` at every step. **Δ = 0.000000.** The score does not move when the text becomes false.
2. **Word salad passes the ingest gate.** Pure filler words looped to length: 10 words → 0.965537 PASS; 1000 words → 0.949134 PASS.
3. **The Truth domain ignores truth.** D7 for "The cat sat on the mat" = 0.999900. D7 for "Truth, fact, evidence, verification and proof confirm this claim" = 0.999900. **Δ = 0.000000.** Absence of evidence scores the same as presence.
4. **A keyword-stuffed lie clears the constitutional bar.** `FALSE_OPTIMIZED` — 293 words, every domain keyword family, self-contradictory throughout — scores 0.999900 on all eight domains and passes **both** 0.943 and 0.9995.

That is why PostgreSQL-style threshold tuning cannot fix it, and why the earlier "raise τ to the tier floor" option was dead on arrival: at these values every candidate threshold above 0.9968 either passes everything or fails only the benign filler.

**Cause, in one line:** `computeDomainScore()` defaults a domain to **0.9997 when no keyword matches** (`coherence_calculus.js`, cases D2–D8), and D1 is a word-count ladder. The weighted geometric mean of "nothing matched" is therefore ≈0.9999. The score is a length-and-vocabulary detector with a ceiling clamp, and it punishes *mentioning* a domain's vocabulary more than it rewards truth.

**This also contradicts the spec it claims to implement.** CC v4 §3: *"Missing, stale, invalid, conflicted, and unverified observations MUST be represented as distinct statuses, not silently converted to zero, one, or a neutral value."* The 0.9997 default is that violation, at maximum severity: missing evidence becomes near-perfect evidence.

## 1. The job

Run CC v4 (`src/cc_v4.js` + `src/cc_features.js`, config `config/cc_v4.json`) over **the same corpus, unmodified**, and record the difference. Then derive, from measurement, where the tier cuts belong on the v4 scale — as a proposal with a stated method, not a config change.

**No `src/`, `config/`, or existing test is modified.** `config/cc_v4.json` and `config/thresholds.json` are read-only this session. Nothing is wired into `ghost_face.js`.

## 2. Setup

1. `npm ci` (or `npm install` if the lockfile is out of step — say which). Confirm `wink-pos-tagger` and `wordnet-db` load. Record the Node version.
2. `ls tests/data/` and report **exactly which data files exist**. Expected at least `dev_prose.json` (91) and `dev_salad.json` (31). If a holdout set exists, name it and say whether it is referenced by `scripts/calibrate_cc.js`.
3. Read `docs/review/measured-coherence.md` for the recorded baseline. Do not re-derive it before you have the data in hand.

## 3. Deliverable 1 — the comparison audit

`audit/cc_v4_audit.js`, Node stdlib + repo modules, same corpus file, same output shape as `audit/run_calibration.js`, with v3.2 and v4 side by side per item. Copy `audit/corpus.js` **unmodified** (it is the sealed probe corpus; changing an item invalidates the comparison). Print:

- per item: class, words, μ_v3, μ_v4
- per class: mean, min, max, pass rate at the module's own τ and at the constitutional value
- AUC for GOOD vs FALSE, GOOD vs CONTRADICT, GOOD vs INJECT, GOOD vs NEUTRAL — **for both versions**
- the dose-response ladder (0/1/3/5 defects) through **both** scorers
- `FALSE_OPTIMIZED` through both
- the word-salad ladder through both

## 4. Deliverable 2 — the tier-scale derivation

`config/thresholds.json` currently holds v3-scale numbers (0.9995, 0.9998) and `config/cc_v4.json` carries τ = 0.2431 with its dev AUC, TPR 0.857, FPR 0.613. Those are different rulers; the docs already say so (`TECH_DEBT.md` #6, `measured-coherence.md` decision 4).

Produce a **tier derivation table on the v4 scale**, computed from measured distributions, with the method stated before the numbers:

1. Collect μ_v4 for every dev item, by class.
2. Report the deciles of μ_v4 for prose and for incoherent, and the μ_v4 values at TPR = 0.90 / 0.95 / 0.99 with their FPR.
3. Propose `stm_min` and `ltm_min` equivalents on the v4 scale as **candidate operating points with their error rates**, never as bare constants.
4. State plainly which of these is a *measurement* and which would be a *policy choice for Kyle*. Do not write them into any config.

**Pre-registration rules, binding:**

- The dev set is for fitting; the holdout, if it exists, is evaluated **once**, and the result is reported whether it is good or bad.
- If you evaluate the holdout, write its result down before you look at it, in the validation doc, with the timestamp.
- Do **not** re-tune any feature, weight, or mapping after seeing a holdout number. The mapping in `config/cc_v4.json` is currently the operator's unreviewed choice (its own file says so) — record that caveat in every table.
- If a number is bad, it goes in the report unedited. CC v4's own §16: *"Predeclare tests and acceptance criteria. Do not reinterpret failures after the fact to preserve the framework."*

## 5. Prediction — set before you run it

These are hypotheses. The measured table replaces them, and a discrepancy is the finding.

| Comparison | v3.2 (measured) | v4 predicted | Basis |
|---|---|---|---|
| GOOD vs FALSE | 0.625 | **≈0.5, no better** | v4's features are syntactic; a fluent fabrication is syntactically perfect |
| Dose-response (0→5 defects) | Δ = 0.000000 | **still ≈ flat** | injected defects are semantic; syntax does not move |
| GOOD vs word-shuffled incoherence | — | **clearly better** | tag surprisal + capitalization; held-out AUC 0.977 recorded |
| DEV prose vs handwritten nonsense | dev AUC 0.638 (v4, recorded) | **≈0.64, near chance** | recorded; expect to reproduce, not to improve |
| FALSE_OPTIMIZED | 0.999900 PASS | **likely PASS** | keyword stuffing is invisible to v4 — but the *reason* changes: no word lists to stuff |

**The prediction that matters: CC v4 will not detect fabrication, because fabrication is fluent.** If the numbers agree, the conclusion is not "v4 is bad" — it is that **no purely text-syntactic scorer can decide whether a fluent sentence is true**, and the truth dimension has to come from provenance and evidence status, which is a data-model change, not a threshold.

## 6. Deliverable 3 — the validation record

`docs/validation/CALIBRATION_V4_2026-11-24.md`:

- The pre-registered prediction table, verbatim, above the measured one.
- Both audits, per item and per class, with Node version, commit SHA, and the `wink-pos-tagger` version.
- The tier derivation table with method and error rates.
- A **loss-matrix section**: state the asymmetric cost of a false pass (fabricated or harmful text admitted as trusted) versus a false fail (true text routed to review). Youden J treats both errors as equal; **this system does not**, and `config/cc_v4.json`'s τ was chosen by maximising J. Say so, and say what the operating point should be if FPR is controlled to a stated bound instead.
- What was not measured: harm detection (Q unchanged, no classifier), meaning-level incoherence beyond one author's dev set, and any holdout that does not exist.

## 7. Definition of done

- Both deliverable files exist and run from a clean checkout.
- `git status --porcelain` shows **no change under `src/` or `config/`**.
- The measured table appears beside the predicted one, with every discrepancy named.
- The tier table states its own error rates and is explicitly labelled a proposal.
- One commit on `audit/cc-v4-calibration`. No push without Kyle's approval.

## 8. Negative-result protocol

If `wink-pos-tagger` will not install, or `cc_v4.js` throws at any input, **stop** and write:

> *"C3 blocked at <step>. No `src/` or `config/` file was changed. The v3.2 audit stands as measured; the v4 comparison was not obtained."*

Do not substitute hand-rolled features to work around a missing dependency, and do not edit `cc_v4.js` to make it run.

## 9. Report back

1. The four structural v3 results re-measured, side by side with the numbers above. If any differ, say so first.
2. The v4 comparison, per class, and the AUC table both versions.
3. The dose-response ladder through both scorers — the single most important line in the report.
4. The tier table with error rates, marked proposal.
5. Whether the holdout existed, and if so its one-shot result.
6. `git status --porcelain` proving `src/` and `config/` are untouched.
7. One paragraph: **what the kernel should stop claiming**, if the numbers say a syntactic score cannot see truth.

## 10. Sovereignty check

Reads only. No new runtime dependency beyond `wink-pos-tagger`, already in `package.json` and already a documented doctrinal exception (`measured-coherence.md` decision 3). No network at runtime. No classifier, no model download, no vendor. Runs on Termux. ✅

---

*Sealed on issue. If the numbers argue against this plan, the numbers win — that is the point of pre-registering them.*

---

## Addendum 1 — 2026-11-24: measure on the conditioned distribution

Kyle's architectural point: **CC sits after the five prefilter gates and before SS, deliberately.** CC is therefore admission-conditioned — it only ever scores text that already cleared L, S, M, M2, P and Q. Every calibration the project owns was fitted on raw text, so the threshold currently describes a population the scorer never sees.

**§1 and §3 are amended: run the audit twice.**

- **Run A — raw corpus.** Unchanged. This is the number comparable to the ones already recorded (v3 0.625 vs FALSE, 0.9999 saturation, dev AUC 0.638).
- **Run B — post-prefilter corpus.** Push each item through `runPrefilter` in the same advisory configuration the kernel uses, and score **only what survives**. Report both tables side by side, per class, with the survived/excluded count and the gate that excluded each item.

Run B is the one that governs τ. Run A is kept only so the two can be compared.

### Predictions for Run B, set before the run

| Expectation | Basis |
|---|---|
| INJECT loses items; the other four classes are unchanged | Q blocks on list match only. The four INJECT items are written in that register, so some are expected to be caught. Nothing else in the corpus triggers a list. |
| Run A ≈ Run B for GOOD, FALSE, CONTRADICT, NEUTRAL | The prefilter barely conditions anything today, which is *why* the pipeline's depth currently changes nothing measurable. |
| Any large gap between A and B is itself the finding | It would mean the gates are already shaping the distribution, and every existing τ was fitted to the wrong population. |

**The corollary to record, whatever the numbers say:** this is a live mismatch, not a historical one. Q is about to gain a classifier tier. When it does, the conditioning becomes strong, and a τ fitted today on either raw or barely-conditioned text will be wrong in a way that will appear to be caused by the Q change. That is the failure mode this addendum exists to prevent.

### Two consequences for the tier derivation (§4)

1. **CC returns (μ, status, config version). It does not return a tier.** If `cc_v4.js` exposes a tier, report it, do not rely on it, and do not propose one. Tier is downstream policy — per subsystem, versioned, and out of scope this session.
2. **Candidate cuts are per scope.** Derive them on the conditioned distribution for the scope being configured, and label each candidate with that scope. A cut justified for the ingestion gate is not thereby justified for Taotie or for Bonsai.

### Not changed

No `src/` edit. No config edit. No threshold written anywhere. The `runPrefilter` call is read-only and runs in the scratch copy, exactly as the kernel would.

---

## Addendum 2 — 2026-11-24: the reseal, and what identity means now

Rev 1 could not be moved into this repository byte-for-byte. Rather than let C3 stay blocked on a file transfer, the corpus and harness are **re-issued** here under new hashes.

| File | Path now | Bytes | SHA3-512 | Provenance |
|---|---|---|---|---|
| harness | `audit/run_calibration.js` | 7,236 | `c75d66f4d9059a5fd669f508cd79a2f3dd012274ef579ee618929cb62477aaf73a54a8d8c29886a5bf7a6d9abfbc543c199fe0d62e8ad170beef286f2d92f975` | **byte-identical to rev 1** |
| corpus | `audit/corpus.js` | 14,188 | `3abffe1bbfc12ec9950eee7fba7f8493346ec4202b5d2ab79824c792c41c5f9378e428dfa6299cf38eb35071d1ea72ab0dedb301516a78dcfaef21e3d962b565` | rev 1 items carried over verbatim; rev 2 adds a provenance header, hence +243 B |

**Two seam facts, stated so nobody has to rediscover them:**

1. **The harness is byte-identical**, so `c75d66f4…` is both the old hash and the new one. It was transcribed exactly.
2. **The corpus is not byte-identical**, and it cannot be made so. Its **items** are copied verbatim, and the items are the only thing the numbers depend on. Identity is therefore **functional, and is proven by reproduction**: run §0's harness on `audit/corpus.js` and the μ table must come back `0.999900` for GOOD, `0.997912` for NEUTRAL, `0.949134` for the 1000-word salad, Δ = `0.000000` for the dose-response ladder. If those reproduce, the corpus is the same corpus for measurement purposes. **If any one of them differs, stop and report the differing line** — that is drift, and it means an item was not carried over faithfully. Do not adjust the expected values to match.

**Path correction, carried from `docs/briefs/MANIFEST.md`:** §3's deliverable is `audit/cc_v4_audit.js`, not `tests/audit/`. The harness resolves `../src/coherence_calculus.js` from its own directory, so a `tests/audit/` home would resolve to `tests/src/` and throw on load. One directory, one `require('./corpus.js')`.

**What the reseal does not change:** the measurement, the pre-registration, the predictions, the tier-derivation method, the loss-matrix requirement, and the refusal to write a threshold anywhere. Rev 1's numbers remain the record of what was measured; rev 2's corpus is what C3 measures on. If the reproduction in §0 does not match, that discrepancy is the first thing in the report.
