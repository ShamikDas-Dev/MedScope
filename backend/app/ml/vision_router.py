from __future__ import annotations

import os
import time
from tempfile import NamedTemporaryFile

from dotenv import load_dotenv
from gradio_client import Client, handle_file

load_dotenv()

SPACE_ID = os.getenv(
    "IMAGE_ROUTER_SPACE",
    "ShamikDas-Dev/medscope-image-router",
)

API_NAME = "/analyze_image"


def create_client() -> Client:
    token = os.getenv("HF_TOKEN")

    if not token:
        raise RuntimeError(
            "HF_TOKEN is missing from backend/.env"
        )

    last_error = None

    for attempt in range(3):
        try:
            print(
                f"Connecting to image router "
                f"(attempt {attempt + 1}/3)..."
            )

            return Client(
                SPACE_ID,
                token=token,
            )

        except Exception as error:
            last_error = error

            print(
                f"Image router connection failed: "
                f"{type(error).__name__}: {error}"
            )

            if attempt < 2:
                time.sleep(3)

    raise RuntimeError(
        f"Could not connect to image router: {last_error}"
    )


def inspect_image(
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

        client = create_client()

        result = client.predict(
            handle_file(temp_path),
            api_name=API_NAME,
        )

        print("\nIMAGE ROUTER RAW RESULT:")
        print(result)

        if not isinstance(result, dict):
            raise RuntimeError(
                f"Unexpected image-router response: {result}"
            )

        input_type = str(
            result.get("input_type", "other")
        ).lower().strip()

        modality = str(
            result.get("modality", "unknown")
        ).lower().strip()

        body_part = str(
            result.get("body_part", "unknown")
        ).lower().strip()

        try:
            confidence = float(
                result.get("confidence", 0)
            )
        except (TypeError, ValueError):
            confidence = 0.0

        confidence = max(
            0.0,
            min(1.0, confidence),
        )

        supported_v1 = (
            input_type == "medical_image"
            and modality == "xray"
            and body_part in {
                "wrist",
                "ankle",
                "knee",
            }
        )

        return {
            "input_type": input_type,
            "modality": modality,
            "body_part": body_part,
            "confidence": confidence,
            "supported_v1": supported_v1,
            "note": str(
                result.get("note", "")
            ).strip(),
        }

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)