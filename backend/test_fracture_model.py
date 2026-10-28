import os

from dotenv import load_dotenv
from gradio_client import Client, handle_file

load_dotenv()

SPACE = "ShamikDas-Dev/medscope-fracture-model"
HF_TOKEN = os.getenv("HF_TOKEN")

if not HF_TOKEN:
    raise RuntimeError(
        "HF_TOKEN is missing from D:\\MedScope\\backend\\.env"
    )

print("HF TOKEN FOUND: True")
print("TOKEN PREFIX:", HF_TOKEN[:7])

client = Client(
    SPACE,
    token=HF_TOKEN,
)

result = client.predict(
    handle_file(r"D:\MedScope\test\xray.png"),
    api_name="/predict",
)

print("\nMODEL RESULT:")
print(result)