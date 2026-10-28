from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd
from sklearn.model_selection import train_test_split


LABELS = {"xray", "not_xray"}


def parse_args():
    parser = argparse.ArgumentParser(
        description="Create leakage-aware train/validation/test manifests."
    )
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--test-size", type=float, default=0.15)
    parser.add_argument("--val-size", type=float, default=0.15)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--allow-image-level-split", action="store_true")
    return parser.parse_args()


def validate(df: pd.DataFrame):
    required = {"path", "label"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Manifest missing columns: {sorted(missing)}")

    df["label"] = df["label"].astype(str).str.strip().str.lower()

    invalid = sorted(set(df["label"]) - LABELS)
    if invalid:
        raise ValueError(f"Invalid labels: {invalid}")

    if df["path"].isna().any():
        raise ValueError("Manifest contains missing paths.")

    return df


def group_split(
    df: pd.DataFrame,
    test_size: float,
    val_size: float,
    seed: int,
):
    if "group_id" not in df.columns:
        raise ValueError("group_id column is required for grouped splitting.")

    groups = df["group_id"].astype(str)

    if groups.nunique() < 5:
        raise ValueError(
            "Not enough unique groups for a reliable grouped split."
        )

    group_table = (
        df[["group_id", "label"]]
        .drop_duplicates("group_id")
        .reset_index(drop=True)
    )

    train_groups, temp_groups = train_test_split(
        group_table["group_id"],
        test_size=test_size + val_size,
        random_state=seed,
        stratify=group_table["label"],
    )

    temp_table = group_table[group_table["group_id"].isin(temp_groups)]

    relative_val = val_size / (test_size + val_size)

    val_groups, test_groups = train_test_split(
        temp_table["group_id"],
        test_size=1 - relative_val,
        random_state=seed,
        stratify=temp_table["label"],
    )

    train_df = df[df["group_id"].isin(train_groups)].copy()
    val_df = df[df["group_id"].isin(val_groups)].copy()
    test_df = df[df["group_id"].isin(test_groups)].copy()

    return train_df, val_df, test_df


def image_level_split(
    df: pd.DataFrame,
    test_size: float,
    val_size: float,
    seed: int,
):
    train_df, temp_df = train_test_split(
        df,
        test_size=test_size + val_size,
        random_state=seed,
        stratify=df["label"],
    )

    relative_val = val_size / (test_size + val_size)

    val_df, test_df = train_test_split(
        temp_df,
        test_size=1 - relative_val,
        random_state=seed,
        stratify=temp_df["label"],
    )

    return train_df.copy(), val_df.copy(), test_df.copy()


def report(name: str, df: pd.DataFrame):
    print(f"\n{name}: {len(df)} images")
    print(df["label"].value_counts().to_string())


def main():
    args = parse_args()

    if not 0 < args.test_size < 1:
        raise ValueError("--test-size must be between 0 and 1.")

    if not 0 < args.val_size < 1:
        raise ValueError("--val-size must be between 0 and 1.")

    if args.test_size + args.val_size >= 1:
        raise ValueError("--test-size + --val-size must be less than 1.")

    df = validate(pd.read_csv(args.manifest))

    if "group_id" in df.columns and df["group_id"].notna().all():
        print("Using group-level splitting.")
        train_df, val_df, test_df = group_split(
            df,
            args.test_size,
            args.val_size,
            args.seed,
        )
    elif args.allow_image_level_split:
        print(
            "WARNING: group_id is unavailable. "
            "Using image-level splitting."
        )
        train_df, val_df, test_df = image_level_split(
            df,
            args.test_size,
            args.val_size,
            args.seed,
        )
    else:
        raise ValueError(
            "A complete group_id column is recommended. "
            "Pass --allow-image-level-split only when group IDs are unavailable."
        )

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    train_df.to_csv(output_dir / "train.csv", index=False)
    val_df.to_csv(output_dir / "val.csv", index=False)
    test_df.to_csv(output_dir / "test.csv", index=False)

    report("TRAIN", train_df)
    report("VAL", val_df)
    report("TEST", test_df)

    print(f"\nSaved splits to: {output_dir.resolve()}")


if __name__ == "__main__":
    main()
