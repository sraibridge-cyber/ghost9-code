# Provenance

This repository is the **source** half of GHOST v9. The **weights** are artifacts and are deliberately not here.

| Field | Value |
|---|---|
| Origin repository | `sraibridge-cyber/ghost9` |
| Origin branch | `review/ghost9-combined` |
| Origin commit | `0c34b39597930d0c8a80bbfb90c5859bcdc1e78f` |
| Extracted | 2026-11-23 |
| Sealed code-only bundle | `ghost9-code-0c34b39.zip`, 1.2 MB, 353 files |
| Bundle SHA3-512 | `4970f4f417b665ace7efb05854b13d8a934eff0bed84e290f964fa4114b8c41f550b10d654c15eff329b813cc3df479f9658614c90761d870d00de118ac5bec2` |

The origin repository is the **sealed record** and is not modified by this split. Not one commit there is touched.

## Why the split happened

Measured on the origin at the commit above:

- packed repository: **144 MB**
- `models/`: **220.7 MB** across 15 files (~98% of the tree by bytes)
- everything else: **4.5 MB**, 350 files, which clones in seconds

A full clone of the origin exceeds a coding agent's fetch budget, so no repair session could begin. The weights were never source: each model carries a `manifest.json` with sha3-512 pins per chunk, and `services/clf/fetch_model.py` assembles and verifies them. Nothing in `src/` requires the binaries at load.

The `.part-NN.bin` chunking in the origin exists only to stay under GitHub's 100 MB file cap. That was the first hosting limit shaping the repo; this split is the second and last.

## How this tree was brought here

Blobless clone of the origin, sparse checkout of everything except `models/`, then re-committed here. The exact commands are recorded in `BRIEF-004-C0-repo-split.md` in the CSS Labs brief set. The archive keeps its history; this repository starts a new one and states where it came from.

## Addendum 2026-11-23 — executed import record

Appended after the import ran. Nothing above is edited; where the executed result differs from the plan, the difference is stated here.

Measured on the import run:

- `git clone --filter=blob:none --no-checkout --depth 1 -b review/ghost9-combined` — 1 s
- sparse pattern set to `/*` + `!models/*` **before** checkout — checkout 4 s
- checked-out tree: 4.5 MB on disk, no weight file present anywhere

**Correction made before publication.** The first pass excluded all of `models/`, which swept out the
three `tokenizer.json` files along with the weights. That was wrong: a tokenizer is vocabulary data,
0.7–2.1 MB, and `src/qc_node.js` reads it off disk at load while the three Python services call
`Tokenizer.from_file()` on it. Excluding them would have made a live module raise `ENOENT`. The
pattern was narrowed to the weight binaries (`models/*/*.bin`, `models/*/*.onnx`), the tokenizers were
restored, and the `.gitignore` rule was written to match. Nothing was pushed in the defective state.

**Result of the import:** 358 tracked files = 353 code files from the origin tree + 3 `tokenizer.json`
+ `PROVENANCE.md` + `models/README.md`. Nine weight files (217,195,089 bytes) are absent by design and
still pinned in their manifests. The imported tree is byte-identical to `0c34b39` on every shared file
except `.gitignore`, which gains the two weight-binary rules.

**Also corrected:** the first version of `models/README.md` said to run `fetch_model.py` to *obtain*
the weights. It does not download; it assembles chunks kept in the origin repository and verifies their
SHA3-512 pins. In this repository the chunks are absent, so it fails with `FileNotFoundError` — which
is the honest outcome and is now documented as such.
