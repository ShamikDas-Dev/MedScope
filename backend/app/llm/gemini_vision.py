from __future__ import annotations

import asyncio
import json
import os
from functools import lru_cache
from typing import Literal

from dotenv import load_dotenv
from google import genai
from google.genai import types
from google.genai.errors import ServerError
from pydantic import BaseModel, Field

load_dotenv()


GEMINI_MODELS = [
    os.getenv("GEMINI_MODEL", "gemini-3.6-flash"),
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
]


class ImageInspection(BaseModel):
    modality: Literal[
        "xray",
        "mri",
        "ct",
        "ultrasound",
        "photo",
        "other",
    ]

    body_part: str

    confidence: float = Field(
        ge=0.0,
        le=1.0,
    )

    supported_v1: bool

    note: str


class Explanation(BaseModel):
    summary: str
    meaning: str
    next_step: str
    warning: str


@lru_cache(maxsize=1)
def get_client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not configured."
        )

    return genai.Client(api_key=api_key)


INSPECTION_PROMPT = """
You are the image-routing layer for MedScope.

Inspect the uploaded image.

Return ONLY valid JSON with exactly these fields:

{
  "modality": "xray",
  "body_part": "wrist",
  "confidence": 0.95,
  "supported_v1": true,
  "note": "Brief factual routing note."
}

Allowed modality values:
xray, mri, ct, ultrasound, photo, other.

Rules:

1. Identify the imaging modality.
2. Identify the body part.
3. MedScope V1 supports ONLY wrist and ankle X-rays.
4. supported_v1 must be true only for wrist or ankle X-rays.
5. Do not diagnose a fracture.
6. Do not recommend treatment.
7. Use conservative confidence when uncertain.
"""


def normalize_inspection(data: dict) -> dict:

    required = {
        "modality",
        "body_part",
        "confidence",
        "supported_v1",
        "note",
    }

    missing = required - set(data.keys())

    if missing:
        raise ValueError(
            f"Missing inspection fields: {sorted(missing)}"
        )

    modality = str(
        data["modality"]
    ).lower().strip()

    body_part = str(
        data["body_part"]
    ).lower().strip()

    allowed_modalities = {
        "xray",
        "mri",
        "ct",
        "ultrasound",
        "photo",
        "other",
    }

    if modality not in allowed_modalities:
        modality = "other"

    try:
        confidence = float(data["confidence"])
    except (TypeError, ValueError):
        confidence = 0.0

    confidence = max(
        0.0,
        min(1.0, confidence),
    )

    supported_v1 = (
        modality == "xray"
        and body_part in {"wrist", "ankle"}
    )

    return {
        "modality": modality,
        "body_part": body_part,
        "confidence": confidence,
        "supported_v1": supported_v1,
        "note": str(data["note"]).strip(),
    }


async def inspect_image(
    image_bytes: bytes,
    mime_type: str,
) -> dict:

    image_part = types.Part.from_bytes(
        data=image_bytes,
        mime_type=mime_type,
    )

    last_error = None

    for model_name in GEMINI_MODELS:

        for attempt in range(2):

            try:
                print(
                    f"Gemini inspection: "
                    f"{model_name} "
                    f"(attempt {attempt + 1}/2)"
                )

                response = get_client().models.generate_content(
                    model=model_name,
                    contents=[
                        image_part,
                        INSPECTION_PROMPT,
                    ],
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                    ),
                )

                raw = response.text

                if not raw:
                    raise RuntimeError(
                        "Gemini returned an empty response."
                    )

                print(
                    f"GEMINI MODEL USED: {model_name}"
                )

                print(
                    "GEMINI RAW RESPONSE:"
                )

                print(raw)

                data = json.loads(raw)

                return normalize_inspection(data)

            except ServerError as error:

                last_error = error

                print(
                    f"Gemini {model_name} returned "
                    f"{type(error).__name__}: {error}"
                )

                if attempt == 0:
                    await asyncio.sleep(3)

            except Exception:
                raise

    raise RuntimeError(
        "All Gemini inspection models are currently "
        f"unavailable. Last error: {last_error}"
    )


EXPLANATION_PROMPT = """
You are the explanation layer for MedScope.

Explain the supplied AI-assisted screening result
in simple language.

Never claim a confirmed diagnosis.
Never prescribe treatment.
Never invent findings.

Return ONLY JSON:

{
  "summary": "...",
  "meaning": "...",
  "next_step": "...",
  "warning": "..."
}
"""


async def explain_findings(findings: dict) -> dict:

    prompt = (
        f"{EXPLANATION_PROMPT}\n\n"
        f"Findings:\n"
        f"{json.dumps(findings, indent=2)}"
    )

    last_error = None

    for model_name in GEMINI_MODELS:

        for attempt in range(2):

            try:

                response = get_client().models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                    ),
                )

                raw = response.text

                if not raw:
                    raise RuntimeError(
                        "Gemini returned an empty explanation."
                    )

                return Explanation.model_validate(
                    json.loads(raw)
                ).model_dump()

            except ServerError as error:

                last_error = error

                if attempt == 0:
                    await asyncio.sleep(3)

    raise RuntimeError(
        f"All Gemini explanation models failed: {last_error}"
    )