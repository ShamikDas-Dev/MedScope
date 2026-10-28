# MedScope — X-Ray Validator Training Stage

This package implements the **first real ML milestone** for MedScope:

```text
Image
  ↓
X-Ray Validator
  ↓
X-RAY / NOT_XRAY
```

The baseline uses a pretrained **EfficientNet-B0** and fine-tunes it for the binary X-ray validation task.

This stage intentionally does **not** generate fracture predictions.

## Why this baseline?

EfficientNet-B0 is a small transfer-learning baseline that is practical to experiment with on a laptop GPU. The backbone starts from pretrained weights and the final classifier is adapted to two classes.

MedSigLIP (`google/medsiglip-448`) remains a useful medical-image baseline experiment. Its current Hugging Face model card describes it as a medical image/text encoder for zero-shot and data-efficient classification, but also says downstream medical applications require validation/adaptation. It is therefore kept as an optional comparison rather than making it the production gate by default.

## Dataset layout

Create a manifest with these columns:

```csv
path,label,group_id
data/images/xray/a.png,xray,patient_001
data/images/not_xray/photo.jpg,not_xray,photo_001
```

- `path`: path to the image
- `label`: `xray` or `not_xray`
- `group_id`: patient/study/source group when available

The split utility uses `group_id` when supplied. If you do not have group IDs, you must explicitly allow an image-level split; for medical data this is less safe when multiple images can belong to the same patient.

## Recommended data composition

The `not_xray` class should include a range of negatives:

- MRI
- CT
- Ultrasound
- Ordinary photographs
- Screenshots
- Other non-X-ray images

Do not make it only `MRI vs X-ray`.

## 1. Install

From the `ml` directory:

```powershell
python -m venv venv
venv\Scripts\activate
```

Install PyTorch first using the official PyTorch selector for your Windows/NVIDIA setup, then:

```powershell
pip install -r requirements.txt
```

Verify CUDA:

```powershell
python src/check_gpu.py
```

## 2. Prepare splits

Example:

```powershell
python src/prepare_splits.py `
  --manifest data/manifest.csv `
  --output-dir data/splits `
  --test-size 0.15 `
  --val-size 0.15
```

If you have no group IDs:

```powershell
python src/prepare_splits.py `
  --manifest data/manifest.csv `
  --output-dir data/splits `
  --test-size 0.15 `
  --val-size 0.15 `
  --allow-image-level-split
```

The script will print a warning.

## 3. Train

Start conservatively for a 6 GB GPU:

```powershell
python src/train_xray_validator.py `
  --train-csv data/splits/train.csv `
  --val-csv data/splits/val.csv `
  --epochs 10 `
  --batch-size 8 `
  --num-workers 0 `
  --output-dir checkpoints/xray_validator
```

If you get CUDA out-of-memory, reduce:

```text
--batch-size 4
```

The best checkpoint is saved as:

```text
checkpoints/xray_validator/best_model.pt
```

## 4. Evaluate

```powershell
python src/evaluate_xray_validator.py `
  --checkpoint checkpoints/xray_validator/best_model.pt `
  --test-csv data/splits/test.csv `
  --output-dir evaluation/xray_validator
```

Outputs include:

```text
metrics.json
predictions.csv
confusion_matrix.csv
thresholds.csv
```

## 5. Single-image inference

```powershell
python src/predict_xray.py `
  --checkpoint checkpoints/xray_validator/best_model.pt `
  --image path\to\image.png
```

Example output:

```text
label       : xray
probability : 0.9731
```

This is a model prediction, not a clinical determination.

## Important evaluation rule

Do not use your training accuracy as evidence that the validator is good.

Use the held-out test set and report:

- sensitivity / recall
- specificity
- precision
- F1
- ROC-AUC
- PR-AUC
- confusion matrix
- threshold analysis

For medical datasets, use patient/study-level grouping whenever the source data provides an identifier.

## Next MedScope milestone

After this validator is trained and evaluated:

```text
X-ray / Not X-ray
        ↓
Body-part classifier
        ↓
Wrist / Ankle / Other
```

Do not add the fracture models until the validator is working and evaluated.
