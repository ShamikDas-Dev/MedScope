from __future__ import annotations

import os
from tempfile import NamedTemporaryFile

from dotenv import load_dotenv
from gradio_client import Client, handle_file

load_dotenv()

SPACE_ID = os.getenv(
    "FRACTURE_MODEL_SPACE",
    "ShamikDas-Dev/medscope-fracture-model",
)

API_NAME = "/predict"

_client = None


def get_client():
    global _client

    if _client is None:
        token = os.getenv("HF_TOKEN")

        if not token:
            raise RuntimeError(
                "HF_TOKEN is missing from backend/.env"
            )

        _client = Client(
            SPACE_ID,
            token=token,
        )

    return _client


def predict_fracture(
    image_bytes: bytes,
    filename: str,
) -> dict:

    suffix = os.path.splitext(filename)[1] or ".png"
    temp_path = None

    try:
        with NamedTemporaryFile(
            delete=False,
            suffix=suffix,
        ) as temp_file:
            temp_file.write(image_bytes)
            temp_path = temp_file.name

        result = get_client().predict(
            handle_file(temp_path),
            api_name=API_NAME,
        )

        if not isinstance(result, dict):
            raise RuntimeError(
                f"Unexpected fracture model response: {result}"
            )

        return {
            "prediction": result.get("prediction"),
            "probabilities": result.get(
                "probabilities",
                {},
            ),
        }

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)