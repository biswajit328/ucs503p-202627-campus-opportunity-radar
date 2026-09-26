from unittest.mock import patch
from fastapi.testclient import TestClient
from google.genai.errors import ServerError
import pytest

from app.main import app
from app.models.user import UserRole
from app.ai.base import AIProvider
from app.ai.service import AIService
from app.services import submission_service as submission_service_module
from tests.test_opportunities import _register_and_login
from tests.test_submissions import _create_org, VALID_CANNED_JSON

client = TestClient(app)

class FlakyProvider(AIProvider):
    def __init__(self, canned_json: str, fail_times: int):
        self._canned_json = canned_json
        self.fail_times = fail_times
        self.attempts = 0

    def generate_text(self, prompt: str) -> str:
        self.attempts += 1
        if self.attempts <= self.fail_times:
            raise ServerError("503 UNAVAILABLE", 503)
        return self._canned_json

    def generate_structured(self, prompt: str, schema) -> str:
        self.attempts += 1
        if self.attempts <= self.fail_times:
            raise ServerError("503 UNAVAILABLE", 503)
        return self._canned_json

def test_gemini_success(monkeypatch):
    monkeypatch.setattr(
        submission_service_module,
        "AIService",
        lambda: AIService(provider=FlakyProvider(VALID_CANNED_JSON, fail_times=0)),
    )
    headers = _register_and_login(UserRole.STUDENT)
    _create_org(headers)
    create_response = client.post("/submissions", json={"raw_text": "text"}, headers=headers)
    submission_id = create_response.json()["id"]

    admin = _register_and_login(UserRole.ADMIN)
    response = client.get(f"/submissions/{submission_id}/review", headers=admin)
    assert response.status_code == 200

def test_gemini_503_followed_by_success(monkeypatch):
    provider = FlakyProvider(VALID_CANNED_JSON, fail_times=1)
    monkeypatch.setattr(
        submission_service_module,
        "AIService",
        lambda: AIService(provider=provider),
    )
    headers = _register_and_login(UserRole.STUDENT)
    _create_org(headers)
    create_response = client.post("/submissions", json={"raw_text": "text"}, headers=headers)
    submission_id = create_response.json()["id"]

    admin = _register_and_login(UserRole.ADMIN)
    
    # First attempt raises 503
    response1 = client.get(f"/submissions/{submission_id}/review", headers=admin)
    assert response1.status_code == 503
    assert "temporarily unavailable" in response1.json()["detail"]

    # Second attempt succeeds (since fail_times=1)
    response2 = client.get(f"/submissions/{submission_id}/review", headers=admin)
    assert response2.status_code == 200
    assert response2.json()["extracted"]["category"] == "COMPETITION"

def test_gemini_persistent_503(monkeypatch):
    provider = FlakyProvider(VALID_CANNED_JSON, fail_times=5)
    monkeypatch.setattr(
        submission_service_module,
        "AIService",
        lambda: AIService(provider=provider),
    )
    headers = _register_and_login(UserRole.STUDENT)
    _create_org(headers)
    create_response = client.post("/submissions", json={"raw_text": "text"}, headers=headers)
    submission_id = create_response.json()["id"]

    admin = _register_and_login(UserRole.ADMIN)
    response = client.get(f"/submissions/{submission_id}/review", headers=admin)
    assert response.status_code == 503
    assert "temporarily unavailable" in response.json()["detail"]
