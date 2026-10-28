from __future__ import annotations

import base64
import json
import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

MODEL = os.getenv(
    "OPENROUTER_MODEL",
    "qwen/qwen3.8-27b:free",
)


def get_client() -> OpenAI:
    api_key = os.getenv("OPENROUTER_API_KEY")

    if not api_key:
        raise RuntimeError(
            "OPENROUTER_API_KEY is missing from backend/.env"
        )

    return OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=api_key,
    )


def inspect_image(
    image_bytes: bytes,
    mime_type: str,
) -> dict:

    encoded_image = base64.b64encode(image_bytes).decode("utf-8")

    prompt = """
    You are an image file classification component for a software application.

    Your ONLY task is to classify the image modality and visible body region.

    Do NOT diagnose any medical condition.
    Do NOT identify fractures.
    Do NOT recommend treatment.
    Do NOT provide medical advice.

    Return ONLY JSON:

    {
        "modality": "xray",
        "body_part": "wrist",
        "confidence": 0.95,
        "supported_v1": true,
        "note": "The image appears to be an X-ray of the wrist."
    }

    Allowed modality values:
    xray, mri, ct, ultrasound, photo, other.

    Allowed supported_v1:
    true only when the image is an X-ray of the wrist or ankle.
    false for everything else.

    Use "unknown" when the body region cannot be determined confidently.

    Do not output markdown or any text outside the JSON object.
    """

    response = get_client().chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt,
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": (
                                f"data:{mime_type};base64,"
                                f"{encoded_image}"
                            )
                        },
                    },
                ],
            }
        ],
        temperature=0,
        response_format={
            "type": "json_object"
        },
    )

    content = response.choices[0].message.content

    if not content:
        raise RuntimeError(
            "OpenRouter returned an empty response."
        )

    print("\nOPENROUTER RAW RESPONSE:")
    print(content)

    if not content:
        raise RuntimeError(
            "OpenRouter returned an empty response."
        )

    content = content.strip()

    if not content.startswith("{"):
        raise RuntimeError(
            f"OpenRouter returned a non-JSON response: {content}"
        )

    try:
        result = json.loads(content)
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            f"OpenRouter returned invalid JSON: {content}"
        ) from exc

    modality = str(
        result.get("modality", "other")
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
        modality == "xray"
        and body_part in {"wrist", "ankle"}
    )

    return {
        "modality": modality,
        "body_part": body_part,
        "confidence": confidence,
        "supported_v1": supported_v1,
        "note": str(
            result.get("note", "")
        ).strip(),
    }