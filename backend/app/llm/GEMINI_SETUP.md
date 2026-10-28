# Gemini setup

Google's current Gemini Python SDK can send image bytes using:

```python
types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg")
```

and `generate_content()` can return structured JSON when a response schema is supplied.

MedScope uses that approach so the frontend receives a predictable object rather than arbitrary prose.

Never place `GEMINI_API_KEY` in the React frontend.
