# Bilateral round 1 — pre-registration, 2026-11-25

**Protocol from Kyle:** the list is its own artifact, shared. Each party answers it separately. Comparison afterwards.

## The list

| | |
|---|---|
| Sentences | **500** |
| Format | flat, numbered, shuffled with a fixed seed, no categories and no answer key in the file |
| Bytes | 37,034 |
| **sha3-512** | `ffc937b3fc1154d2121b239ba14a03e46bd565d77870a33861b51c918ba85d55effcc4ad59707d9975d55bf5f35809bd4c118713130baecf1438a8c0adae0ed1` |
| Spares | 5 written, held back, not in the list |

Shuffling is deliberate: matched pairs exist in the set and must not sit next to each other, or the order itself would answer the question.

## Buff's answer sheet

| | |
|---|---|
| Sealed | 2026-11-25, **before Kyle wrote any label** |
| Bytes | 5,547 |
| Rows | 500 — number and label, tab separated |
| Counts | harmful **142**, benign **239**, unsure **119** |
| **sha3-512** | `d5f9f092120c4dfb0d15655bf2cff6dd8330de87f9719933e9c590397680a63f4fb1014073e78d7a0272a693ed63a77f3dd47e780248cf9b25aa95e44ba045ff` |

The sheet's content is not published here; only its hash is. It is revealed after Kyle's labels exist.

## Procedure

1. The list is shared. Both parties have it, with the same numbering.
2. **The AI sheet is sealed first.** Done: the hash above is committed before the human writes a label.
3. The human labels independently, in their own words, without seeing the sealed sheet. Free text is wanted, not a menu.
4. Reveal both.
5. Measure raw agreement and Cohen's κ over three classes: harmful, benign, unsure.
6. Every disagreement is listed in full and left as a disagreement. No silent adjudication, no re-reading a sentence until it agrees.

**Authority:** the human's label is authoritative for what a human reader takes a sentence to be doing. The AI's label is authoritative only for what the sentence was written to do. Where they differ, the sentence failed to carry its intent, or the intent was never clear — those are different findings and the disagreement list distinguishes them.

## What round 1 does and does not measure

**Does:** whether 500 sentences convey their intended reading to an independent human reader. A sentence labelled `harmful` that the reader calls `benign` is a sentence that does not do its job, and that matters for the corpus before any gate ever sees it.

**Does not:** measure harm detection. Nothing here is scored against `gate_quarantine.js`. No pattern, list or threshold moves on the strength of it.

**Does not:** constitute inter-rater reliability in the strict sense. The author wrote the list, so agreement is inflated by an unknown amount. The **direction** of that bias is known and upward — a stranger would disagree more, not less. Recording the direction is what keeps the number honest; the magnitude is what round 2 exists to bound.

**A note on the 119 `unsure`.** Nearly a quarter of the set cannot be settled without context by the person who wrote it. That is not a defect of the sheet; it is a property of the sentences, many of which were written to depend on who is speaking, to whom, and what came before. If the human resolves most of them, then `unsure` was the author's caution rather than a property of the sentence, and that too is worth knowing.

## Round 2, queued

100 sentences **neither party wrote**, same protocol, same three classes. That is where a real independence estimate comes from. Round 1 is a check that the corpus is legible; round 2 is a check that two minds agree about harm. They answer different questions and must not be reported as one.
