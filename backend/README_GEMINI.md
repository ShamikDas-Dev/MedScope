# MedScope — Gemini Vision Layer

This is the next practical milestone for MedScope.

## What it does

```text
Upload image
    ↓
Gemini Vision
    ↓
Structured modality + body-part result
```

It can be tested independently from the Hugging Face/PyTorch fracture model.

## 1. Create backend `.env`

Copy:

```text
.env.example
```

to:

```text
.env
```

Then add your Gemini API key:

```env
GEMINI_API_KEY=YOUR_KEY
GEMINI_MODEL=gemini-3.8-flash
```

Keep the key only in the backend.

## 2. Install

Activate your existing backend environment:

```powershell
cd D:\MedScope\backend
venv\Scripts\activate
```

Install:

```powershell
pip install -r requirements-gemini.txt
```

## 3. Start

```powershell
python -m uvicorn app.main:app --reload
```

## 4. Test

Open:

```text
http://127.0.0.1:8000/docs
```

Use:

```text
POST /api/inspect
```

Upload a JPG or PNG.

Expected response shape:

```json
{
  "status": "completed",
  "inspection": {
    "modality": "xray",
    "body_part": "wrist",
    "confidence": 0.94,
    "supported_v1": true,
    "note": "..."
  },
  "next_step": "fracture_screening",
  "message": "Gemini image inspection completed."
}
```

The actual values must come from Gemini. Nothing is hardcoded.

## Important

This endpoint is a routing/inspection experiment. It is not a medical diagnosis.

It deliberately does not call the Hugging Face fracture model.

The next stage will connect a real pretrained fracture inference service after the Windows PyTorch blocker is resolved or the model is moved to an allowed hosted environment.
