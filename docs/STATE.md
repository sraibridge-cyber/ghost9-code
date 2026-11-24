# State of play — rev 3

Last written by PM Buff: 2026-11-24. Live page, corrected in place. When this page and **Calibration Record 001** disagree, the record wins and this page gets an addendum line.

**Head:** `bfc8cc2` — merge of `fix/screen-contract` into `main` (parents `002008da` and `3131254`).

---

## 1. Where things stand

- **Source repository:** `sraibridge-cyber/ghost9-code`. Weights excluded, pinned by `models/*/manifest.json`.
- **Sealed archive:** `sraibridge-cyber/ghost9` @ `0c34b39`. Do not touch, do not select as a project, never force into it.
- **C2a is merged.** Content leaves only through a screened node, from one predicate (`src/screen.js`) that both doors import. Pending nodes are listed as records and never read. Block mode fails closed at `QC` when no classifier is reachable.
- **Repaired so far:** F1 (write-only kernel — `/nodes` shows pending), F3 (`/recall` no longer returns unscreened text), and the fail-policy violation (S6).
- **Still unrepaired:** F2 (Q holds honest disclosure, which is A7), F4 (four tier definitions), System Sanity absent, merge carries no provenance, spectral graph unreachable.

## 2. Queue

| Step | State | Notes |
|---|---|---|
| **C2b — Q pattern scope (F2)** | next, writable now | The only red assertion left in the C1 gate. Needs ≥3 assertions: honest notification admitted, imperative concealment refused with the gate named, and a paraphrase control. Without the control the repair passes by deleting the pattern. |
| **Push C3's branch** | open action | `audit/cc-v4-calibration` exists only in the C3 session's workspace and was never pushed. Until it is, the C3 numbers stay *reported* in the record and cannot be audited. |
| **C9 — population audit** | writable now | Every site where a term of C, R or G is filled by a constant or fallback. Read-only, enumerable. **Must precede C4**: a threshold signed over supplied values is fitted to the supplier. |
| **C5 — System Sanity** | after C2b | Three-valued over populated terms, default UNKNOWN, Kleene conjunction. Brief 007 exists outside the repo and needs re-issuing, with §21.3's term format folded in. |
| **C4 — thresholds** | after C9 | Per scope, one loss matrix each, conditioned corpus each. Cannot inherit `cc_v4.json`'s τ = 0.2431: it admits 3 of 4 fabrications and refuses half the true items. |
| **C6 — wiring audit + document sort** | queued | Enumerate the module registry: required by live code, constructed only by tests, or unreachable. Also carries §20.4's three-way sort of document-vs-code discrepancies. |
| **C7 — the merge, measured** | queued | T9's shape: tier, vertex, μ, parent_ids, taint marker. Measurement only. |
| **C8 — provenance in the merge** | after C7 | Data-model change; needs the owner's decision on where evidence lives. |
| **C2a.2 — unknown screen values** | latent, unscheduled | See §4. Not a defect today. |

## 3. What is verified, and what is only reported

- **Verified:** everything in C2a. I read the branch files and hashed them myself (`screen.js` `79b8a626…`, `ghost_face.js` `52b9838b…`, `ghost_kernel.js` `ea971160…`, `prefilter.js` `56370463…` unchanged, `clf.json` `f28f878c…` unchanged, C1 probe `840b8a6b…` unchanged at 11,800 B). No site still computes `pending_count` by subtraction.
- **Reported, not verified:** all of C3's numbers (§19 of the record). The branch is unpushed. Nothing in the record depends on them yet, and C4 must not be written as if they were checked.

## 4. Two residuals, written down so they are not "fixed" by mistake

**4.1 `screenCounts()` buckets an unknown screen value as `quarantined`.** Content behaviour is right — an unknown value is not in `SERVABLE`, so the text is withheld. The label is imprecise: something that quarantined nothing would be reported as quarantined. Unreachable today, because only four values are ever written (`passed`, `released`, `pending`, `quarantined`). When the screen vocabulary grows, give unknown values their own bucket rather than widening `quarantined`.

**4.2 `screenOf()` resolves an absent `screen` to `passed`, and that is deliberate.** It looks like the R11 violation — a default converting missing evidence into a good value — and it is not. Nodes written before screening existed are *grandfathered as servable* by decision (S1, and C6 asserts it), which is a compatibility policy with an explicit rationale. **A future session applying R11 mechanically will make every pre-existing record unreadable and call it a fix.** If that policy is ever to change, it changes as a dated decision with a migration, not as a conformance edit.

## 5. Not verified by this page

- That any working tree matches `main` — run `git rev-parse HEAD` before citing it.
- **The UI renderer.** `ui/ghost_api.js` passes `node --check`; `ui/state.html`'s new "withheld, unscreened" label was inspected, not viewed. Nobody has seen that card render.
- No classifier exists, so nothing has ever actually been screened by one. Every classifier-absent path is what has been exercised, not the classifier-present path.
- Behaviour of `/rescreen` and `/quarantine/release` under S6 is reasoned, not measured beyond what the C2 probe covers.

## 6. Next three actions

1. **Push `audit/cc-v4-calibration`** so C3's numbers can be verified against their own audit output. One command, and it unblocks the tier work being built on checked numbers.
2. **Write and run C2b.** The gate to close is A7: honest notification admitted, imperative concealment refused with `gate_Q` named, paraphrase control refused.
3. **Write C9** — the population audit — as the last brief before any threshold is discussed.
