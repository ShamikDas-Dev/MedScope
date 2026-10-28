from __future__ import annotations

import torch.nn as nn
from torchvision.models import (
    EfficientNet_B0_Weights,
    efficientnet_b0,
)


def build_model(num_classes: int = 2, pretrained: bool = True):
    weights = EfficientNet_B0_Weights.DEFAULT if pretrained else None
    model = efficientnet_b0(weights=weights)

    in_features = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(in_features, num_classes)

    return model


def freeze_backbone(model) -> None:
    for parameter in model.features.parameters():
        parameter.requires_grad = False

    for parameter in model.classifier.parameters():
        parameter.requires_grad = True


def unfreeze_backbone(model) -> None:
    for parameter in model.features.parameters():
        parameter.requires_grad = True
