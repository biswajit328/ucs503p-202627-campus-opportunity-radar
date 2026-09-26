import json

from app.ai.base import AIProvider
from app.ai.extraction import extract_opportunity
from app.ai.schemas import ExtractedOpportunity
from app.ai.service import AIService


class FakeProvider(AIProvider):
    """Returns a canned response instead of calling the real Gemini API —
    keeps this test fast, free, and independent of network/quota in CI."""

    def __init__(self, canned_json: str):
        self._canned_json = canned_json

    def generate_text(self, prompt: str) -> str:
        return self._canned_json

    def generate_structured(self, prompt: str, schema) -> str:
        return self._canned_json


def test_extract_opportunity_parses_valid_response():
    canned = json.dumps(
        {
            "title": "AI/ML Internship at ABC Technologies",
            "category": "INTERNSHIP",
            "organizer": "ABC Technologies",
            "skills": ["Python", "Machine Learning"],
            "eligible_branches": ["CSE", "IT"],
            "eligible_academic_levels": ["3rd Year", "4th Year"],
            "mode": "ONLINE",
            "deadline": "2026-09-20",
            "location": "",
            "is_uncertain": False,
            "uncertainty_notes": "",
        }
    )
    service = AIService(provider=FakeProvider(canned))

    result = extract_opportunity(service, "ABC Technologies is organizing an AI/ML internship...")

    assert isinstance(result, ExtractedOpportunity)
    assert result.category.value == "INTERNSHIP"
    assert result.mode.value == "ONLINE"
    assert "Python" in result.skills
    assert result.eligible_branches == ["CSE", "IT"]