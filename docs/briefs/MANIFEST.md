# Brief and corpus manifest — rev 2

**This file is a live index, not a sealed artifact.** It is corrected in place when reality changes; the sealed briefs it points at are append-only. Every hash below was computed by **fetching the file back from `main`** and hashing those bytes.

Rev 2 — 2026-11-24. The sealed rev-1 files could not be moved into this repository byte-for-byte, so four of them are **re-issued here** instead. A re-issued file's hash is a fact about these bytes, not a claim about the old ones, and identity is established by reproduction where it matters.

## 1. Landed and verified

| Path | Bytes | SHA3-512 | Provenance |
|---|---|---|---|
| `audit/run_calibration.js` | 7,236 | `c75d66f4d9059a5fd669f508cd79a2f3dd012274ef579ee618929cb62477aaf73a54a8d8c29886a5bf7a6d9abfbc543c199fe0d62e8ad170beef286f2d92f975` | **byte-identical to rev 1** — same hash as the sealed original |
| `audit/corpus.js` | 14,188 | `3abffe1bbfc12ec9950eee7fba7f8493346ec4202b5d2ab79824c792c41c5f9378e428dfa6299cf38eb35071d1ea72ab0dedb301516a78dcfaef21e3d962b565` | rev 1 items carried over verbatim; +243 B provenance header. **22 of 22 item strings verified byte-identical**; items-only digest `582bd503b183cbf506482b9f623874d2` on both sides |
| `docs/briefs/BRIEF-006-C3-ccv4-measurement.md` | 16,019 | `1c9ad67c07e83e8470228a002222bc3e1e8ec81f1b548b066fbdf562db78c2e29b90292d80359edc4e18c1601f91eed041628c3c5026a4503a5b82c5e4290a5b` | rev 2: rev-1 body + Addendum 2 (reseal) |

**What identity means for each.** The harness is byte-identical, so nothing is claimed. The corpus is not, and cannot be: its **items** are the only thing the numbers depend on, and they are provably identical, so the μ table must reproduce. If C3's §0 reproduction disagrees on any line, that disagreement is drift and must be reported, never absorbed.

## 2. Still outside the repo

| Path | Bytes | SHA3-512 | State |
|---|---|---|---|
| `BRIEF-005-C2a-screen-contract.md` | 16,287 | `f62c8e82d774c8d92f93bb90d270cfef53cd668fdeeec62e16a8f1a9b920190dd29592b07ee7bd2438fd24869aedd412626cf87b3023ed7ee40bf5bff6388075` | **readable as a document** (PM, `01a20b6c`). C2a can run from it. Not yet committed here. |
| `BRIEF-007-C5-system-sanity.md` | 8,035 | `a4ef3d99cedf7e90f218560186d56b4d4b3405a3626d1111955589831451f3146a9031d24a619f5224c232231711bd638807d0174d9934d87a57a516dcafa093` | not runnable yet; C5 waits on C2a. Re-issue when it is needed, not before. |
| `BRIEF-003-integration-test.md` (rev 1) | 7,414 | `3f8aacccc4a9cb29d6aaf8c928e3b501be588d1330524b3a7a1331fdf09a20ed581b2c4a02dbdec5c9aa4beed6422e53b65bf1e9777fcfdd61bd7585cfed71b2` | **void.** Superseded by rev 2. Kept as record only. |
| `BRIEF-003-rev2-ghost9-combined.md` | 10,888 | `4c8591d7bc9c018ba692d3c6b8e53d4861c56e600ac3c194eea1fc5642ff4f72df662f2da565c3a0bde1bc68f081b1ed3fa448be00bb714e2ab53a3303870319` | record of the brief the C1 probe reconstructs. Not needed to run C2a or C3. |
| `BRIEF-004-C0-repo-split.md` | 9,632 | `4dcf26e06bd5458ff948820fcb942f9a088fa66c09c1e72d5cf8a8db5cfad795b4302d93933c04146ef07c4991fa14446d3669ca8419ce741316c0e0ad987c23` | executed. Record only. |
| `BRIEF-004b-C0b-populate-ghost9-code.md` | 6,100 | `4b602f41586c039b002c9e127b87df7b6ce622a6569ce1ae682837619b50ace96198e6ab7f99482406364d71e938fbd9f076dca9b5f11b6cd01e3267c61d29ef` | executed. Record only. |

## 3. Path correction, and why it matters

Earlier versions of this manifest sent the corpus and harness to `tests/audit/`. That was wrong: `run_calibration.js` resolves `../src/coherence_calculus.js` from its own directory, so `tests/audit/` resolves to `tests/src/` and the harness throws on load. They live at **`audit/`**, which is what the file assumes and what Brief 006 says. C3's deliverable is therefore `audit/cc_v4_audit.js`.

## 4. What this file is not

It is not a brief. It carries no scope, no acceptance table, and no permission to change `src/`. Landing these files is a records task: no repair, no config change, no `src/` edit.
