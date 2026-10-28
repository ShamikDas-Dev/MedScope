
import asyncio
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.llm.explanation import explain_result
from app.ml.fracture_client import predict_fracture
from app.ml.mri_client import predict_mri
from app.ml.vision_router import inspect_image

router = APIRouter(tags=["analysis"])

MAX_IMAGE_SIZE = 10 * 1024 * 1024
MAX_MRI_ZIP_SIZE = 100 * 1024 * 1024

SUPPORTED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "application/zip",
    "application/x-zip-compressed",
}


@router.post("/analyze")
async def analyze_image(
    image: UploadFile = File(...),
):
    # ----------------------------------
    # 1. Validate uploaded file
    # ----------------------------------
    if image.content_type not in SUPPORTED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Supported uploads are JPEG/PNG X-rays or "
                "a ZIP containing a DICOM MRI study."
            ),
        )

    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="The uploaded image is empty.",
        )

    filename = Path(image.filename or "upload.png").name
    extension = Path(filename).suffix.lower()

    if extension == ".zip":
        max_file_size = MAX_MRI_ZIP_SIZE
        size_message = "MRI ZIP is too large. Maximum size is 100 MB."
    else:
        max_file_size = MAX_IMAGE_SIZE
        size_message = "Image is too large. Maximum size is 10 MB."

    if len(image_bytes) > max_file_size:
        raise HTTPException(
            status_code=413,
            detail=size_message,
        )

    # =====================================================
    # 2. MRI PIPELINE
    # =====================================================
    if extension == ".zip":
        try:
            mri_result = await asyncio.to_thread(
                predict_mri,
                image_bytes,
                filename,
            )
        except Exception as error:
            print("\n===== MRI MODEL ERROR =====")
            print(f"{type(error).__name__}: {error}")
            print("===========================\n")
            raise HTTPException(
                status_code=503,
                detail={
                    "status": "error",
                    "stage": "mri_screening",
                    "message": (
                        "MRI screening is temporarily unavailable. "
                        "Please try again."
                    ),
                },
            ) from error

        if mri_result.get("status") != "completed":
            return {
                "status": mri_result.get("status", "error"),
                "file": {
                    "filename": filename,
                    "content_type": image.content_type,
                    "size_bytes": len(image_bytes),
                },
                "modality": {"label": "mri"},
                "body_part": {
                    "label": mri_result.get("body_part", "knee"),
                    "supported": False,
                },
                "message": mri_result.get(
                    "message",
                    "MRI analysis could not be completed.",
                ),
                "next_step": "stop",
            }

        explanation = None
        try:
            explanation_input = {
                "modality": "mri",
                "body_part": "knee",
                "fracture_screening": mri_result.get("fracture_screening", {}),
                "all_findings": mri_result.get("all_findings", {}),
            }
            explanation = await explain_result(explanation_input)
        except Exception as error:
            print("\n===== MRI EXPLANATION ERROR =====")
            print(f"{type(error).__name__}: {error}")
            print("=================================\n")

        return {
            "status": "completed",
            "file": {
                "filename": filename,
                "content_type": image.content_type,
                "size_bytes": len(image_bytes),
            },
            "modality": {"label": "mri"},
            "body_part": {
                "label": "knee",
                "supported": True,
            },
            "fracture_screening": mri_result.get("fracture_screening", {}),
            "all_findings": mri_result.get("all_findings", {}),
            "explanation": explanation,
            "message": (
                "AI-assisted knee MRI screening completed. "
                "This result is not a medical diagnosis."
            ),
            "next_step": "completed",
        }

    # =====================================================
    # 3. X-RAY PIPELINE
    # =====================================================
    try:
        inspection = await asyncio.to_thread(
            inspect_image,
            image_bytes,
            filename,
        )
    except Exception as error:
        print("\n===== IMAGE ROUTER ERROR =====")
        print(f"{type(error).__name__}: {error}")
        print("==============================\n")
        raise HTTPException(
            status_code=503,
            detail={
                "status": "error",
                "stage": "image_validation",
                "message": (
                    "The image could not be validated. "
                    "Please try again."
                ),
            },
        ) from error

    input_type = inspection.get("input_type", "other")
    modality = inspection["modality"]
    body_part = inspection["body_part"]
    confidence = inspection["confidence"]
    supported_v1 = inspection["supported_v1"]

    base_response = {
        "file": {
            "filename": filename,
            "content_type": image.content_type,
            "size_bytes": len(image_bytes),
        },
        "input_type": input_type,
        "modality": {
            "label": modality,
            "confidence": confidence,
        },
        "body_part": {
            "label": body_part,
            "supported": supported_v1,
        },
    }

    if input_type != "medical_image":
        return {
            "status": "rejected",
            **base_response,
            "message": (
                "The uploaded image does not appear "
                "to be an actual medical image."
            ),
            "next_step": "stop",
        }

    if modality != "xray":
        return {
            "status": "rejected",
            **base_response,
            "message": inspection["note"],
            "next_step": "stop",
        }

    if not supported_v1:
        return {
            "status": "unsupported",
            **base_response,
            "message": inspection["note"],
            "next_step": "stop",
        }

    # =====================================================
    # 4. X-RAY FRACTURE MODEL
    # =====================================================
    try:
        fracture_result = await asyncio.to_thread(
            predict_fracture,
            image_bytes,
            filename,
        )
    except Exception as error:
        print("\n===== FRACTURE MODEL ERROR =====")
        print(f"{type(error).__name__}: {error}")
        print("================================\n")
        raise HTTPException(
            status_code=503,
            detail={
                "status": "error",
                "stage": "fracture_screening",
                "message": (
                    "Fracture screening is temporarily unavailable. "
                    "Please try again."
                ),
            },
        ) from error

    # =====================================================
    # 5. X-RAY OPENROUTER EXPLANATION
    # =====================================================
    explanation = None
    try:
        explanation_input = {
            "modality": "xray",
            "body_part": body_part,
            "fracture_screening": fracture_result,
        }
        explanation = await explain_result(explanation_input)
    except Exception as error:
        print("\n===== EXPLANATION ERROR =====")
        print(f"{type(error).__name__}: {error}")
        print("=============================\n")

    # =====================================================
    # 6. FINAL X-RAY RESPONSE
    # =====================================================
    return {
        "status": "completed",
        **base_response,
        "fracture_screening": fracture_result,
        "explanation": explanation,
        "message": (
            "AI-assisted fracture screening completed. "
            "This result is not a medical diagnosis."
        ),
        "next_step": "completed",
    }