import os

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
model = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

print("API KEY FOUND:", bool(api_key))
print("MODEL:", model)

if not api_key:
    raise RuntimeError("GEMINI_API_KEY is missing")

client = genai.Client(api_key=api_key)

with open(r"D:\MedScope\test\xray.png", "rb") as f:
    image_bytes = f.read()

response = client.models.generate_content(
    model=model,
    contents=[
        types.Part.from_bytes(
            data=image_bytes,
            mime_type="image/png",
        ),
        "Is this an X-ray? Answer in one sentence.",
    ],
)

print("\nGEMINI RESPONSE:")
print(response.text)