from __future__ import annotations

from pathlib import Path
from typing import Callable

import pandas as pd
from PIL import Image, UnidentifiedImageError
from torch.utils.data import Dataset


LABEL_TO_ID = {
    "not_xray": 0,
    "xray": 1,
}


class ManifestImageDataset(Dataset):
    """Dataset backed by a CSV manifest with path,label columns."""

    def __init__(
        self,
        csv_path: str | Path,
        transform: Callable | None = None,
    ) -> None:
        self.csv_path = Path(csv_path)
        self.df = pd.read_csv(self.csv_path)
        self.transform = transform

        required = {"path", "label"}
        missing = required - set(self.df.columns)
        if missing:
            raise ValueError(
                f"{self.csv_path} is missing required columns: {sorted(missing)}"
            )

        self.df["label"] = self.df["label"].astype(str).str.strip().str.lower()

        invalid = sorted(set(self.df["label"]) - set(LABEL_TO_ID))
        if invalid:
            raise ValueError(
                f"Invalid labels in {self.csv_path}: {invalid}. "
                f"Expected: {sorted(LABEL_TO_ID)}"
            )

        if len(self.df) == 0:
            raise ValueError(f"{self.csv_path} contains no rows.")

    def __len__(self) -> int:
        return len(self.df)

    def __getitem__(self, index: int):
        row = self.df.iloc[index]
        path = Path(str(row["path"]))

        if not path.exists():
            raise FileNotFoundError(
                f"Image listed in {self.csv_path} does not exist: {path}"
            )

        try:
            image = Image.open(path).convert("RGB")
        except (UnidentifiedImageError, OSError) as exc:
            raise RuntimeError(f"Unable to open image: {path}") from exc

        label = LABEL_TO_ID[str(row["label"])]

        if self.transform is not None:
            image = self.transform(image)

        return image, label, str(path)
