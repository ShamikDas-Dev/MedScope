import asyncio
from pathlib import Path

from app.llm.gemini_vision import inspect_image


async def main():
    image_path = Path(r"D:\MedScope\test\xray.png")

    if not image_path.exists():
        raise FileNotFoundError(
            f"Image not found: {image_path}"
        )

    image_bytes = image_path.read_bytes()

    print("Testing MedScope inspection...")
    print("Image:", image_path)
    print("Size:", len(image_bytes))

    result = await inspect_image(
        image_bytes=image_bytes,
        mime_type="image/png",
    )

    print("\nINSPECTION RESULT:")
    print(result)


if __name__ == "__main__":
    asyncio.run(main())