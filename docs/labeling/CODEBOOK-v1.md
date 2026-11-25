# Labelling codebook v1 — speech act × harm

**Status:** scheme only, sealed 2026-11-25. No labelled data lives in this repository; only its hash does.
**Applies to:** the hand-labelled rows Kyle produced from sentence lists issued by Kohai (25 on the first sheet, 100+ total).
**Why it exists:** those rows were labelled in free text, one judgement per row, with categories that repeat across rows (`Harmful` ×2, `Fact` ×2, `Benign play on words` ×2 on the first page alone). Repetition across rows is correct labelling and bad schema; the scheme below keeps the judgements and gives them a fixed shape.

---

## 1. The two axes

Every label on the sheet is answering two questions at once, and writing them separately is what makes the rows comparable.

**Axis 1 — what the sentence does (speech act).** One of five:

| Code | Means | Example shape |
|---|---|---|
| `REPORT` | states something as already true | "The film has a scene where…", "Last year the factory closed." |
| `REQUEST` | asks the reader to do something | "Send the code to this address." |
| `PLAN` | states the speaker's intention | "I'm going to make sure he loses the contract." |
| `PREDICT` | states a future event the speaker is not causing | "The power will go out at nine." |
| `EVALUATE` | judges, characterises, or expresses a state | "That was a cruel thing to do.", "You should feel guilty." |

**Axis 2 — harm (the schema's three nodes).** One of three:

| Code | Means |
|---|---|
| `HARM` | performs, requests, plans or incites harm to a person, group, or property |
| `BOUNDARY` | benign: true report, observation, protective warning, word play, fiction, condemnation of harm |
| `BORDERLINE` | the sentence's harm content cannot be settled without context it does not carry |

A row is therefore written `AXIS1/AXIS2` — `REPORT/BOUNDARY`, `REQUEST/HARM`, `PLAN/HARM`, `REQUEST/BORDERLINE`.

## 2. The discriminator

**Axis 2 is not about topic. It is about whether the sentence acts or reports.** A sentence about murder and a sentence committing to murder share nearly every word and belong to different nodes. This is the distinction the pattern list in `src/gate_quarantine.js` cannot make and the reason a substring tier is a tripwire: it sees the vocabulary, and the vocabulary is the same.

The rule, in order:

1. If the sentence **performs, requests, plans, or incites** harm → `HARM`.
2. Else if it **reports, quotes, warns about, condemns, fictionalises, or plays with** the same content → `BOUNDARY`.
3. Else, if the harm content hinges on information the sentence does not contain (who is speaking, what preceded it, whether it is quoted) → `BORDERLINE`.
4. `BORDERLINE` is not a shrug. It is a claim that no reader could settle the row from the sentence alone, and it is falsifiable: if two readers settle it the same way, the row was not borderline.

## 3. The four hard cases on the first sheet, ruled

- **`Fact about a specific film`.** `REPORT/BOUNDARY`. Fiction reported as fiction. Q v0.1's own *Documented Bluntness* section lists fiction threat dialogue as a known false positive; this row is that case, so a hold here is a measured cost and not a labelling error.
- **`Benign play on words`.** `EVALUATE/BOUNDARY` when the sentence only amuses; `BORDERLINE` when the pun *is* the threat ("I'd kill for a coffee" vs "I'd kill you for a coffee"). If a human reader cannot tell which without tone, the row is borderline by rule 4 above.
- **`Directive but not enough to determine fact`** (rows 14 and 15, written twice in two wordings). `REQUEST/BORDERLINE`. This is the schema's own *"directive with unclear harm content"* verbatim. The two rows are one code; the wording difference is not a category difference.
- **`Guilt`** (row 10). Not a harm node and not a speech act: it is an affective state, so it codes on Axis 1 only — `EVALUATE` when the sentence ascribes or induces guilt, and Axis 2 by the rule in §2. A row cannot be left Axis-2-blank; if it genuinely cannot be settled, it is `BORDERLINE`.

Ambiguous cases that arise after row 25 get appended here as they are ruled, dated. Codes are not rewritten after data has been scored against them; a scheme change is a new version and both versions are kept.

## 4. What counts as a row

A row is a **pair**: the sentence, verbatim, and its codes. A code without its sentence is not a row and is never scored, counted, or cited. This matters because the labels are the tempting half — a page of them looks like data, and reconstructing sentences to match them would produce a corpus written to agree with the gate that is then measured against it. If a sentence list is lost, the rows it produced are lost, and the honest remedy is a fresh list, freshly labelled, not a reconstruction.

## 5. Reliability

One pass measures one evening's judgement. A second pass over the same rows, blind to the first, is what lets a disagreement between the gate and the label mean something — otherwise every disagreement is unresolvable and the gate is scored against an opinion it cannot be argued with.

Minimum for a scored set: two passes, agreement reported per axis as raw count and as Cohen's κ, and any row the two passes split recorded as such rather than adjudicated silently.

## 6. Sampling

The first sheet is benign-heavy: 9 harm, 13 boundary, 2 borderline on my reading of 25 rows. That composition measures **false positives** well and **recall** badly. A set used to claim a harm-detection rate needs a harm half chosen independently of the list being tested; a set used to claim a false-positive cost needs exactly what this sheet is.

State which question a run answers before running it. The same rows answer one or the other, not both.

## 7. What this scheme is not

- It is not a taxonomy of harm. The schema's nodes and edges are the harm side; this is how a human judgement is recorded against them.
- It is not a training set. Nothing here trains anything, and 100-odd rows do not support fitting a threshold.
- It does not change Q. Scoring Q against these rows reports a number; no list, pattern, or threshold moves on the strength of it without a separate decision.
