from __future__ import annotations

import json
import os
import time

from dotenv import load_dotenv
from openai import APIStatusError, OpenAI, RateLimitError

load_dotenv()

MODEL = os.getenv(
    "OPENROUTER_MODEL",
    "inclusionai/ling-3.0-flash-sante:free",
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
        default_headers={
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "MedScope",
        },
    )


PROMPT = """
You are the explanation component of MedScope.

A separate pretrained image-classification model has already
produced an AI-assisted screening result.

Explain ONLY the supplied result.

Important:
- Do not change the prediction.
- Do not diagnose the patient.
- Do not claim a confirmed fracture.
- Do not invent findings that are not present in the supplied data.
- Do not prescribe medication.
- Do not recommend surgery.
- Do not provide treatment instructions.
- Explain the probability in plain language.
- State clearly that this is an AI-assisted screening result.
- Recommend professional medical review for clinical decisions.

Return ONLY a JSON object.

Required format:

{
  "summary": "One short sentence describing the screening result.",
  "meaning": "Explain what the model probability means.",
  "next_step": "Recommend professional review of the X-ray.",
  "warning": "This is an AI-assisted screening result, not a medical diagnosis."
}

SCREENING RESULT:
"""


def parse_json(content: str) -> dict:
    content = content.strip()

    if content.startswith("```"):
        lines = content.splitlines()

        if lines and lines[0].startswith("```"):
            lines = lines[1:]

        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]

        content = "\n".join(lines).strip()

    start = content.find("{")
    end = content.rfind("}")

    if start == -1 or end == -1:
        raise RuntimeError(
            f"OpenRouter returned no usable JSON:\n{content!r}"
        )

    try:
        return json.loads(
            content[start:end + 1]
        )
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            f"OpenRouter returned invalid JSON:\n{content}"
        ) from exc


def validate_result(data: dict) -> dict:
    required = {
        "summary",
        "meaning",
        "next_step",
        "warning",
    }

    missing = required - set(data.keys())

    if missing:
        raise RuntimeError(
            f"Missing explanation fields: {sorted(missing)}"
        )

    return {
        "summary": str(data["summary"]).strip(),
        "meaning": str(data["meaning"]).strip(),
        "next_step": str(data["next_step"]).strip(),
        "warning": str(data["warning"]).strip(),
    }


async def explain_result(
    screening_result: dict,
) -> dict:

    prompt = (
        PROMPT
        + "\n"
        + json.dumps(
            screening_result,
            indent=2,
        )
    )

    last_error = None

    for attempt in range(3):

        try:
            print(
                f"OpenRouter explanation "
                f"(attempt {attempt + 1}/3)"
            )

            response = get_client().chat.completions.create(
                model=MODEL,
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                temperature=0.1,
                max_tokens=500,

                # Prevent reasoning tokens from consuming
                # the entire completion for this simple task.
                extra_body={
                    "reasoning": {
                        "effort": "none"
                    }
                },
            )

            choice = response.choices[0]
            message = choice.message

            content = (
                message.content
                if message.content is not None
                else ""
            )

            print("\nOPENROUTER MODEL:")
            print(MODEL)

            print("\nFINISH REASON:")
            print(choice.finish_reason)

            print("\nOPENROUTER RAW CONTENT:")
            print(repr(content))

            if not content.strip():
                raise RuntimeError(
                    "OpenRouter returned an empty content field."
                )

            data = parse_json(content)

            return validate_result(data)

        except RateLimitError as error:

            last_error = error

            print(
                f"OpenRouter rate limited: {error}"
            )

            if attempt < 2:
                time.sleep(
                    3 * (attempt + 1)
                )

        except APIStatusError as error:

            last_error = error

            print(
                f"OpenRouter API error "
                f"{error.status_code}: {error}"
            )

            if error.status_code in {
                429,
                502,
                503,
                504,
            }:
                if attempt < 2:
                    time.sleep(
                        3 * (attempt + 1)
                    )
            else:
                raise

        except Exception as error:

            last_error = error

            print(
                f"Explanation error: "
                f"{type(error).__name__}: {error}"
            )

            raise

    raise RuntimeError(
        f"OpenRouter explanation failed: {last_error}"
    )