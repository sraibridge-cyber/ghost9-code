# Labeller v3 label sets — rulings, 2026-11-25

**From:** Buff (PM) · **To:** the session that drafted `labeller_v3_label_sets_DRAFT.json`
**Base for all of this:** `ghost9-code` @ `main`, not `ghost9`. See D0.

---

## D0 — There is no spec to find, and the archive is not the place to look

`ghost9` @ `0c34b395` is the **sealed archive**. It is frozen by standing rule: never touch, never push, never select as a project. The absence of any commit after Oct 31 is not a missing spec, it is the archive behaving correctly.

`ghost9-code@main` contains **no labeller or label-set specification**. Searched the whole tree. So:

- Do not wait for a spec. It was never committed.
- Do not base anything on `ghost9`. Nothing is pushed there.
- **Use the format the repo already has**, which is `tests/batteries/prefilter_integration_battery.js`:

```js
{ name: 'harm_seed', expect: 'reject', items: [{ text: '…', context: [] }], criterion: { metric: 'reject', min: 0.8 } }
```

One file, four named sets, at `tests/batteries/labeller_v3_label_sets.js`. No `criterion` on any of the four — see D6.

## D1 — Counts: do not size to the contract suites

16 / 13 / 13 / 13 is cosmetic symmetry, not design. Size follows the question, and the question here is *does the pipeline reach harm it was not written for*, which a 13-row set can suggest and cannot measure. Wilson 95% on 12 of 13 is roughly 0.66–0.99: a ±33-point interval around a single number.

For reference, measured from `main`: the existing battery carries **91 benign, 30 harm seed, 30 paraphrase, 31 incoherent** — one more than the draft states. If a rate is wanted, add to that population; do not shrink the new set and call it a contract.

## D2 — Word salad: include structural failures, in a separate bucket

Semantic salad and structural nonsense fail at different stages. `Run walk jump.` should die at S or L; *Silently the spoon argued with a lake* is well-formed and has to die at M or the coherence layer. One bucket makes the resulting number unattributable.

Four sets become five: `salad_semantic`, `salad_structural`.

## D3 — Self-harm: yes, but it is not a harm-seed row, and Q cannot currently serve it

Two facts from the code. `src/gate_quarantine.js` has **no self-harm family**: `"kill yourself"`, `"go die"`, `"end your life"`, `"hurt yourself"` sit inside `operator_harm`, whose action is `block`. And Q's whole action vocabulary is `block` / `quarantine` — there is **no `support` action**, which the harm schema requires: *"support routes self-harm hits to a human or crisis path, not only quarantine."*

So self-harm rows would test behaviour the gate does not have. Add them as `self_harm` with `expect: 'unsupported'`, excluded from every rate until routing exists. **Adding crisis routing is a product decision for Kyle, not a battery change** — it changes what the kernel does with a sentence (hands off rather than refuses), and that is not a thing to slip in under a label set.

## D4 — Overlap: separate file, separate run. Neither on top nor in place.

- **Replacing** the existing 91/30/30/31 destroys comparability with every rate already in the record. Those arrays are what the CHANGELOG's measured numbers were produced against.
- **Adding on top** of them silently changes the denominator of rate-based criteria (`min: 0.95` on admit), so a pass could flip to fail without anyone deciding it should.

New file, own report line, existing battery untouched.

## D5 — Dev, not holdout. Not now, not after a rename.

You wrote these from the design. They are dev data by definition, and a holdout that was written by someone who knows the design is spent before its first use. `HARM_WEB_SCHEMA.md` already rules this: *"Proposed changes are scored on fresh labels only. The holdout is spent for any design that has been scored on it."*

State `DEV` in the file header and in every table that cites them. What a dev set can do is verify **mechanics** — that the battery loads, that a rejected item is stored and retrievable, that counts are reported where they claim to be. It cannot establish **quality**, and a quality number from it is two steps of self-reference deep.

## D6 — Wording: clean of the gate's vocabulary, and that sets the expectation to zero

Measured on `main` before ruling. Every one of the 55 drafted items was normalised with the module's own `normalize()` and checked against both pattern lists:

| set | items | matched by a Q pattern (v0.1) | matched by C2b's list |
|---|---|---|---|
| harm_seed | 13 | 0 | 0 |
| harm_paraphrase | 13 | 0 | 0 |
| benign | 16 | 0 | 0 |
| word_salad | 13 | 0 | 0 |

**That is the point of them, and it is also the trap.** They share no vocabulary with the list, so Q will not match them, so harm recall on these 26 harm items is **0 by construction** against Q. Any minimum-recall criterion on this set would fail today, and would keep failing after any repair that does not replace the list tier — because the set measures the thing the list cannot do.

Therefore: **no `criterion` block.** This set reports what the pipeline actually does with harm nobody wrote patterns for. Put `expected_q_recall: 0` in the header so a later reader cannot mistake it for a regression.

The abstract, nameless, method-free style is right for safety, and it biases the set in one direction worth naming: abstract harm is *easier* for an intent-based reader and *harder* for a keyword one. That is a fair test of reach, not of a keyword gate.

## D7 — Location

```
tests/batteries/labeller_v3_label_sets.js
```

Header block, above the arrays: author, date, `DEV — not holdout`, `expected_q_recall: 0`, and one line saying these are written from the design and not from labelled data.

---

## What is still wanted from Kyle, not from you

Nothing in this document blocks the draft. The two things that need a human are: whether self-harm gets a `support` route at all (D3), and whether a harm set that Q cannot reach at all is where the next repair effort goes (D6). Both are policy and neither is a file.
