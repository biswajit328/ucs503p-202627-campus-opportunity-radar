import uuid
from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient

from app.core.database import SessionLocal
from app.main import app
from app.models.user import User, UserRole

client = TestClient(app)


def _register_and_login(role: UserRole = UserRole.STUDENT):
    email = f"test_{uuid.uuid4().hex[:10]}@example.com"
    password = "testpassword123"
    client.post("/auth/register", json={"email": email, "password": password})

    if role == UserRole.ADMIN:
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.email == email).first()
            user.role = UserRole.ADMIN
            db.commit()
        finally:
            db.close()

    login_response = client.post("/auth/login", json={"email": email, "password": password})
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _sample_payload(title: str = "AI/ML Campus Hackathon") -> dict:
    return {
        "title": title,
        "description": "48-hour hackathon focused on applied machine learning projects.",
        "category": "HACKATHON",
        "organizer": "CSE Department",
        "deadline": (datetime.now(timezone.utc) + timedelta(days=20)).isoformat(),
        "mode": "OFFLINE",
        "registration_url": "https://example.com/register",
        "skills": ["Python", "Machine Learning"],
        "eligibility": {
            "eligible_branches": ["CSE", "IT"],
            "eligible_semesters": [4, 5, 6],
            "is_uncertain": False,
        },
    }


def test_admin_can_create_opportunity():
    headers = _register_and_login(UserRole.ADMIN)
    response = client.post("/opportunities", json=_sample_payload(), headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "AI/ML Campus Hackathon"
    assert set(data["skills"]) == {"Python", "Machine Learning"}
    assert data["eligibility"]["eligible_branches"] == ["CSE", "IT"]


def test_student_cannot_create_opportunity():
    headers = _register_and_login(UserRole.STUDENT)
    response = client.post("/opportunities", json=_sample_payload(), headers=headers)
    assert response.status_code == 403


def test_create_requires_auth():
    response = client.post("/opportunities", json=_sample_payload())
    assert response.status_code == 401


def test_list_opportunities():
    admin_headers = _register_and_login(UserRole.ADMIN)
    client.post("/opportunities", json=_sample_payload("Unique Listing Test"), headers=admin_headers)

    student_headers = _register_and_login(UserRole.STUDENT)
    response = client.get("/opportunities", headers=student_headers)
    assert response.status_code == 200
    titles = [o["title"] for o in response.json()]
    assert "Unique Listing Test" in titles


def test_get_single_opportunity():
    admin_headers = _register_and_login(UserRole.ADMIN)
    create_response = client.post("/opportunities", json=_sample_payload("Fetch Me"), headers=admin_headers)
    opportunity_id = create_response.json()["id"]

    response = client.get(f"/opportunities/{opportunity_id}", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["title"] == "Fetch Me"


def test_get_nonexistent_opportunity_404():
    headers = _register_and_login(UserRole.STUDENT)
    response = client.get("/opportunities/999999", headers=headers)
    assert response.status_code == 404


def test_admin_can_update_opportunity():
    headers = _register_and_login(UserRole.ADMIN)
    create_response = client.post("/opportunities", json=_sample_payload("Before Update"), headers=headers)
    opportunity_id = create_response.json()["id"]

    response = client.put(f"/opportunities/{opportunity_id}", json={"title": "After Update"}, headers=headers)
    assert response.status_code == 200
    assert response.json()["title"] == "After Update"


def test_student_cannot_update_opportunity():
    admin_headers = _register_and_login(UserRole.ADMIN)
    create_response = client.post("/opportunities", json=_sample_payload("Locked"), headers=admin_headers)
    opportunity_id = create_response.json()["id"]

    student_headers = _register_and_login(UserRole.STUDENT)
    response = client.put(f"/opportunities/{opportunity_id}", json={"title": "Hacked"}, headers=student_headers)
    assert response.status_code == 403


def test_admin_can_delete_opportunity():
    headers = _register_and_login(UserRole.ADMIN)
    create_response = client.post("/opportunities", json=_sample_payload("To Delete"), headers=headers)
    opportunity_id = create_response.json()["id"]

    delete_response = client.delete(f"/opportunities/{opportunity_id}", headers=headers)
    assert delete_response.status_code == 204

    get_response = client.get(f"/opportunities/{opportunity_id}", headers=headers)
    assert get_response.status_code == 404