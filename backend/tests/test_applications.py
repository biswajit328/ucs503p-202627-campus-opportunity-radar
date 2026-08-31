from app.models.user import UserRole
from tests.test_opportunities import _register_and_login, _sample_payload
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _create_profile(headers):
    payload = {
        "name": "Tracker Tester",
        "branch": "CSE",
        "semester": 4,
        "year": 2,
        "skills": ["Python"],
        "interests": ["AI"],
    }
    response = client.post("/users/me/profile", json=payload, headers=headers)
    assert response.status_code == 201


def _create_opportunity(admin_headers, title="Trackable Opportunity"):
    response = client.post("/opportunities", json=_sample_payload(title), headers=admin_headers)
    assert response.status_code == 201
    return response.json()["id"]


def test_track_requires_profile():
    admin = _register_and_login(UserRole.ADMIN)
    opportunity_id = _create_opportunity(admin)

    student = _register_and_login(UserRole.STUDENT)  # no profile
    response = client.post("/applications", json={"opportunity_id": opportunity_id}, headers=student)
    assert response.status_code == 400


def test_create_application_defaults_to_saved():
    admin = _register_and_login(UserRole.ADMIN)
    opportunity_id = _create_opportunity(admin, "Default Status Test")

    student = _register_and_login(UserRole.STUDENT)
    _create_profile(student)

    response = client.post("/applications", json={"opportunity_id": opportunity_id}, headers=student)
    assert response.status_code == 201
    assert response.json()["status"] == "SAVED"


def test_list_my_applications():
    admin = _register_and_login(UserRole.ADMIN)
    opportunity_id = _create_opportunity(admin, "List Applications Test")

    student = _register_and_login(UserRole.STUDENT)
    _create_profile(student)
    client.post("/applications", json={"opportunity_id": opportunity_id}, headers=student)

    response = client.get("/applications", headers=student)
    assert response.status_code == 200
    ids = [a["opportunity_id"] for a in response.json()]
    assert opportunity_id in ids


def test_update_application_status():
    admin = _register_and_login(UserRole.ADMIN)
    opportunity_id = _create_opportunity(admin, "Update Status Test")

    student = _register_and_login(UserRole.STUDENT)
    _create_profile(student)
    create_response = client.post("/applications", json={"opportunity_id": opportunity_id}, headers=student)
    application_id = create_response.json()["id"]

    response = client.patch(f"/applications/{application_id}", json={"status": "APPLIED"}, headers=student)
    assert response.status_code == 200
    assert response.json()["status"] == "APPLIED"


def test_cannot_update_another_students_application():
    admin = _register_and_login(UserRole.ADMIN)
    opportunity_id = _create_opportunity(admin, "Ownership Test")

    student_a = _register_and_login(UserRole.STUDENT)
    _create_profile(student_a)
    create_response = client.post("/applications", json={"opportunity_id": opportunity_id}, headers=student_a)
    application_id = create_response.json()["id"]

    student_b = _register_and_login(UserRole.STUDENT)
    _create_profile(student_b)
    response = client.patch(f"/applications/{application_id}", json={"status": "APPLIED"}, headers=student_b)
    assert response.status_code == 404


def test_applications_require_auth():
    response = client.get("/applications")
    assert response.status_code == 401