# models/ — artifacts, not source

The binaries here are **absent on purpose**.

- Each model directory keeps its `manifest.json`: size and sha3-512 pin for the whole file and for every chunk.
- `*.bin` is excluded by `.gitignore`. Weights are build artifacts of a training process, pinned by hash, not checked in.
- To obtain and verify them: `python3 services/clf/fetch_model.py` (writes into `models/<model>/`, then `--verify`).
- Nothing in `src/` requires these files at load time. `src/clf_client.js` scores by talking to the local Python service on loopback `127.0.0.1:7768`.
- When the service is absent, the pipeline **fails open** and records `classifier_unavailable` in the trace. That behaviour is designed and tested (`tests/regression/prefilter_failopen.js`).

So: a checkout without weights runs every gate, every test that does not need live scoring, and the whole kernel. It cannot answer one question — how toxic is this sentence — and it says so instead of pretending.
