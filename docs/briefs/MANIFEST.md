# Brief and corpus manifest

Nine sealed files are to be landed here byte-identically. They were authored outside this repository; this manifest is the acceptance test.

**Rule (AGENTS.md R7): a mismatch is a stop, never an edit.** Do not adjust a file to meet a hash, do not retype one, and do not amend this manifest to match whatever arrived. If a hash disagrees, the session's whole report is the file name with both values side by side.

Verify with SHA3-512 over the raw bytes — `crypto.createHash('sha3-512')` in Node, on the file as it sits on disk, before any line-ending normalisation.

| # | Target path in repo | Bytes | SHA3-512 |
|---|---|---|---|
| 1 | `docs/briefs/BRIEF-003-integration-test.md` | 7,414 | `3f8aacccc4a9cb29d6aaf8c928e3b501be588d1330524b3a7a1331fdf09a20ed581b2c4a02dbdec5c9aa4beed6422e53b65bf1e9777fcfdd61bd7585cfed71b2` |
| 2 | `docs/briefs/BRIEF-003-rev2-ghost9-combined.md` | 10,888 | `4c8591d7bc9c018ba692d3c6b8e53d4861c56e600ac3c194eea1fc5642ff4f72df662f2da565c3a0bde1bc68f081b1ed3fa448be00bb714e2ab53a3303870319` |
| 3 | `docs/briefs/BRIEF-004-C0-repo-split.md` | 9,632 | `4dcf26e06bd5458ff948820fcb942f9a088fa66c09c1e72d5cf8a8db5cfad795b4302d93933c04146ef07c4991fa14446d3669ca8419ce741316c0e0ad987c23` |
| 4 | `docs/briefs/BRIEF-004b-C0b-populate-ghost9-code.md` | 6,100 | `4b602f41586c039b002c9e127b87df7b6ce622a6569ce1ae682837619b50ace96198e6ab7f99482406364d71e938fbd9f076dca9b5f11b6cd01e3267c61d29ef` |
| 5 | `docs/briefs/BRIEF-005-C2a-screen-contract.md` | 16,287 | `f62c8e82d774c8d92f93bb90d270cfef53cd668fdeeec62e16a8f1a9b920190dd29592b07ee7bd2438fd24869aedd412626cf87b3023ed7ee40bf5bff6388075` |
| 6 | `docs/briefs/BRIEF-006-C3-ccv4-measurement.md` | 13,333 | `f22d7fb4b1921056928017412931c4367328c4571bf1cfafe430c99937f749902d699ec06a643bd3d6fec85a95031a04a8da3104f82f13dd7bf35b47c2542824` |
| 7 | `docs/briefs/BRIEF-007-C5-system-sanity.md` | 8,035 | `a4ef3d99cedf7e90f218560186d56b4d4b3405a3626d1111955589831451f3146a9031d24a619f5224c232231711bd638807d0174d9934d87a57a516dcafa093` |
| 8 | `tests/audit/corpus.js` | 13,945 | `50cce4584a4ad5b8ad65cb6dba02bb6661616fbde9dd77c19a539fb30cd23ad7f127e5f4aeea7e71fd3ff87a1155b24654a8283752c31a3f4a313a12b922b936` |
| 9 | `tests/audit/run_calibration.js` | 7,236 | `c75d66f4d9059a5fd669f508cd79a2f3dd012274ef579ee618929cb62477aaf73a54a8d8c29886a5bf7a6d9abfbc543c199fe0d62e8ad170beef286f2d92f975` |

## Why the corpus goes to `tests/audit/`

BRIEF-006 says "copy `audit/corpus.js` unmodified". That phrasing predates this repository layout and means **row 8 above**: `tests/audit/corpus.js`. The brief is sealed and is not edited to say so; this line resolves it. The harness resolves `../src/coherence_calculus.js` relative to its own directory, so `tests/audit/` is the correct home and needs no change to the file.

## What this file is not

It is not a brief. It carries no scope, no acceptance table and no permission to change `src/`. Landing these files is a records task: no repair, no config change, no `src/` edit.

Rows 1–4 and 2 are history: 003 rev 1 is void and kept as record, 004 and 004b are executed and kept as record. Only rows 5, 6, 8 and 9 unblock work — C2a, C3 and C3's baseline.
