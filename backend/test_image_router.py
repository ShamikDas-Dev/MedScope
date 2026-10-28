from pathlib import Path

from app.ml.vision_router import inspect_image


image_path = Path(r"D:\MedScope\test\xray.png")

if not image_path.exists():
    raise FileNotFoundError(image_path)

result = inspect_image(
    image_bytes=image_path.read_bytes(),
    filename=image_path.name,
)

print("\nIMAGE ROUTER RESULT:")
print(result)