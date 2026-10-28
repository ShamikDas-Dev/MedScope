from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import pandas as pd
import torch
from torch.utils.data import DataLoader
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)

from dataset import ManifestImageDataset
from model import build_model
from transforms import eval_transform


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--checkpoint", required=True)
    parser.add_argument("--test-csv", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--batch-size", type=int, default=8)
    parser.add_argument("--num-workers", type=int, default=0)
    return parser.parse_args()


def load_model(checkpoint_path, device):
    checkpoint = torch.load(
        checkpoint_path,
        map_location=device,
        weights_only=False,
    )

    image_size = int(checkpoint.get("image_size", 224))

    model = build_model(
        num_classes=int(checkpoint.get("num_classes", 2)),
        pretrained=False,
    )
    model.load_state_dict(checkpoint["state_dict"])
    model.to(device)
    model.eval()

    return model, image_size


def collect_predictions(model, loader, device):
    y_true = []
    y_prob = []
    paths = []

    with torch.no_grad():
        for images, labels, batch_paths in loader:
            images = images.to(device)

            logits = model(images)
            probabilities = torch.softmax(logits, dim=1)[:, 1]

            y_true.extend(labels.numpy().tolist())
            y_prob.extend(probabilities.cpu().numpy().tolist())
            paths.extend(batch_paths)

    return np.array(y_true), np.array(y_prob), paths


def specificity(y_true, y_pred):
    tn, fp, fn, tp = confusion_matrix(
        y_true, y_pred, labels=[0, 1]
    ).ravel()
    return float(tn / (tn + fp)) if (tn + fp) else 0.0


def metric_row(y_true, y_prob, threshold):
    y_pred = (y_prob >= threshold).astype(int)

    row = {
        "threshold": float(threshold),
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision": float(
            precision_score(y_true, y_pred, zero_division=0)
        ),
        "sensitivity_recall": float(
            recall_score(y_true, y_pred, zero_division=0)
        ),
        "specificity": specificity(y_true, y_pred),
        "f1": float(f1_score(y_true, y_pred, zero_division=0)),
    }

    return row


def main():
    args = parse_args()

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    model, image_size = load_model(args.checkpoint, device)

    dataset = ManifestImageDataset(
        args.test_csv,
        transform=eval_transform(image_size),
    )

    loader = DataLoader(
        dataset,
        batch_size=args.batch_size,
        shuffle=False,
        num_workers=args.num_workers,
        pin_memory=torch.cuda.is_available(),
    )

    y_true, y_prob, paths = collect_predictions(
        model,
        loader,
        device,
    )

    if len(np.unique(y_true)) < 2:
        raise ValueError(
            "Test set must contain both xray and not_xray classes."
        )

    roc_auc = float(roc_auc_score(y_true, y_prob))
    pr_auc = float(average_precision_score(y_true, y_prob))

    thresholds = np.arange(0.10, 0.91, 0.05)
    rows = [
        metric_row(y_true, y_prob, threshold)
        for threshold in thresholds
    ]

    thresholds_df = pd.DataFrame(rows)
    thresholds_df.to_csv(
        output_dir / "thresholds.csv",
        index=False,
    )

    default_row = metric_row(y_true, y_prob, 0.50)
    cm = confusion_matrix(y_true, (y_prob >= 0.50).astype(int), labels=[0, 1])

    metrics = {
        **default_row,
        "roc_auc": roc_auc,
        "pr_auc": pr_auc,
        "confusion_matrix": {
            "tn": int(cm[0, 0]),
            "fp": int(cm[0, 1]),
            "fn": int(cm[1, 0]),
            "tp": int(cm[1, 1]),
        },
    }

    with (output_dir / "metrics.json").open("w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    pd.DataFrame(
        {
            "path": paths,
            "true_label": [
                "xray" if x == 1 else "not_xray"
                for x in y_true
            ],
            "xray_probability": y_prob,
            "predicted_label": [
                "xray" if p >= 0.5 else "not_xray"
                for p in y_prob
            ],
        }
    ).to_csv(
        output_dir / "predictions.csv",
        index=False,
    )

    pd.DataFrame(
        cm,
        index=["actual_not_xray", "actual_xray"],
        columns=["pred_not_xray", "pred_xray"],
    ).to_csv(
        output_dir / "confusion_matrix.csv"
    )

    print("\nTest-set metrics at threshold 0.50:")
    for key in [
        "accuracy",
        "precision",
        "sensitivity_recall",
        "specificity",
        "f1",
        "roc_auc",
        "pr_auc",
    ]:
        print(f"{key}: {metrics[key]}")

    print(f"\nSaved evaluation to: {output_dir.resolve()}")


if __name__ == "__main__":
    main()
