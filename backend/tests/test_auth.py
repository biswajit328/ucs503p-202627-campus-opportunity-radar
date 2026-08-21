import uuid

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _unique_email() -> str:
    return f"test_{uuid.uuid4().hex[:10]}@example.com"


def test_register_and_login():
    email = _unique_email()
    password = "testpassword123"

    register_response = client.post("/auth/register", json={"email": email, "password": password})
    assert register_response.status_code == 201
    assert register_response.json()["email"] == email

    login_response = client.post("/auth/login", json={"email": email, "password": password})
    assert login_response.status_code == 200
    assert "access_token" in login_response.json()


def test_login_with_wrong_password_fails():
    email = _unique_email()
    client.post("/auth/register", json={"email": email, "password": "testpassword123"})

    login_response = client.post("/auth/login", json={"email": email, "password": "wrongpassword"})
    assert login_response.status_code == 401


def test_me_requires_token():
    response = client.get("/users/me")
    assert response.status_code == 401


def test_me_returns_current_user():
    email = _unique_email()
    password = "testpassword123"
    client.post("/auth/register", json={"email": email, "password": password})
    login_response = client.post("/auth/login", json={"email": email, "password": password})
    token = login_response.json()["access_token"]

    me_response = client.get("/users/me", headers={"Authorization": f"Bearer {token}"})
    assert me_response.status_code == 200
    assert me_response.json()["email"] == email