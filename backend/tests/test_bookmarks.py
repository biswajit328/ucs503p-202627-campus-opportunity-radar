from app.models.user import UserRole
from tests.test_opportunities import _register_and_login, _sample_payload
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _create_profile(headers):
    payload = {
        "name": "Bookmark Tester",
        "branch": "CSE",
        "semester": 4,
        "year": 2,
        "skills": ["Python"],
        "interests": ["AI"],
    }
    response = client.post("/users/me/profile", json=payload, headers=headers)
    assert response.status_code == 201


def _create_opportunity(admin_headers, title="Bookmarkable Opportunity"):
    response = client.post("/opportunities", json=_sample_payload(title), headers=admin_headers)
    assert response.status_code == 201
    return response.json()["id"]


def test_bookmark_requires_profile():
    admin = _register_and_login(UserRole.ADMIN)
    opportunity_id = _create_opportunity(admin)

    student = _register_and_login(UserRole.STUDENT)  # no profile created
    response = client.post(f"/opportunities/{opportunity_id}/bookmark", headers=student)
    assert response.status_code == 400


def test_create_and_list_bookmark():
    admin = _register_and_login(UserRole.ADMIN)
    opportunity_id = _create_opportunity(admin, "List Test Opportunity")

    student = _register_and_login(UserRole.STUDENT)
    _create_profile(student)

    create_response = client.post(f"/opportunities/{opportunity_id}/bookmark", headers=student)
    assert create_response.status_code == 201
    assert create_response.json()["opportunity_id"] == opportunity_id

    list_response = client.get("/bookmarks", headers=student)
    assert list_response.status_code == 200
    ids = [b["opportunity_id"] for b in list_response.json()]
    assert opportunity_id in ids


def test_cannot_bookmark_same_opportunity_twice():
    admin = _register_and_login(UserRole.ADMIN)
    opportunity_id = _create_opportunity(admin, "Duplicate Test Opportunity")

    student = _register_and_login(UserRole.STUDENT)
    _create_profile(student)

    first = client.post(f"/opportunities/{opportunity_id}/bookmark", headers=student)
    assert first.status_code == 201

    second = client.post(f"/opportunities/{opportunity_id}/bookmark", headers=student)
    assert second.status_code == 400


def test_delete_bookmark():
    admin = _register_and_login(UserRole.ADMIN)
    opportunity_id = _create_opportunity(admin, "Delete Test Opportunity")

    student = _register_and_login(UserRole.STUDENT)
    _create_profile(student)

    client.post(f"/opportunities/{opportunity_id}/bookmark", headers=student)

    delete_response = client.delete(f"/opportunities/{opportunity_id}/bookmark", headers=student)
    assert delete_response.status_code == 204

    list_response = client.get("/bookmarks", headers=student)
    ids = [b["opportunity_id"] for b in list_response.json()]
    assert opportunity_id not in ids


def test_delete_nonexistent_bookmark_404():
    admin = _register_and_login(UserRole.ADMIN)
    opportunity_id = _create_opportunity(admin, "Never Bookmarked")

    student = _register_and_login(UserRole.STUDENT)
    _create_profile(student)

    response = client.delete(f"/opportunities/{opportunity_id}/bookmark", headers=student)
    assert response.status_code == 404


def test_bookmarks_require_auth():
    response = client.get("/bookmarks")
    assert response.status_code == 401