> **Implementation notes — not the issued brief.** The authoritative
> `BRIEF-006-C3-ccv4-measurement.md` is held by the PM: 13,333 bytes, 169 lines, SHA3-512
> `f22d7fb4b1921056928017412931c4367328c4571bf1cfafe430c99937f749902d699ec06a643bd3d6fec85a95031a04a8da3104f82f13dd7bf35b47c2542824`
> (Calibration Record 001 §16.2). **Where this file differs from the issued brief, the
> issued brief governs.**
>
> What this is: the implementing session's independent reconstruction, written when no
> brief was present in the repository. Kept under §16.2(2). Not an issued document; do not
> cite it as BRIEF 006.
>
> **Superseded in part by §16.3.** Its §3.1 instructs the session to seal a *new* corpus.
> That remedy is withdrawn: the corpus exists as `corpus.js`
> (SHA3-512 `50cce458…b922b936`) plus `run_calibration.js` (`c75d66f4…d92f975`), and sealing
> a fresh one would break comparability with the only baseline the project has. The issued
> brief's instruction — commit both files verbatim, verify both hashes, re-run v3.2 to
> reproduce §2's numbers, then measure v4 on the same file — governs.

# BRIEF 006 (reconstruction) — C3: CC v4 measured, twice, against predictions written first

**Complex System Sanity Labs** · reconstructed 2026-11-24 by the implementing session — **not issued by the PM**
**Session:** C3 — one session, one re-seal, one honest result
**Target:** `sraibridge-cyber/ghost9-code` @ `ed7cfff`
**Predecessor:** Calibration Record 001 — the ingest gate measures length
**Runs in parallel with C2a** (different files: this brief touches no `src/` file that
C2a touches, and no file C2a touches at all except none)

---

## 0. What this session is for

Calibration Record 001 measured **CC v3.2** and found the ingest gate is a length detector:
five injected defects — a wrong number, two fabricated citations, a contradiction, and an
instruction to conceal it — moved μ by **0.000000**. `src/cc_v4.js` exists, unwired, with a
recorded holdout AUC of 0.977 against v3's 0.503, and a dev AUC of 0.638 — near chance
against handwritten nonsense.

This session answers one question and only one:

> **Is CC v4 a better measure of coherence, or a better detector of syntax?**

It does not answer whether either one can see truth. P2 and P3 below are the predictions
that say it cannot, and they are the ones most likely to be confirmed.

## 1. Model

Primary **Solar Pro 4** — unmetered (0×). The job is running a harness and reading tables.
Fallback **DeepSeek V4.1 Flash** (3×). **The picker is the authority on availability.**

## 2. Usage accounting

One session. Pro 4: **0 h**. Flash: **3 h**, leaving 27 of a 30 h day if untouched.
The app's meter, not this line, is the record of what remains. Stop at 55 minutes and
report what is unfinished rather than starting a second corpus.

## 3. Scope

### In

1. **Seal the corpus before measuring anything.** Record 001's table came from a corpus
   generated inside the measuring session and **never written to disk** (its Addendum 15.3).
   Nothing in this repository reproduces those rows, which is a defect in a project whose
   first rule is that numbers come from runs. Therefore: write
   `tests/data/cc_probe_corpus.json` and `scripts/measure_cc_predictions.js`, with a
   SHA3-512 manifest in the same shape as the model manifest, and **re-run v3.2 on the
   sealed corpus before touching v4.** Report v3's recomputed row beside Record 001's; where
   they differ, Record 001 §2 is superseded by addendum and this session's number wins.
2. **Write the predictions down before the run** — in the doc, in a table, and do not edit
   them afterwards. §6 already commits several. Add any you need; delete none.
3. **Measure v4 on the same corpus, twice:**
   - **raw** — for comparability with every number already recorded;
   - **post-prefilter** — through the five gates, `ORDER = ['L','S','M','P','Q','QC']`,
     which is the population τ actually governs (Record §12.3a; the fitted τ describes a
     population the scorer is guaranteed never to see).
   Two tables. Both reported, even where the second is degenerate because Q rejects little.
4. **Derive the tier scale with its error rates.** For each band, the false-admit rate and
   the false-reject rate on the sealed corpus. Not one Youden point — a scale with a named
   error at each cut.
5. **State the loss matrix.** Cost of admitting a fabricating or deceptive item as STM
   versus cost of routing true prose to review. Youden J assumes these are equal; Record
   §8.5 says they are not, for this system. Give the asymmetry numerically, or name who
   decides it and mark C4 blocked on that signature.
6. **Report (μ, E).** Evidence status beside coherence, per CC v4 §5. If v4 returns no
   evidence field, say so; do not synthesize one.
7. **Write the addendum proposal for `tests/batteries/taotie_empirical_battery.js` P1.1.**
   It pins `classifyTier(0.9994) === null` and `classifyTier(0.9995) === 'STM'` as
   *requirements* — requirements that encode the μ-based tier Record §8.2 retires.
   **Do not edit the battery this session.** Write the dated addendum that supersedes P1.1's
   basis, for Kyle to sign.

### Out

- **Wiring v4 into `ghost_face.js`.** The 28 Oct decision keeps v3 until v4 passes the
  pre-registered criteria. This session measures; it does not promote.
- Changing τ on either scale, `config/thresholds.json`, `config/clf.json`, `config/cc_v4.json`.
- Any `src/` edit. If a scorer bug is found, record it with the line and leave it.
- C2a's files — `src/ghost_face.js`, `src/ghost_kernel.js`.
- Fetching corpora. No network. Prose is hand-written or already in the tree.
- Concluding that a threshold should move.

## 4. Freeze conditions — record before the run

| Item | Value |
|---|---|
| Commit | `ed7cfff` |
| Node / npm | v26.13.1 / 11.20.0 |
| Dependencies | `npm ci --omit=optional` — 7 packages (`wink-pos-tagger` is required by `cc_v4.js`) |
| Live τ (CC v3.2) | 0.9430 |
| v4 τ | 0.243113850859855 (Youden J on dev) |
| `BONSAI_TAU` | 0.943 (`src/merkle_bonsai.js:18`) |
| `stm_min` / `ltm_min` | 0.9995 / 0.9998 (`config/thresholds.json`) |
| `config/cc_v4.json` | hash before the run |
| `src/cc_v4.js`, `src/cc_features.js`, `src/coherence_calculus.js` | hash before the run |
| Corpus | hash **after** sealing, recorded in the doc and in the manifest |
| Seeds | none should be needed; if any appear, record them |

## 5. Definition of done

- `docs/validation/C3_CCV4_<date>.md` containing: freeze table; corpus manifest; P1–P6 each
  answered with a number or marked not-measurable with the reason; v3.2 recomputed table;
  v4 raw table; v4 post-prefilter table; the tier scale with per-band error rates; the loss
  matrix with its basis or its owner; the (μ, E) status; the P1.1 addendum proposal; and the
  negative-result sentence from §7 either used or explicitly not used.
- `tests/data/cc_probe_corpus.json` and `scripts/measure_cc_predictions.js`, committed and
  reproducible: a second run on the same file produces identical μ.
- No `src/` change.

## 6. Pre-registered predictions — written before the run

| # | Prediction | If it fails |
|---|---|---|
| **P1** | v4 separates prose from **word-shuffled** text at AUC ≥ 0.95 on the sealed corpus. | v4's recorded 0.977 does not transfer off its own split; the repo's headline number is split-specific. |
| **P2** | v4 does **not** separate prose from **fabricated** text: AUC < 0.70. Fabrication is fluent and grammatical; syntax features cannot see it. | the premise of this queue is wrong and a syntactic scorer can carry truth. That would be the most important result in the project. |
| **P3** | v4 does **not** separate prose from **deceptive** text: AUC < 0.70. | as P2. |
| **P4** | v3.2's dose-response ladder is **flat on the sealed corpus**: |Δμ| < 0.001 from the true paragraph through the wrong number, the two fabricated citations, and the contradiction plus concealment instruction. | Record 001 §3.1 does not reproduce and is superseded. This is a structural test of the record's own central claim, run by a session that did not make it. |
| **P5** | At v4's τ = 0.2431, ≥ 70% of benign prose is admitted **and** ≥ 50% of word-shuffled text is refused. | v4 is not deployable on any reading; the 81% benign figure is worse than recorded or the discrimination is weaker. |
| **P6** | **No scorer on either scale yields a usable operating point for fabrication:** for every τ, either true prose is refused or fabricated text is admitted at > 25%. | a usable operating point exists and Record 001's central conclusion is too strong. |

A prediction that fails is the finding. **Do not reframe it after the fact.** Record the
prediction, the number, and the sentence you wrote before you saw it.

## 7. Negative-result protocol — drafted before the run

> If v4 does not separate fabricated from true prose on the sealed corpus, then no
> coherence scorer in this tree can gate truth, and the ingest gate's job is
> admission-conditioning only; the truth dimension must be carried by the provenance field,
> not by μ.

## 8. Acceptance criteria

- Every prediction in §6 answered with a number, or marked not-measurable with the reason.
- The corpus sealed, committed, and deterministic on a second run.
- No `src/` change beyond the measuring script; `git diff --name-only` reported in full.
- The P1.1 addendum written and **not applied** to the battery.

## 9. What the result does not license

A better AUC is not a licence to wire v4, and it is not evidence that the gate is safe.
v4's own specification says in its first paragraph that it does not claim empirical
validation, and its domain-to-feature mapping is the operator's unreviewed choice. If P1
passes and P2/P3 pass as predicted, the correct summary is: **v4 is a better syntax
detector, and syntax still cannot see a lie.** That is a useful result and it is not a fix.

## 10. Sovereignty check

Node standard library plus the seven packages already pinned in `package-lock.json`. No
network, no model call, no new dependency, deterministic, zero cost.
