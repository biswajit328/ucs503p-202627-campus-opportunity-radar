import json

from fastapi.testclient import TestClient

from app.ai.base import AIProvider
from app.ai.service import AIService
from app.main import app
from app.models.user import UserRole
from app.services import submission_service as submission_service_module
from tests.test_opportunities import _register_and_login

client = TestClient(app)

VALID_CANNED_JSON = json.dumps(
    {
        "title": "Campus Coding Contest",
        "category": "COMPETITION",
        "organizer": "Coding Club",
        "skills": ["Python", "Algorithms"],
        "eligible_branches": ["CSE"],
        "eligible_academic_levels": ["2nd Year"],
        "mode": "OFFLINE",
        "deadline": "2099-09-20",
        "location": "Main Auditorium",
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


def _patch_ai_service(monkeypatch, canned_json: str = VALID_CANNED_JSON):
    monkeypatch.setattr(
        submission_service_module,
        "AIService",
        lambda: AIService(provider=FakeProvider(canned_json)),
    )


def _create_org(headers, name="Coding Club"):
    response = client.post("/organizations", json={"name": name}, headers=headers)
    assert response.status_code == 201
    return response.json()


def test_create_organization_promotes_to_organizer():
    headers = _register_and_login(UserRole.STUDENT)
    _create_org(headers)
    me = client.get("/users/me", headers=headers)
    assert me.json()["role"] == "ORGANIZER"


def test_cannot_create_two_organizations():
    headers = _register_and_login(UserRole.STUDENT)
    _create_org(headers)
    response = client.post("/organizations", json={"name": "Second Org"}, headers=headers)
    assert response.status_code == 400


def test_submission_requires_organization():
    headers = _register_and_login(UserRole.STUDENT)
    response = client.post("/submissions", json={"raw_text": "some text"}, headers=headers)
    assert response.status_code == 400


def test_create_submission():
    headers = _register_and_login(UserRole.STUDENT)
    _create_org(headers)
    response = client.post("/submissions", json={"raw_text": "some text"}, headers=headers)
    assert response.status_code == 201
    assert response.json()["review_status"] == "PENDING"


def test_list_pending_requires_admin():
    headers = _register_and_login(UserRole.STUDENT)
    response = client.get("/submissions/pending", headers=headers)
    assert response.status_code == 403


def test_list_pending_shows_submission():
    headers = _register_and_login(UserRole.STUDENT)
    _create_org(headers)
    create_response = client.post("/submissions", json={"raw_text": "some text"}, headers=headers)
    submission_id = create_response.json()["id"]

    admin = _register_and_login(UserRole.ADMIN)
    response = client.get("/submissions/pending", headers=admin)
    assert submission_id in [s["id"] for s in response.json()]


def test_review_submission_runs_extraction(monkeypatch):
    _patch_ai_service(monkeypatch)
    headers = _register_and_login(UserRole.STUDENT)
    _create_org(headers)
    create_response = client.post("/submissions", json={"raw_text": "Coding Club contest..."}, headers=headers)
    submission_id = create_response.json()["id"]

    admin = _register_and_login(UserRole.ADMIN)
    response = client.get(f"/submissions/{submission_id}/review", headers=admin)
    assert response.status_code == 200
    assert response.json()["extracted"]["category"] == "COMPETITION"


def test_approve_submission_creates_opportunity(monkeypatch):
    _patch_ai_service(monkeypatch)
    headers = _register_and_login(UserRole.STUDENT)
    _create_org(headers)
    create_response = client.post("/submissions", json={"raw_text": "Coding Club contest..."}, headers=headers)
    submission_id = create_response.json()["id"]

    admin = _register_and_login(UserRole.ADMIN)
    response = client.post(f"/submissions/{submission_id}/approve", headers=admin)
    assert response.status_code == 201
    opportunity_id = response.json()["opportunity_id"]

    get_response = client.get(f"/opportunities/{opportunity_id}", headers=admin)
    assert get_response.json()["title"] == "Campus Coding Contest"


def test_cannot_approve_twice(monkeypatch):
    _patch_ai_service(monkeypatch)
    headers = _register_and_login(UserRole.STUDENT)
    _create_org(headers)
    create_response = client.post("/submissions", json={"raw_text": "some text"}, headers=headers)
    submission_id = create_response.json()["id"]

    admin = _register_and_login(UserRole.ADMIN)
    client.post(f"/submissions/{submission_id}/approve", headers=admin)
    second = client.post(f"/submissions/{submission_id}/approve", headers=admin)
    assert second.status_code == 400


def test_reject_submission(monkeypatch):
    _patch_ai_service(monkeypatch)
    headers = _register_and_login(UserRole.STUDENT)
    _create_org(headers)
    create_response = client.post("/submissions", json={"raw_text": "some text"}, headers=headers)
    submission_id = create_response.json()["id"]

    admin = _register_and_login(UserRole.ADMIN)
    response = client.post(f"/submissions/{submission_id}/reject", headers=admin)
    assert response.status_code == 200
    assert response.json()["review_status"] == "REJECTED"


def test_non_admin_cannot_approve():
    headers = _register_and_login(UserRole.STUDENT)
    _create_org(headers)
    create_response = client.post("/submissions", json={"raw_text": "some text"}, headers=headers)
    submission_id = create_response.json()["id"]

    other_student = _register_and_login(UserRole.STUDENT)
    response = client.post(f"/submissions/{submission_id}/approve", headers=other_student)
    assert response.status_code == 403