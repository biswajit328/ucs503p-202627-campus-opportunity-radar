from datetime import date, timedelta

from app.ai.schemas import ExtractedOpportunity
from app.ai.validation import validate_extraction


def _base_opportunity(**overrides) -> ExtractedOpportunity:
    defaults = dict(
        title="AI/ML Internship",
        category="INTERNSHIP",
        organizer="ABC Technologies",
        skills=["Python"],
        eligible_branches=["CSE"],
        eligible_academic_levels=["3rd Year"],
        mode="ONLINE",
        deadline=(date.today() + timedelta(days=10)).isoformat(),
        location="",
        is_uncertain=False,
        uncertainty_notes="",
    )
    defaults.update(overrides)
    return ExtractedOpportunity(**defaults)


def test_valid_extraction_needs_no_review():
    review = validate_extraction(_base_opportunity())
    assert review.needs_review is False
    assert review.issues == []


def test_invalid_deadline_flags_review():
    review = validate_extraction(_base_opportunity(deadline="not-a-date"))
    assert review.needs_review is True
    assert any("not a valid date" in issue for issue in review.issues)


def test_past_deadline_flags_review():
    past_date = (date.today() - timedelta(days=5)).isoformat()
    review = validate_extraction(_base_opportunity(deadline=past_date))
    assert review.needs_review is True
    assert any("already in the past" in issue for issue in review.issues)


def test_certain_but_empty_eligibility_gets_overridden():
    review = validate_extraction(
        _base_opportunity(is_uncertain=False, eligible_branches=[], eligible_academic_levels=[])
    )
    assert review.needs_review is True
    assert any("no eligibility" in issue for issue in review.issues)


def test_model_marked_uncertain_stays_flagged():
    review = validate_extraction(_base_opportunity(is_uncertain=True))
    assert review.needs_review is True


def test_empty_title_flags_review():
    review = validate_extraction(_base_opportunity(title="   "))
    assert review.needs_review is True
    assert any("Title is empty" in issue for issue in review.issues)