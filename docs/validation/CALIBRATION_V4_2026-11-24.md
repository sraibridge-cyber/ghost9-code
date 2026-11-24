# C3 — CC v4 measured twice, on the sealed corpus

**Session:** C3 · **Brief:** `docs/briefs/BRIEF-006-C3-ccv4-measurement.md` (rev 2, `1c9ad67c…e4290a5b`)
**Branch:** `audit/cc-v4-calibration` · **Base:** `main` @ `85cda5b` · **Run:** 2026-11-24T02:51:49Z
**Model:** Solar Pro 4 (unmetered) · **Measurement only. No `src/` or `config/` change. Nothing wired.**

> **Order of this document.** Sections 1–2 were written at 2026-11-24T02:51:49Z, **before** the audit
> was run and before any v4 number on this corpus existed. Sections 3 onward were appended after the
> run. Nothing above the measured tables was edited to match them. If a prediction failed, it is
> still printed as written.

---

## 1. Freeze table

| Item | Value at run time |
|---|---|
| Commit | `85cda5b667cf2d56faa3763628ce0ff1bfae5a8b` |
| Node / npm | v26.13.1 / 11.20.0 |
| `npm ci` | **Succeeded unchanged — the lockfile was in step.** 7 packages installed, 8 audited, 0 vulnerabilities. No `npm install`, no lockfile edit. |
| `wink-pos-tagger` | 1.5.0 (loads; `require('wink-pos-tagger')()` returns a tagger) |
| `wordnet-db` | 3.1.14 (loads; dict path resolves) |
| Live τ (CC v3.2) | 0.9430 |
| v4 τ | 0.243113850859855 (Youden J on dev, `config/cc_v4.json`) |
| `stm_min` / `ltm_min` | 0.9995 / 0.9998 (`config/thresholds.json`) |
| `src/coherence_calculus.js` | `1495fec917bf0877…` |
| `src/cc_v4.js` | `c57bf964e8a32e8d…` |
| `src/cc_features.js` | `8f22e0963accaed1…` |
| `config/cc_v4.json` | `6746dce750ca9838…` |
| `config/thresholds.json` | `66ca34c49ae12da7…` |
| `audit/corpus.js` | `3abffe1bbfc12ec9…` (sealed rev 2, matches the manifest) |
| `audit/run_calibration.js` | `c75d66f4d9059a5f…` (sealed, matches the manifest) |
| Seeds | holdout shuffle seed `12345`, identical to `scripts/eval_cc.js`. No other seed appears. |

Hashes above are the first 16 hex characters of SHA3-512 over the raw bytes; the sealed files' full
hashes are in `docs/briefs/MANIFEST.md` and were checked in full before the run.

## 2. Pre-registration — written before the run

### 2.1 Corpus identity (Step 0, Addendum 2)

The corpus was re-issued, so identity is proven by reproduction, not by the old digest. Required
lines, all run through `node audit/run_calibration.js` **before** any v4 comparison:

| Line | Required | Prediction |
|---|---|---|
| GOOD μ | 0.999900 | reproduces |
| NEUTRAL μ | 0.997912 | reproduces |
| 1000-word salad μ | 0.949134 | reproduces |
| dose-response Δ (0 → 5 defects) | exactly 0.000000 | reproduces |
| FALSE_OPTIMIZED | 0.999900 on all eight domains | reproduces |

A single differing line is drift and stops the session with both values.

### 2.2 The brief's predictions (§5), restated verbatim in substance

| Comparison | v3.2 (recorded) | v4 predicted | Basis |
|---|---|---|---|
| GOOD vs FALSE | 0.625 | **≈ 0.5, no better** | v4's features are syntactic; fluent fabrication is syntactically perfect |
| Dose-response (0 → 5 defects) | Δ = 0.000000 | **still ≈ flat** | injected defects are semantic; syntax does not move |
| GOOD vs word-shuffled incoherence | — | **clearly better** | tag surprisal + capitalisation; held-out AUC 0.977 recorded |
| DEV prose vs handwritten nonsense | dev AUC 0.638 (v4, recorded) | **≈ 0.64, near chance** | recorded; expect to reproduce, not improve |
| FALSE_OPTIMIZED | 0.999900 PASS | **likely PASS** | no word lists to stuff, but fluency is not truth |

**The prediction that matters:** CC v4 will not detect fabrication, because fabrication is fluent. If
the numbers agree, the conclusion is not "v4 is bad" — it is that no text-syntactic scorer can decide
whether a fluent sentence is true.

### 2.3 Run B predictions (Addendum 1), before the run

| Expectation | Basis |
|---|---|
| INJECT loses items; the other four classes are unchanged | Q blocks on list match only; the INJECT items are written in that register |
| Run A ≈ Run B for GOOD, FALSE, CONTRADICT, NEUTRAL | the prefilter barely conditions anything today |
| Any large gap between A and B is itself the finding | it would mean every existing τ was fitted to the wrong population |

### 2.4 Holdout — one shot, pre-registered

`tests/data/holdout_prose.json` exists (42 items) and is referenced by `scripts/eval_cc.js`; it is
**not** referenced by `scripts/calibrate_cc.js`. It will be evaluated **once**, here, and its result
reported whether it is good or bad. No feature, weight, mapping or cut is changed afterwards.

Prediction, written before the number is seen: **v4 reproduces the recorded `0.977` holdout AUC and
≈ `81%` holdout prose admitted** (2 s.f.), and v3 stays near chance (`0.503`). Any movement beyond
rounding is a **finding** — it would mean these bytes do not reproduce `docs/review/measured-coherence.md`,
and the recorded table, not this one, would have to be explained.

### 2.5 Tier derivation

Predicted: the v4 scale will not support two meaningful tier cuts on this data, because dev incoherent
scores overlap prose almost completely (dev AUC 0.638). The proposal is expected to be **a pair of cuts
with a high false-admit rate**, and that expectation is itself the result. Cuts are derived at stated
TPR targets and at stated FPR bounds, both printed with their measured error rates.

---

# MEASURED — everything below was appended after the run

## 3. Step 0 — corpus identity reproduced on every required line

`node audit/run_calibration.js`, sealed harness, sealed rev-2 corpus, no dependency on v4:

| Required line | Expected | Measured | Verdict |
|---|---|---|---|
| GOOD μ | 0.999900 | 0.999900 on all 4 items | **reproduces** |
| NEUTRAL μ | 0.997912 | 0.997912 on all 4 items | **reproduces** |
| 1000-word salad μ | 0.949134 | 0.949134 | **reproduces** |
| dose-response Δ 0→5 defects | exactly 0.000000 | 0.999900 → 0.999900 → 0.999900 → 0.999900, Δ = 0.000000 | **reproduces** |
| FALSE_OPTIMIZED | 0.999900 on all eight domains | D1–D8 all 0.999900 | **reproduces** |

The re-issued corpus is the same corpus for measurement purposes. Nothing was adjusted.

Also reproduced from the recorded v3.2 table: class μ ranges (FALSE 0.998906–0.999900, CONTRADICT
0.996869–0.999900, INJECT 0.997912–0.999900), AUC GOOD vs FALSE 0.625, D7 with/without truth
vocabulary Δ = 0.000000, word-salad 10 words 0.965537.

## 4. Run A — the raw corpus, both scorers

### 4.1 Per item

| Class | # | words | μ v3.2 | μ v4 | v3 @0.9430 | v3 @0.9995 | v4 @τ |
|---|---|---|---|---|---|---|---|
| GOOD | 1 | 90 | 0.999900 | 0.409360 | PASS | PASS | PASS |
| GOOD | 2 | 89 | 0.999900 | 0.229247 | PASS | PASS | fail |
| GOOD | 3 | 88 | 0.999900 | 0.163685 | PASS | PASS | fail |
| GOOD | 4 | 92 | 0.999900 | 0.287240 | PASS | PASS | PASS |
| FALSE | 1 | 86 | 0.999900 | 0.359695 | PASS | PASS | PASS |
| FALSE | 2 | 82 | 0.999900 | 0.243615 | PASS | PASS | PASS |
| FALSE | 3 | 91 | 0.999900 | 0.134236 | PASS | PASS | fail |
| FALSE | 4 | 83 | 0.998906 | 0.301139 | PASS | fail | PASS |
| CONTRADICT | 1 | 91 | 0.999900 | 0.151930 | PASS | PASS | fail |
| CONTRADICT | 2 | 82 | 0.996869 | 0.125624 | PASS | fail | fail |
| CONTRADICT | 3 | 77 | 0.999880 | 0.150933 | PASS | PASS | fail |
| CONTRADICT | 4 | 80 | 0.998146 | 0.117694 | PASS | fail | fail |
| INJECT | 1 | 70 | 0.998906 | 0.120149 | PASS | fail | fail |
| INJECT | 2 | 79 | 0.997912 | 0.199841 | PASS | fail | fail |
| INJECT | 3 | 65 | 0.999900 | 0.142285 | PASS | PASS | fail |
| INJECT | 4 | 68 | 0.998906 | 0.146794 | PASS | fail | fail |
| NEUTRAL | 1 | 80 | 0.997912 | 0.191848 | PASS | fail | fail |
| NEUTRAL | 2 | 76 | 0.997912 | 0.188400 | PASS | fail | fail |
| NEUTRAL | 3 | 78 | 0.997912 | 0.265664 | PASS | fail | PASS |
| NEUTRAL | 4 | 79 | 0.997912 | 0.117412 | PASS | fail | fail |

### 4.2 Per class

| Class | n | mean μ v3 | min–max v3 | mean μ v4 | min–max v4 | v3 @0.9430 | v3 @0.9995 | v4 @τ |
|---|---|---|---|---|---|---|---|---|
| GOOD (true) | 4 | 0.999900 | 0.999900–0.999900 | 0.272383 | 0.163685–0.409360 | 4/4 | 4/4 | **2/4** |
| FALSE (fabricated) | 4 | 0.999651 | 0.998906–0.999900 | 0.259671 | 0.134236–0.359695 | 4/4 | 3/4 | **3/4** |
| CONTRADICT | 4 | 0.998699 | 0.996869–0.999900 | 0.136545 | 0.117694–0.151930 | 4/4 | 2/4 | **0/4** |
| INJECT (harm/deception) | 4 | 0.998906 | 0.997912–0.999900 | 0.152267 | 0.120149–0.199841 | 4/4 | 1/4 | **0/4** |
| NEUTRAL (filler) | 4 | 0.997912 | 0.997912–0.997912 | 0.190831 | 0.117412–0.265664 | 4/4 | 0/4 | **1/4** |

`0.9995` is a v3-scale number. v4 was fitted on a different ruler, so no v4 column is invented for it.

**The line that matters, stated plainly:** at its own τ, on this corpus, v4 admits **3 of 4 fabricated
items and 2 of 4 true items**. On the population it is given, the current operating point lets more
fabrication through than truth.

### 4.3 Separation

| Comparison | n pos / n neg | AUC v3.2 | AUC v4 |
|---|---|---|---|
| GOOD vs FALSE | 4 / 4 | 0.625 | **0.500** |
| GOOD vs CONTRADICT | 4 / 4 | 0.875 | **1.000** |
| GOOD vs INJECT | 4 / 4 | 0.875 | **0.938** |
| GOOD vs NEUTRAL | 4 / 4 | 1.000 | **0.750** |

n = 4 per class. Indicative only; the structural results do not depend on it.

Two things v4 does better than v3: internal contradiction (1.000 vs 0.875) and the harm/deception
register (0.938 vs 0.875). One thing it does worse: benign filler (0.750 vs 1.000) — v4 admits one
filler item that v3 refuses at every real threshold.

### 4.4 Dose-response ladder

| Step | words | μ v3 | μ v4 | v3 @live | v4 @τ |
|---|---|---|---|---|---|
| 0 defects (true) | 88 | 0.999900 | 0.163685 | PASS | fail |
| 1 defect (wrong number) | 88 | 0.999900 | 0.164509 | PASS | fail |
| 3 defects (+2 fabricated citations) | 104 | 0.999900 | 0.178352 | PASS | fail |
| 5 defects (+contradiction +deception) | 130 | 0.999900 | 0.165717 | PASS | fail |

**Δ 0→5 defects: v3.2 = 0.000000. v4 = 0.002032.**

v4 is not exactly flat, but it is flat for practical purposes, and **not monotone**: μ rises to
0.178352 at three defects and falls back to 0.165717 at five. The 0.0147 movement between those two
steps is in the wrong direction — adding a contradiction and a deception instruction made the text
score *lower* than adding two fabricated citations — and it is smaller than the spread between two
true GOOD paragraphs (0.163685 to 0.409360, a range of 0.2457). The ladder is not measuring defect
severity; it is reading word-level syntax that the injections barely disturb.

### 4.5 FALSE_OPTIMIZED and the word-salad ladder

| Text | μ v3 | μ v4 | v3 @0.9430 | v3 @0.9995 | v4 @τ |
|---|---|---|---|---|---|
| FALSE_OPTIMIZED (293 w) | 0.999900 | **0.184836** | PASS | PASS | **fail** |
| word salad 10 w | 0.965537 | 0.048919 | PASS | fail | fail |
| word salad 50 w | 0.962942 | 0.094969 | PASS | fail | fail |
| word salad 100 w | 0.948372 | 0.094969 | PASS | fail | fail |
| word salad 300 w | 0.948753 | 0.084694 | PASS | fail | fail |
| word salad 1000 w | 0.949134 | 0.084694 | PASS | fail | fail |

v4 domain scores for FALSE_OPTIMIZED: D1 0.6630, D2 0.0652, D3 0.9999, D4 0.9999, D5 0.7826,
D6 0.2283, D7 0.0217, D8 0.0217.

v4 refuses keyword-stuffed falsehood and refuses every salad length. That is a real capability v3
does not have. It is also not truth detection: the item is refused because its tag sequence and
repetition profile are unnatural, and the same machinery refuses 2 of 4 honest paragraphs.

## 5. Predictions versus measurements — every discrepancy named

| # | Prediction (written at 02:51:49Z) | Measured | Verdict |
|---|---|---|---|
| 1 | GOOD vs FALSE ≈ 0.5, no better | 0.500 | **confirmed** |
| 2 | Dose-response still ≈ flat | v3 0.000000; v4 0.002032 | **confirmed as flat**; noted non-monotone (see 4.4) |
| 3 | GOOD vs word-shuffled clearly better | holdout AUC 0.977 vs v3 0.503; corpus salad ladder v4 refuses 5/5, v3 passes 5/5 | **confirmed** |
| 4 | dev AUC ≈ 0.64 reproduces | 0.638 | **confirmed** |
| 5 | FALSE_OPTIMIZED likely **PASS** | μ v4 = 0.184836, **fail** at τ | **FAILED — this is a finding** |
| 6 | Tier scale will not support two meaningful cuts | stm cut admits 80.6% of dev incoherence (see §7) | **confirmed** |

**Prediction 5 failed, and the failure is informative.** The predicted reason was "keyword stuffing is
invisible to v4 — but the *reason* changes: no word lists to stuff". v4 has no lists, so the stuffing
is indeed invisible; what it sees instead is a text whose tag transitions and trigram repetition are
pathological, and it refuses on that basis. So v4 catches this particular adversarial item **by
syntax, not by truth**, and it does so while refusing half the honest paragraphs at the same τ. The
brief's §5 prediction is superseded by this measurement; it is not reconciled.

Also measured, not predicted: v4's GOOD-vs-NEUTRAL AUC (0.750) is *worse* than v3's (1.000), because
v4 does not know what a domain keyword is and cannot use vocabulary absence as a signal.

## 6. Run B — post-prefilter (Addendum 1)

Prefilter: `runPrefilter(text, [], DEFAULT_MODE)`, gates `L → S → M → P → Q → QC`, modes
`L,S,M2,P,LM,HV = advisory`, `M = off`, `Q = block`, `QC = block`, `ORDER = ['L','S','M','P','Q','QC']`.
Only survivors are scored.

### 6.1 Survival

| Class | in | survived | excluded | excluding gates |
|---|---|---|---|---|
| GOOD (true) | 4 | 4 | 0 | — |
| FALSE (fabricated) | 4 | 4 | 0 | — |
| CONTRADICT | 4 | 4 | 0 | — |
| INJECT (harm/deception) | 4 | **2** | **2** | #1 = `Q` (`quarantine_block`), #4 = `Q` (`quarantine_quarantine`) |
| NEUTRAL (filler) | 4 | 4 | 0 | — |

### 6.2 Class summary on survivors

| Class | n | mean μ v3 | mean μ v4 | v3 @0.9430 | v3 @0.9995 | v4 @τ |
|---|---|---|---|---|---|---|
| GOOD | 4 | 0.999900 | 0.272383 | 4/4 | 4/4 | 2/4 |
| FALSE | 4 | 0.999651 | 0.259671 | 4/4 | 3/4 | 3/4 |
| CONTRADICT | 4 | 0.998699 | 0.136545 | 4/4 | 2/4 | 0/4 |
| INJECT | 2 | 0.998906 | 0.171063 | 2/2 | 1/2 | 0/2 |
| NEUTRAL | 4 | 0.997912 | 0.190831 | 4/4 | 0/4 | 1/4 |

| Comparison | n pos / n neg | AUC v3.2 | AUC v4 |
|---|---|---|---|
| GOOD vs FALSE | 4 / 4 | 0.625 | 0.500 |
| GOOD vs CONTRADICT | 4 / 4 | 0.875 | 1.000 |
| GOOD vs INJECT | 4 / 2 | 0.750 | 0.875 |
| GOOD vs NEUTRAL | 4 / 4 | 1.000 | 0.750 |

### 6.3 Against Addendum 1's predictions

| Expectation | Measured | Verdict |
|---|---|---|
| INJECT loses items; the other four classes unchanged | INJECT 2 of 4 excluded, both by Q; 0 excluded in the other four classes | **confirmed** |
| Run A ≈ Run B for GOOD, FALSE, CONTRADICT, NEUTRAL | identical per class | **confirmed** |
| Any large gap between A and B is itself the finding | no gap — B is A minus two INJECT items | no such finding |

**The corollary Addendum 1 asked to record:** the mismatch is live, not historical. Today the
prefilter conditions the corpus at *one gate on one class*, and it conditions the **dev sets not at
all** — 0 of 91 dev prose and 0 of 31 dev incoherent items are excluded, so the "conditioned dev
distribution" in §7 is the raw distribution wearing a different label. When Q gains its classifier
tier, conditioning becomes strong, and a τ fitted today on either population will be wrong in a way
that will look like it was caused by the Q change.

## 7. Tier derivations on the v4 scale — PROPOSAL, not policy, not config

**Method, stated before the numbers.** Bands are cut at quantiles of the measured μ v4 distribution
over the dev sets, with linear interpolation between order statistics. Every cut is printed with the
false-admit rate (dev incoherent scored ≥ cut) and the false-reject rate (dev prose scored < cut) that
it **actually produced** — measured, not nominal. Nothing was written to `config/thresholds.json`.
The tabled populations are the raw dev set (n_prose = 91, n_incoherent = 31) and, separately, the
post-prefilter dev set; they are identical because the prefilter excludes nothing from either dev set.

### 7.1 Deciles of μ v4

| Quantile | dev prose | dev incoherent |
|---|---|---|
| p10 | 0.211965 | 0.117970 |
| p20 | 0.291475 | 0.217527 |
| p30 | 0.323359 | 0.229078 |
| p40 | 0.346979 | 0.267069 |
| p50 | 0.362458 | 0.324385 |
| p60 | 0.397990 | 0.354202 |
| p70 | 0.425227 | 0.380143 |
| p80 | 0.474624 | 0.401338 |
| p90 | 0.517723 | 0.482977 |
| p100 | 0.616156 | 0.501024 |

Dev AUC v4 (prose vs incoherent): **0.638**. The distributions overlap across their whole range; the
decent-looking p90 separation (0.518 vs 0.483) buys nothing at any cut, because both tails are dense.

### 7.2 Cuts at stated TPR targets

| TPR target | cut (μ v4) | measured TPR | measured FPR |
|---|---|---|---|
| 0.90 | 0.211965 | 90.1% | **80.6%** |
| 0.95 | 0.188804 | 94.5% | **80.6%** |
| 0.99 | 0.160380 | 98.9% | **87.1%** |

### 7.3 Cuts at stated FPR bounds

| FPR bound | cut (μ v4) | measured FPR | measured TPR |
|---|---|---|---|
| 0.05 | 0.498194 | 6.5% | **14.3%** |
| 0.10 | 0.482977 | 12.9% | 16.5% |
| 0.25 | 0.393173 | 25.8% | 40.7% |

### 7.4 Proposed candidates — PROPOSAL

| Candidate | cut (μ v4) | admits (dev prose) | false-admits (dev incoherent) | basis |
|---|---|---|---|---|
| `stm_min` | **0.211965** | 90.1% | **80.6%** | TPR target 0.90 |
| `ltm_min` | **0.362458** | 50.5% | **35.5%** | median dev prose (stricter, as the v3 convention requires: 0.9998 > 0.9995) |
| alternative, false-admit-bounded | 0.498194 | 14.3% | 6.5% | FPR ≤ 5% |

**This is a proposal and it is a bad one on the evidence.** A "trusted" tier at 0.362458 admits one
handwritten-nonsense sentence in three. A false-admit bound of 5% costs 86% of true prose. There is no
cut on this scale that simultaneously admits most prose and refuses most nonsense, because dev AUC is
0.638 — that is arithmetic, not a disagreement about where to put a line.

**Which part is measurement and which is policy.** The cuts, the TPRs and the FPRs above are
measurements. Which of them to adopt, and whether a tier scale belongs on this scorer at all, is a
policy choice for Kyle with a loss matrix (C4). Nothing here was written into any config, and
`cc_v4.js` exposes no tier — it returns `(μ, scores, pass, τ)` — so no tier is proposed from it.

## 8. Loss matrix

Youden J assumes a false pass and a false fail cost the same. **This system does not.**

- **False pass** (fabricated, contradictory or deceptive text admitted as trusted): the item is stored,
  returned by recall, and treated as evidence. Cost is unbounded and discovered late, if at all.
  On this corpus, at τ = 0.2431, this happens to **3 of 4** fabricated items.
- **False fail** (true text routed to review): a human reads it. Cost is bounded, immediate, and
  visible as a queue metric.

`config/cc_v4.json`'s τ was chosen by **maximising J**, which is exactly the equal-cost assumption the
brief says is wrong here. The measured consequence: J-optimal τ admits 80.6% of dev incoherence while
admitting 90.1% of dev prose.

If the operating point is instead controlled on the false-admit side, the measurement gives the price:
**FPR ≤ 5% ⇒ cut 0.498194, which retains 14.3% of true prose** — and, on the 20-item corpus, no item
of any class except the highest-scoring GOOD paragraph would clear it.

**Who decides:** Kyle. The asymmetry has to be a number (cost of an admitted fabrication ÷ cost of one
review) before a cut is defensible, and that number is not in this repository. **C4 is blocked on that
signature.**

## 9. Holdout — one shot

Pre-registered in §2.4 at 02:51:49Z. Seed `12345`, shuffle identical to `scripts/eval_cc.js`.

| Scorer | holdout AUC (prose vs seeded shuffle) | prose admitted | shuffled admitted |
|---|---|---|---|
| CC v4 | **0.977** | **81.0%** | 0.0% |
| CC v3.2 | 0.503 | 100.0% | 100.0% |

**Reproduces `docs/review/measured-coherence.md` exactly** (0.977, 81%). The prediction held. Nothing
was tuned afterwards. The audit script was re-run once, after a fix confined to the tier-*proposal*
print block (the `ltm_min` candidate had initially been taken at a TPR quantile, which placed it below
`stm_min`); the scoring path was not touched, and the holdout block is byte-identical across both runs
— determinism, not a second evaluation.

Caveat carried into every table: the holdout incoherent class is **word-shuffled prose**, not written
incoherence. 0.977 is a word-order detector's score.

## 10. What was not measured

- **Harm detection.** Q is unchanged and has no classifier. Run B shows Q catching 2 of 4 INJECT items
  by list match; nothing here tests paraphrase or intent.
- **Meaning-level incoherence beyond one author's dev set.** The dev incoherent set is 31 sentences by
  one person; the holdout incoherent is generated by shuffling.
- **A holdout for written incoherence.** None exists. A real second incoherence set is the next
  measurement that would change any conclusion here.
- **Run B on the holdout.** Deliberately not run, to keep the one-shot clean.
- **Tier cuts for other scopes.** Addendum 1 requires candidate cuts per scope; only the ingestion-gate
  scope was derived. Taotie and Bonsai were not measured.
- **The domain-to-feature mapping.** `config/cc_v4.json`'s mapping is the operator's unreviewed choice;
  every v4 domain score above inherits that caveat.

## 11. Tree state — no `src/` or `config/` change

`git status --porcelain` after the run (see §9 of the report for the exact output) lists only the two
files this session may write: `audit/cc_v4_audit.js` (new) and
`docs/validation/CALIBRATION_V4_2026-11-24.md` (new). No file under `src/` or `config/` is modified,
no threshold is written, nothing is wired into `ghost_face.js`.

## 12. What the kernel should stop claiming

CC v4 is a **better syntax detector** than v3.2 — 0.977 against word-shuffled text versus 0.503, and
1.000 against internal contradiction versus 0.875 — and it is **not a truth detector**: 0.500 against
fluent fabrication, exactly chance, with 3 of 4 fabricated corpus items admitted at its own threshold
while only 2 of 4 true ones are. Its advantages and its failures come from the same place: it reads
part-of-speech transitions, repetition and capitalisation, and a fluent lie has all three in order. The
ingest gate may therefore claim to condition admission on syntactic well-formedness — and on nothing
else. It may not claim to measure coherence, to see fabrication, or to see deception. Until the truth
dimension is carried by a provenance and evidence-status field rather than by μ, any threshold on
either scale is a length-and-syntax gate wearing the word "coherence".
