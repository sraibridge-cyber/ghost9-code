> **Implementation notes — not the issued brief.** The authoritative
> `BRIEF-005-C2a-screen-contract.md` is held by the PM: 16,287 bytes, 217 lines, SHA3-512
> `f62c8e82d774c8d92f93bb90d270cfef53cd668fdeeec62e16a8f1a9b920190dd29592b07ee7bd2438fd24869aedd412626cf87b3023ed7ee40bf5bff6388075`
> (Calibration Record 001 §16.2). **Where this file differs from the issued brief, the
> issued brief governs.**
>
> What this is: the implementing session's independent reconstruction, written when no
> brief was present in the repository, and kept under §16.2(2) because its reading of
> A3/A9 is sound. What it is not: an issued document. It carries no PM authority and must
> not be cited as BRIEF 005.
>
> Divergences known at the time of writing: this version assumes the A3 amendment of
> 2026-11-24 is in force (probe `dd5afca9…`) and sets the gate at 8 of 9 with A7 red.

# BRIEF 005 (reconstruction) — C2a: the screening contract (F1 + F3)

**Complex System Sanity Labs** · reconstructed 2026-11-24 by the implementing session — **not issued by the PM**
**Session:** C2a — one session, one re-seal, one honest result
**Target:** `sraibridge-cyber/ghost9-code` @ `ed7cfff`, probe re-frozen at `dd5afca9…`
**Predecessor:** C1 — red, 6 of 9 · `docs/validation/C1_INTEGRATION_PROBE_2026-11-23.md`
**Authority for the decision:** Calibration Record 001 §8.3, §11.1(b), §13.4

---

## 1. Model

Primary **Solar Pro 4** — unmetered (0×), and the job is exact rather than exploratory:
two files, one predicate, one frozen harness as the gate.
Fallback **DeepSeek V4.1 Flash** (3×), if Pro 4 is not in the picker. It can do the job;
it costs 3 h. **The picker is the authority on what is available. Do not infer the answer
from this brief.**

## 2. Usage accounting

One session. Pro 4: **0 h**. Flash: **3 h**, leaving 27 of a 30 h day if the day is untouched.
What remains on the day is not visible from inside the run; the app's meter is the record.
Overrun: a second session bills again (0 h / 3 h). **Stop at 55 minutes or at the bundle
result, whichever comes first,** and report what is unfinished rather than opening a
second file to finish the first.

## 3. Scope

### In

1. **One predicate, one authority.** Exactly one exported function decides whether a
   node's *content* may be served. Both `GET /nodes` (FACE) and `GET /recall` (KERNEL)
   call it. No duplicated boolean, no second copy of the rule, no default buried in a
   filter expression.
2. **`/nodes` lists every node in `state.json`.** Screened or not. `total` counts them all.
   Metadata always: `hash`, `screen`, `tier`, `mu`, `vertex`, `ts`. `content` only when the
   predicate allows it.
3. **`/recall` obeys the same predicate.** A non-servable node may be returned as a
   *record* — `hash`, `screen`, `tier`, `mu`, `vertex`, `ts` — with `content` absent and
   `content_withheld: true`. It must not return the text.
4. **`/recall` reports and filters on `screen`.** Each result carries its `screen`.
   `?screen=` filters, and **the default is servable-only**, so an existing caller cannot
   read pending text by omission.
5. **`/quarantine` unchanged.** Held text stays retrievable verbatim. Store-don't-propagate
   is not the rule this brief changes; A6 must stay green.
6. **One screening status, set at ingest.** `classifier_unavailable` is recorded as its own
   status (UNKNOWN), not folded into `passed` and not left as an unexplained absence.
   **Admission behaviour does not change in this session.**

### Out

- **F2 / A7.** `src/gate_quarantine.js` and the `"tell the operator"` pattern. No diff in
  that file, none in any Q list. **A7 stays red by design** — it is C2b.
- **CC, τ, `config/thresholds.json`, `config/cc_v4.json`, `config/clf.json`.** No threshold
  moves (Calibration Record 001 §8.1).
- **Whether unscreened text should be admitted at all.** `clf.json` in `block` mode says
  unscreened text is *held*; the code admits it as `pending`. That is a real violation of
  the 28 Oct decision (Record §11.3) and it is **not this brief**: holding unscreened text
  turns the classifierless phone build into a total rejector. That is Kyle's decision, not
  a patch.
- `mergeCluster`, `taotie`, `spectral_graph`, `prefilter.js`.
- No new dependency, no `npm install`, no network, no new route.

## 4. Definition of done

1. The predicate exists once and is imported by both services.
2. `tests/e2e/c1_integration_probe.js` is **unchanged** — sha256 still
   `dd5afca928e8fe2b9fcc1ef3d1a5f57745c13fb53092f5efc1ab28dbe31fcf37`. If it changed, the
   result does not count.
3. `docs/validation/C2A_SCREEN_CONTRACT_2026-11-2X.md` — freeze table, per-assertion
   results, `git diff --name-only`, the predicate quoted in full, and the negative-result
   sentence from §7 either used or explicitly not used.
4. Probe re-run in a throwaway copy: **8 passed, 1 failed (A7), exit 1.**

## 5. Freeze conditions — record before touching code

| Item | Value |
|---|---|
| Commit | `ed7cfff` |
| Node / npm | v26.13.1 / 11.20.0 |
| Dependencies | `npm ci --omit=optional` — 7 packages |
| `onnxruntime-node` | absent |
| `better-sqlite3` | absent |
| Classifier (127.0.0.1:7768) | not running (`ECONNREFUSED`) |
| Probe | `dd5afca928e8fe2b…` (amended 2026-11-24; see C1 Addendum 1.4) |
| `config/clf.json` | `8628f87bd58ec6f2…` — mode `block`, threshold 0.007265 |
| `config/thresholds.json` | `6701f7f843263368…` |
| `src/prefilter.js` | `6d31576fbf008dfe…` |
| `src/ghost_face.js` | `b08a937e72b5112c…` |
| `src/ghost_kernel.js` | `abc3245ac480add6…` |

## 6. Acceptance criteria — fixed before the run

Pass is **8 of 9**, A7 alone red. Each of the following is a fail with a named cause:

| Result | Reading |
|---|---|
| **9 of 9** | the Q gate was touched. **Revert.** |
| **7 of 9 with A9 red** | fail-open was chosen — `screen` set to `passed` when the classifier is absent. That is the violation Record §11.3 names. **Revert.** |
| **7 of 9 with A3 red** | content was withheld but the node was not reported at all; the predicate is being used to hide, not to mark. |
| A2, A5, A6 or A8 red | the change reached the admission path or the chain. **Revert.** |

Any diff outside `src/ghost_face.js`, `src/ghost_kernel.js`, one new file under `src/`,
and `docs/validation/` is a fail regardless of the score.

## 7. Negative-result protocol — drafted before the run

> If this session cannot make A4 and A9 green together without moving the Q gate or the
> admission decision, then the screening contract has no implementation at `ed7cfff`
> smaller than a policy decision, and C2a returns to Kyle as a decision rather than a repair.

## 8. What a green result will and will not mean

**Will:** one predicate governs both doors; an unscreened node is visible as a record and
unreadable as text; nothing else moved.

**Will not:** that the screening is correct. There is still no classifier, so no node has
ever been screened. It means the door behaves.

The trap to watch: if A4 goes green only because `/nodes` stopped filtering *and* serves
content, A9 will catch it — same node, same text, same query. The pair is now a
discriminator, not two independent checks. That is the whole reason A3 was amended.

## 9. Sovereignty check

Node standard library only. No package, no build step, no network outside loopback,
deterministic inputs, zero cost. One new `require` between two files already in the tree.
