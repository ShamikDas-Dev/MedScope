from fastapi import APIRouter, File, HTTPException, UploadFile

from app.llm.gemini_vision import inspect_image

router = APIRouter(tags=["inspection"])

MAX_FILE_SIZE = 10 * 1024 * 1024
SUPPORTED_MIME_TYPES = {"image/jpeg", "image/png"}


@router.post("/inspect")
async def inspect_uploaded_image(image: UploadFile = File(...)):
    """Gemini-only image routing test endpoint."""
    if image.content_type not in SUPPORTED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG and PNG images are supported.")

    content = await image.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="Image is too large. Maximum size is 10 MB.")
    if not content:
        raise HTTPException(status_code=400, detail="The uploaded image is empty.")

    try:
        inspection = await inspect_image(content, image.content_type)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Gemini image inspection is temporarily unavailable.") from exc

    return {
        "status": "completed",
        "inspection": inspection,
        "next_step": "fracture_screening" if inspection["supported_v1"] else "reject_or_mark_unsupported",
        "message": "Gemini image inspection completed.",
    }
