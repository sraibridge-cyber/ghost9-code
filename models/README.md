# models/ — tokenizers are source, weights are artifacts

This directory holds each model's `manifest.json`, its `tokenizer.json`, and **no weights**.

## What is here, and why

| File | Bytes | Why it is in git |
|---|---|---|
| `models/toxic-bert/tokenizer.json` | 711,396 | vocabulary the code parses directly |
| `models/minilm-embed/tokenizer.json` | 711,661 | vocabulary the code parses directly |
| `models/distilgpt2/tokenizer.json` | 2,107,653 | vocabulary the code parses directly |

A tokenizer is not a trained weight file; it is the vocabulary plus merge rules for turning text into
token ids, it is small, and the runtime opens it directly rather than through the model service.
`src/qc_node.js` reads `tokenizer.json` off disk at load, and `services/clf/clf_service.py:39`,
`services/clf/harm_vector_service.py:56` and `services/lm/perplexity.py:43` all do
`Tokenizer.from_file(os.path.join(model_dir, "tokenizer.json"))`. A checkout without them raises
`ENOENT` in a live module. They stay.

## What is deliberately absent

| File | Bytes | Format |
|---|---|---|
| `models/toxic-bert/model_quantized.onnx` | 110,720,344 | 5 chunks, `.part-00..04.bin` |
| `models/minilm-embed/model_quantized.onnx` | 22,972,370 | one file |
| `models/distilgpt2/decoder_model_quantized.onnx` | 83,502,375 | 3 chunks, `.part-00..02.bin` |

Together: 9 files, 217,195,089 bytes — over 98% of the origin repository by size. `.gitignore`
excludes `models/*/*.bin` and `models/*/*.onnx`. Each manifest keeps the size, sha3-512 and chunk
breakdown for every one of them, so their identity is preserved here even though their bytes are not.

## Assembling them

`services/clf/fetch_model.py` **does not download anything.** Despite the name, it assembles the
chunks that live in `models/toxic-bert/` of this same repository, verifying each chunk's SHA3-512
against the manifest before concatenating, and refusing on any mismatch.

Because this repository does not carry the chunks, running it here fails immediately with
`FileNotFoundError` on the first chunk. That is the correct outcome, not a bug to be worked around:

```
# inside a sraibridge-cyber/ghost9 checkout, where the chunks exist:
python3 services/clf/fetch_model.py                 # assemble into ~/.ghost9/models/toxic-bert
python3 services/clf/fetch_model.py --verify-only   # check, no assembly
```

`models/distilgpt2/` assembles the same way through `services/lm/fetch_lm_model.py`.

## What a checkout without weights can and cannot do

Everything except live scoring: every gate, every kernel path, every test that does not need the
classifier. The one question it cannot answer is how toxic a sentence is, and the pipeline **fails
open** and records `classifier_unavailable` in the trace rather than guessing. That failure is
designed and tested, not an accident of the split.
