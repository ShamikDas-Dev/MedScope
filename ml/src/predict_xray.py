from __future__ import annotations

import argparse

import torch
from PIL import Image

from model import build_model
from transforms import eval_transform


LABELS = {
    0: "not_xray",
    1: "xray",
}


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--checkpoint", required=True)
    parser.add_argument("--image", required=True)
    return parser.parse_args()


def main():
    args = parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    checkpoint = torch.load(
        args.checkpoint,
        map_location=device,
        weights_only=False,
    )

    image_size = int(checkpoint.get("image_size", 224))

    model = build_model(
        num_classes=2,
        pretrained=False,
    )
    model.load_state_dict(checkpoint["state_dict"])
    model.to(device)
    model.eval()

    image = Image.open(args.image).convert("RGB")
    tensor = eval_transform(image_size)(image).unsqueeze(0).to(device)

    with torch.no_grad():
        logits = model(tensor)
        probability = torch.softmax(logits, dim=1)[0]

    xray_probability = float(probability[1].item())
    label = "xray" if xray_probability >= 0.5 else "not_xray"

    print(f"label       : {label}")
    print(f"probability : {xray_probability:.4f}")
    print(
        "note        : This is an AI image-classification output, "
        "not a clinical determination."
    )


if __name__ == "__main__":
    main()
