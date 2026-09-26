import uuid

from fastapi.testclient import TestClient

from app.core.database import SessionLocal
from app.main import app
from app.repositories.skill_repository import get_or_create_skill

client = TestClient(app)


def _register_and_login():
    email = f"test_{uuid.uuid4().hex[:10]}@example.com"
    password = "testpassword123"
    client.post("/auth/register", json={"email": email, "password": password})
    login_response = client.post("/auth/login", json={"email": email, "password": password})
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_create_profile():
    headers = _register_and_login()
    payload = {
        "name": "Test Student",
        "branch": "CSE",
        "semester": 4,
        "year": 2,
        "skills": ["Python", "SQL"],
        "interests": ["AI", "Hackathons"],
    }
    response = client.post("/users/me/profile", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["branch"] == "CSE"
    assert set(data["skills"]) == {"Python", "SQL"}
    assert set(data["interests"]) == {"AI", "Hackathons"}


def test_cannot_create_profile_twice():
    headers = _register_and_login()
    payload = {"name": "Test", "branch": "CSE", "semester": 4, "year": 2, "skills": [], "interests": []}
    client.post("/users/me/profile", json=payload, headers=headers)
    response = client.post("/users/me/profile", json=payload, headers=headers)
    assert response.status_code == 400


def test_get_profile_not_found():
    headers = _register_and_login()
    response = client.get("/users/me/profile", headers=headers)
    assert response.status_code == 404


def test_get_profile_after_create():
    headers = _register_and_login()
    payload = {"name": "Test", "branch": "ECE", "semester": 2, "year": 1, "skills": ["C++"], "interests": ["Robotics"]}
    client.post("/users/me/profile", json=payload, headers=headers)
    response = client.get("/users/me/profile", headers=headers)
    assert response.status_code == 200
    assert response.json()["branch"] == "ECE"


def test_update_profile():
    headers = _register_and_login()
    payload = {"name": "Test", "branch": "CSE", "semester": 4, "year": 2, "skills": ["Python"], "interests": ["AI"]}
    client.post("/users/me/profile", json=payload, headers=headers)

    response = client.put("/users/me/profile", json={"semester": 5, "skills": ["Python", "React"]}, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["semester"] == 5
    assert set(data["skills"]) == {"Python", "React"}


def test_profile_requires_auth():
    response = client.get("/users/me/profile")
    assert response.status_code == 401


def test_skill_dedup_is_case_insensitive():
    db = SessionLocal()
    try:
        skill_a = get_or_create_skill(db, "Python")
        skill_b = get_or_create_skill(db, "python")
        skill_c = get_or_create_skill(db, "PYTHON")
        assert skill_a.id == skill_b.id == skill_c.id
    finally:
        db.close()