from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient

from app.main import app
from tests.test_opportunities import _register_and_login, _sample_payload
from app.models.user import UserRole

client = TestClient(app)


def _create_opportunity(headers, **overrides):
    payload = _sample_payload(overrides.pop("title", "Search Test Opportunity"))
    payload.update(overrides)
    response = client.post("/opportunities", json=payload, headers=headers)
    assert response.status_code == 201
    return response.json()


def test_search_by_keyword():
    admin = _register_and_login(UserRole.ADMIN)
    _create_opportunity(admin, title="Keyword Match Hackathon")
    student = _register_and_login(UserRole.STUDENT)

    response = client.get("/opportunities/search?keyword=Keyword Match", headers=student)
    assert response.status_code == 200
    titles = [o["title"] for o in response.json()]
    assert "Keyword Match Hackathon" in titles


def test_search_by_skill():
    admin = _register_and_login(UserRole.ADMIN)
    _create_opportunity(admin, title="Skill Filter Test", skills=["Rust", "WebAssembly"])
    student = _register_and_login(UserRole.STUDENT)

    response = client.get("/opportunities/search?skill=Rust", headers=student)
    assert response.status_code == 200
    titles = [o["title"] for o in response.json()]
    assert "Skill Filter Test" in titles

    response_miss = client.get("/opportunities/search?skill=Cobol", headers=student)
    titles_miss = [o["title"] for o in response_miss.json()]
    assert "Skill Filter Test" not in titles_miss


def test_search_by_branch_excludes_non_matching():
    admin = _register_and_login(UserRole.ADMIN)
    _create_opportunity(
        admin,
        title="Mechanical Only",
        eligibility={"eligible_branches": ["MECH"], "eligible_semesters": [3], "is_uncertain": False},
    )
    student = _register_and_login(UserRole.STUDENT)

    response = client.get("/opportunities/search?branch=MECH", headers=student)
    titles = [o["title"] for o in response.json()]
    assert "Mechanical Only" in titles

    response_other = client.get("/opportunities/search?branch=CSE", headers=student)
    titles_other = [o["title"] for o in response_other.json()]
    assert "Mechanical Only" not in titles_other


def test_search_by_category_and_mode():
    admin = _register_and_login(UserRole.ADMIN)
    payload = _sample_payload("Combo Filter Test")
    payload["category"] = "WORKSHOP"
    payload["mode"] = "ONLINE"
    client.post("/opportunities", json=payload, headers=admin)

    student = _register_and_login(UserRole.STUDENT)
    response = client.get("/opportunities/search?category=WORKSHOP&mode=ONLINE", headers=student)
    titles = [o["title"] for o in response.json()]
    assert "Combo Filter Test" in titles


def test_search_only_returns_approved():
    response = client.get("/opportunities/search", headers=_register_and_login(UserRole.STUDENT))
    assert response.status_code == 200
    for opportunity in response.json():
        assert opportunity["status"] == "APPROVED"


def test_search_requires_auth():
    response = client.get("/opportunities/search")
    assert response.status_code == 401