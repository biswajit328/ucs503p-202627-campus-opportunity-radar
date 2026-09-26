import json

from fastapi.testclient import TestClient

from app.ai.base import AIProvider
from app.ai.service import AIService
from app.api import ingestion as ingestion_module
from app.main import app
from app.models.user import UserRole
from tests.test_opportunities import _register_and_login

client = TestClient(app)

VALID_CANNED_JSON = json.dumps(
    {
        "title": "AI/ML Internship",
        "category": "INTERNSHIP",
        "organizer": "ABC Technologies",
        "skills": ["Python", "ML"],
        "eligible_branches": ["CSE", "IT"],
        "eligible_academic_levels": ["3rd Year", "4th Year"],
        "mode": "ONLINE",
        "deadline": "2099-09-20",
        "location": "Remote",
        "is_uncertain": False,
        "uncertainty_notes": "",
    }
)


class FakeProvider(AIProvider):
    def __init__(self, canned_json: str):
        self._canned_json = canned_json

    def generate_text(self, prompt: str) -> str:
        return self._canned_json

    def generate_structured(self, prompt: str, schema) -> str:
        return self._canned_json


def _patch_ai_service(monkeypatch, canned_json: str):
    monkeypatch.setattr(
        ingestion_module,
        "AIService",
        lambda: AIService(provider=FakeProvider(canned_json)),
    )


def test_extract_requires_admin():
    headers = _register_and_login(UserRole.STUDENT)
    response = client.post("/ingestion/extract", json={"raw_text": "some text"}, headers=headers)
    assert response.status_code == 403


def test_extract_rejects_empty_text():
    headers = _register_and_login(UserRole.ADMIN)
    response = client.post("/ingestion/extract", json={"raw_text": "   "}, headers=headers)
    assert response.status_code == 400


def test_extract_returns_structured_result(monkeypatch):
    _patch_ai_service(monkeypatch, VALID_CANNED_JSON)
    headers = _register_and_login(UserRole.ADMIN)

    response = client.post(
        "/ingestion/extract",
        json={"raw_text": "ABC Technologies is organizing an AI/ML internship..."},
        headers=headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["extracted"]["category"] == "INTERNSHIP"
    assert data["review"]["needs_review"] is False


def test_extract_flags_review_when_deadline_invalid(monkeypatch):
    bad_canned = json.dumps(
        {
            "title": "Vague Workshop",
            "category": "WORKSHOP",
            "organizer": "Some Club",
            "skills": [],
            "eligible_branches": [],
            "eligible_academic_levels": [],
            "mode": "OFFLINE",
            "deadline": "",
            "location": "",
            "is_uncertain": True,
            "uncertainty_notes": "Nothing concrete stated.",
        }
    )
    _patch_ai_service(monkeypatch, bad_canned)
    headers = _register_and_login(UserRole.ADMIN)

    response = client.post(
        "/ingestion/extract",
        json={"raw_text": "some vague announcement"},
        headers=headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["review"]["needs_review"] is True
    assert len(data["review"]["issues"]) > 0