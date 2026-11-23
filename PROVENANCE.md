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

Blobless clone of the origin, sparse checkout of everything except `models/`, the three `manifest.json` pins kept, then re-committed here. The exact commands are recorded in `BRIEF-004-C0-repo-split.md` in the CSS Labs brief set. The archive keeps its history; this repository starts a new one and states where it came from.
