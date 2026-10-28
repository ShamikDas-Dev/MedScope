from pathlib import Path

from app.llm.openrouter_vision import inspect_image


image_path = Path(r"D:\MedScope\test\xray.png")

if not image_path.exists():
    raise FileNotFoundError(
        f"Image not found: {image_path}"
    )

image_bytes = image_path.read_bytes()

result = inspect_image(
    image_bytes=image_bytes,
    mime_type="image/png",
)

print("\nINSPECTION RESULT:")
print(result)