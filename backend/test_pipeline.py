from fastapi.testclient import TestClient

from app.main import app
from app.api.routes import analyze as analyze_route


client = TestClient(app)


# ---------------------------------------------------------
# Fake external services
# ---------------------------------------------------------

def fake_router_wrist(*args, **kwargs):
    return {
        "input_type": "medical_image",
        "modality": "xray",
        "body_part": "wrist",
        "confidence": 0.95,
        "supported_v1": True,
        "note": "Actual wrist X-ray.",
    }


def fake_router_knee(*args, **kwargs):
    return {
        "input_type": "medical_image",
        "modality": "xray",
        "body_part": "knee",
        "confidence": 0.96,
        "supported_v1": True,
        "note": "Actual knee X-ray.",
    }


def fake_router_screenshot(*args, **kwargs):
    return {
        "input_type": "screenshot",
        "modality": "unknown",
        "body_part": "unknown",
        "confidence": 0.99,
        "supported_v1": False,
        "note": "Computer screenshot.",
    }


def fake_router_chest(*args, **kwargs):
    return {
        "input_type": "medical_image",
        "modality": "xray",
        "body_part": "chest",
        "confidence": 0.95,
        "supported_v1": False,
        "note": "Chest X-ray is unsupported in V1.",
    }


def fake_fracture_model(*args, **kwargs):
    return {
        "prediction": "Fractured",
        "probabilities": {
            "Fractured": 0.57,
            "Not Fractured": 0.43,
        },
    }


async def fake_explanation(*args, **kwargs):
    return {
        "summary": (
            "AI-assisted screening suggests a possible fracture."
        ),
        "meaning": (
            "The model assigned a higher probability to the "
            "fractured class."
        ),
        "next_step": (
            "Have the X-ray reviewed by a qualified clinician."
        ),
        "warning": (
            "This is an AI-assisted screening result, "
            "not a medical diagnosis."
        ),
    }


# ---------------------------------------------------------
# Tests
# ---------------------------------------------------------

def test_wrist_pipeline(monkeypatch):

    monkeypatch.setattr(
        analyze_route,
        "inspect_image",
        fake_router_wrist,
    )

    monkeypatch.setattr(
        analyze_route,
        "predict_fracture",
        fake_fracture_model,
    )

    monkeypatch.setattr(
        analyze_route,
        "explain_result",
        fake_explanation,
    )

    response = client.post(
        "/api/analyze",
        files={
            "image": (
                "wrist.png",
                b"fake-image-data",
                "image/png",
            )
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "completed"
    assert data["input_type"] == "medical_image"
    assert data["modality"]["label"] == "xray"
    assert data["body_part"]["label"] == "wrist"

    assert (
        data["fracture_screening"]["prediction"]
        == "Fractured"
    )

    assert data["explanation"] is not None


def test_knee_pipeline(monkeypatch):

    monkeypatch.setattr(
        analyze_route,
        "inspect_image",
        fake_router_knee,
    )

    monkeypatch.setattr(
        analyze_route,
        "predict_fracture",
        fake_fracture_model,
    )

    monkeypatch.setattr(
        analyze_route,
        "explain_result",
        fake_explanation,
    )

    response = client.post(
        "/api/analyze",
        files={
            "image": (
                "knee.png",
                b"fake-image-data",
                "image/png",
            )
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "completed"
    assert data["body_part"]["label"] == "knee"


def test_screenshot_is_rejected(monkeypatch):

    monkeypatch.setattr(
        analyze_route,
        "inspect_image",
        fake_router_screenshot,
    )

    # This should never be reached.
    def fracture_model_should_not_run(*args, **kwargs):
        raise AssertionError(
            "Fracture model was called for a screenshot."
        )

    monkeypatch.setattr(
        analyze_route,
        "predict_fracture",
        fracture_model_should_not_run,
    )

    response = client.post(
        "/api/analyze",
        files={
            "image": (
                "screenshot.png",
                b"fake-image-data",
                "image/png",
            )
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "rejected"
    assert data["input_type"] == "screenshot"
    assert data["next_step"] == "stop"


def test_unsupported_xray_is_rejected(monkeypatch):

    monkeypatch.setattr(
        analyze_route,
        "inspect_image",
        fake_router_chest,
    )

    # This should never be reached.
    def fracture_model_should_not_run(*args, **kwargs):
        raise AssertionError(
            "Fracture model was called for unsupported anatomy."
        )

    monkeypatch.setattr(
        analyze_route,
        "predict_fracture",
        fracture_model_should_not_run,
    )

    response = client.post(
        "/api/analyze",
        files={
            "image": (
                "chest.png",
                b"fake-image-data",
                "image/png",
            )
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "unsupported"
    assert data["body_part"]["label"] == "chest"
    assert data["body_part"]["supported"] is False
    assert data["next_step"] == "stop"


def test_invalid_file_type():

    response = client.post(
        "/api/analyze",
        files={
            "image": (
                "test.txt",
                b"hello",
                "text/plain",
            )
        },
    )

    assert response.status_code == 400


def test_empty_file():

    response = client.post(
        "/api/analyze",
        files={
            "image": (
                "empty.png",
                b"",
                "image/png",
            )
        },
    )

    assert response.status_code == 400


def test_image_router_failure(monkeypatch):

    def failing_router(*args, **kwargs):
        raise RuntimeError("temporary router failure")

    monkeypatch.setattr(
        analyze_route,
        "inspect_image",
        failing_router,
    )

    response = client.post(
        "/api/analyze",
        files={
            "image": (
                "test.png",
                b"fake-image-data",
                "image/png",
            )
        },
    )

    assert response.status_code == 503

    data = response.json()

    assert data["detail"]["status"] == "error"
    assert data["detail"]["stage"] == "image_validation"

    # Technical exception must not leak into the API response.
    assert "temporary router failure" not in str(data)


def test_fracture_model_failure(monkeypatch):

    monkeypatch.setattr(
        analyze_route,
        "inspect_image",
        fake_router_wrist,
    )

    def failing_model(*args, **kwargs):
        raise RuntimeError("temporary fracture failure")

    monkeypatch.setattr(
        analyze_route,
        "predict_fracture",
        failing_model,
    )

    response = client.post(
        "/api/analyze",
        files={
            "image": (
                "wrist.png",
                b"fake-image-data",
                "image/png",
            )
        },
    )

    assert response.status_code == 503

    data = response.json()

    assert data["detail"]["status"] == "error"
    assert data["detail"]["stage"] == "fracture_screening"

    assert "temporary fracture failure" not in str(data)