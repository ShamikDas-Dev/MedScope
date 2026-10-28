# ML source scripts

## `check_gpu.py`

Checks whether PyTorch can access your NVIDIA GPU.

## `prepare_splits.py`

Creates train/validation/test manifests.

Prefer `group_id` so related images remain in one split.

## `train_xray_validator.py`

Fine-tunes EfficientNet-B0 for:

```text
0 = not_xray
1 = xray
```

## `evaluate_xray_validator.py`

Evaluates the held-out test set and produces:

- metrics.json
- predictions.csv
- confusion_matrix.csv
- thresholds.csv

## `predict_xray.py`

Runs one image through a trained checkpoint.
