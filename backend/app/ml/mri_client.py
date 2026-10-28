from __future__ import annotations

import os
import time
from tempfile import NamedTemporaryFile

from dotenv import load_dotenv
from gradio_client import Client, handle_file


load_dotenv()

SPACE_ID = os.getenv(
    "MRI_MODEL_SPACE",
    "ShamikDas-Dev/medscope-image-router",
)

API_NAME = "/analyze_mri"


def get_client() -> Client:
    token = os.getenv("HF_TOKEN")

    if not token:
        raise RuntimeError(
            "HF_TOKEN is missing from backend/.env"
        )

    last_error = None

    for attempt in range(3):

        try:
            print(
                f"Connecting to MRI model "
                f"(attempt {attempt + 1}/3)..."
            )

            return Client(
                SPACE_ID,
                token=token,
            )

        except Exception as error:

            last_error = error

            print(
                f"MRI connection error: "
                f"{type(error).__name__}: {error}"
            )

            if attempt < 2:
                time.sleep(3)

    raise RuntimeError(
        f"Could not connect to MRI model: {last_error}"
    )


def predict_mri(
    zip_bytes: bytes,
    filename: str,
) -> dict:

    temp_path = None

    try:

        with NamedTemporaryFile(
            delete=False,
            suffix=".zip",
        ) as temp_file:

            temp_file.write(zip_bytes)
            temp_path = temp_file.name

        result = get_client().predict(
            handle_file(temp_path),
            api_name=API_NAME,
        )

        print("\nMRI MODEL RESULT:")
        print(result)

        if not isinstance(result, dict):
            raise RuntimeError(
                f"Unexpected MRI result: {result}"
            )

        return result

    finally:

        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)