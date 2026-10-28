from __future__ import annotations

import argparse
import json
import random
from pathlib import Path

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from torch.optim import AdamW
from torch.utils.data import DataLoader
from tqdm import tqdm

from dataset import ManifestImageDataset
from model import build_model, freeze_backbone, unfreeze_backbone
from transforms import eval_transform, train_transform


LABELS = {
    0: "not_xray",
    1: "xray",
}


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--train-csv", required=True)
    parser.add_argument("--val-csv", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--batch-size", type=int, default=8)
    parser.add_argument("--image-size", type=int, default=224)
    parser.add_argument("--lr", type=float, default=1e-4)
    parser.add_argument("--weight-decay", type=float, default=1e-4)
    parser.add_argument("--freeze-epochs", type=int, default=1)
    parser.add_argument("--patience", type=int, default=3)
    parser.add_argument("--num-workers", type=int, default=0)
    parser.add_argument("--seed", type=int, default=42)
    return parser.parse_args()


def seed_everything(seed: int):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)

    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


def compute_class_weights(csv_path: str):
    df = pd.read_csv(csv_path)
    counts = df["label"].value_counts()

    total = len(df)
    weights = []

    for label in ["not_xray", "xray"]:
        count = int(counts.get(label, 0))
        if count == 0:
            raise ValueError(f"Training set contains zero samples for {label}.")
        weights.append(total / (2.0 * count))

    return torch.tensor(weights, dtype=torch.float32)


def make_loader(csv_path, transform, batch_size, num_workers, shuffle):
    dataset = ManifestImageDataset(csv_path, transform=transform)

    return DataLoader(
        dataset,
        batch_size=batch_size,
        shuffle=shuffle,
        num_workers=num_workers,
        pin_memory=torch.cuda.is_available(),
    )


def calculate_metrics(y_true, y_prob, threshold=0.5):
    y_pred = (np.asarray(y_prob) >= threshold).astype(int)
    y_true = np.asarray(y_true)

    metrics = {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision": float(
            precision_score(y_true, y_pred, zero_division=0)
        ),
        "recall_sensitivity": float(
            recall_score(y_true, y_pred, zero_division=0)
        ),
        "f1": float(f1_score(y_true, y_pred, zero_division=0)),
    }

    if len(np.unique(y_true)) == 2:
        metrics["roc_auc"] = float(roc_auc_score(y_true, y_prob))
        metrics["pr_auc"] = float(average_precision_score(y_true, y_prob))
    else:
        metrics["roc_auc"] = None
        metrics["pr_auc"] = None

    # For label 1 = X-ray:
    # TN = not_xray predicted not_xray
    # FP = not_xray predicted xray
    # FN = xray predicted not_xray
    # TP = xray predicted xray
    tn = int(((y_true == 0) & (y_pred == 0)).sum())
    fp = int(((y_true == 0) & (y_pred == 1)).sum())
    fn = int(((y_true == 1) & (y_pred == 0)).sum())
    tp = int(((y_true == 1) & (y_pred == 1)).sum())

    metrics["specificity"] = float(tn / (tn + fp)) if (tn + fp) else 0.0

    metrics["confusion_matrix"] = {
        "tn": tn,
        "fp": fp,
        "fn": fn,
        "tp": tp,
    }

    return metrics


def run_epoch(model, loader, criterion, optimizer, device, training=True):
    if training:
        model.train()
    else:
        model.eval()

    losses = []
    y_true = []
    y_prob = []

    context = torch.enable_grad() if training else torch.no_grad()

    with context:
        for images, labels, _paths in tqdm(
            loader,
            desc="train" if training else "val",
            leave=False,
        ):
            images = images.to(device)
            labels = labels.to(device)

            logits = model(images)
            loss = criterion(logits, labels)

            if training:
                optimizer.zero_grad(set_to_none=True)
                loss.backward()
                optimizer.step()

            probabilities = torch.softmax(logits, dim=1)[:, 1]

            losses.append(float(loss.item()))
            y_true.extend(labels.detach().cpu().numpy().tolist())
            y_prob.extend(probabilities.detach().cpu().numpy().tolist())

    metrics = calculate_metrics(y_true, y_prob)

    return float(np.mean(losses)), metrics


def main():
    args = parse_args()

    seed_everything(args.seed)

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    print(f"Device: {device}")
    if device.type == "cuda":
        print(f"GPU: {torch.cuda.get_device_name(0)}")

    train_loader = make_loader(
        args.train_csv,
        train_transform(args.image_size),
        args.batch_size,
        args.num_workers,
        shuffle=True,
    )

    val_loader = make_loader(
        args.val_csv,
        eval_transform(args.image_size),
        args.batch_size,
        args.num_workers,
        shuffle=False,
    )

    model = build_model(num_classes=2, pretrained=True)
    model = model.to(device)

    freeze_backbone(model)

    class_weights = compute_class_weights(args.train_csv).to(device)
    criterion = nn.CrossEntropyLoss(weight=class_weights)

    optimizer = AdamW(
        filter(lambda p: p.requires_grad, model.parameters()),
        lr=args.lr,
        weight_decay=args.weight_decay,
    )

    best_score = -float("inf")
    epochs_without_improvement = 0

    history = []

    for epoch in range(1, args.epochs + 1):
        if epoch == args.freeze_epochs + 1:
            print("Unfreezing EfficientNet backbone.")
            unfreeze_backbone(model)
            optimizer = AdamW(
                model.parameters(),
                lr=args.lr * 0.1,
                weight_decay=args.weight_decay,
            )

        print(f"\nEpoch {epoch}/{args.epochs}")

        train_loss, train_metrics = run_epoch(
            model,
            train_loader,
            criterion,
            optimizer,
            device,
            training=True,
        )

        val_loss, val_metrics = run_epoch(
            model,
            val_loader,
            criterion,
            optimizer=None,
            device=device,
            training=False,
        )

        row = {
            "epoch": epoch,
            "train_loss": train_loss,
            "val_loss": val_loss,
            "train": train_metrics,
            "val": val_metrics,
        }
        history.append(row)

        print(
            f"train loss={train_loss:.4f} "
            f"val loss={val_loss:.4f} "
            f"val sensitivity={val_metrics['recall_sensitivity']:.4f} "
            f"val specificity={val_metrics['specificity']:.4f} "
            f"val F1={val_metrics['f1']:.4f} "
            f"val ROC-AUC={val_metrics['roc_auc']}"
        )

        # Primary checkpoint criterion: validation F1.
        score = val_metrics["f1"]

        if score > best_score:
            best_score = score
            epochs_without_improvement = 0

            checkpoint = {
                "arch": "efficientnet_b0",
                "num_classes": 2,
                "class_to_id": {
                    "not_xray": 0,
                    "xray": 1,
                },
                "image_size": args.image_size,
                "state_dict": model.state_dict(),
            }

            torch.save(
                checkpoint,
                output_dir / "best_model.pt",
            )

            print(f"Saved best checkpoint: {output_dir / 'best_model.pt'}")
        else:
            epochs_without_improvement += 1

        if epochs_without_improvement >= args.patience:
            print("Early stopping.")
            break

    with (output_dir / "history.json").open("w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)

    print("\nTraining complete.")
    print(f"Best validation F1: {best_score:.4f}")
    print(f"Checkpoint: {output_dir / 'best_model.pt'}")


if __name__ == "__main__":
    main()
