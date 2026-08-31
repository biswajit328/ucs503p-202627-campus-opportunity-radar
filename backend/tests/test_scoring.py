from datetime import datetime, timedelta, timezone

from app.models.interest import Interest
from app.models.opportunity import Opportunity, OpportunityCategory, OpportunityMode
from app.models.opportunity_eligibility import OpportunityEligibility
from app.models.skill import Skill
from app.models.student_profile import StudentProfile
from app.recommendation.scoring import score_opportunity


def _student(**overrides):
    defaults = dict(
        name="Test Student",
        branch="CSE",
        semester=4,
        year=2,
        preferred_mode="Online",
        skills=[Skill(id=1, name="Python"), Skill(id=2, name="SQL"), Skill(id=3, name="React")],
        interests=[Interest(id=1, name="AI"), Interest(id=2, name="Hackathons")],
    )
    defaults.update(overrides)
    return StudentProfile(**defaults)


def _opportunity(**overrides):
    defaults = dict(
        title="AI Hackathon",
        description="test",
        category=OpportunityCategory.HACKATHON,
        organizer="Test Org",
        deadline=datetime.now(timezone.utc) + timedelta(days=5),
        mode=OpportunityMode.ONLINE,
        registration_url="https://example.com",
        source_type="admin",
        skills=[Skill(id=1, name="Python"), Skill(id=4, name="ML")],
        eligibility=OpportunityEligibility(
            eligible_branches=["CSE", "IT"], eligible_semesters=[3, 4], is_uncertain=False
        ),
    )
    defaults.update(overrides)
    return Opportunity(**defaults)


def test_strong_match_scores_high():
    result = score_opportunity(_student(), _opportunity())
    assert result.total_score > 70
    assert result.eligibility.status == "ELIGIBLE"


def test_no_skill_overlap_lowers_score():
    matching = score_opportunity(_student(), _opportunity())
    no_skills = score_opportunity(
        _student(), _opportunity(skills=[Skill(id=9, name="Cobol")])
    )
    assert no_skills.total_score < matching.total_score


def test_ineligible_still_scores_but_lower():
    eligible = score_opportunity(_student(), _opportunity())
    ineligible = score_opportunity(
        _student(),
        _opportunity(eligibility=OpportunityEligibility(eligible_branches=["ECE"], eligible_semesters=[7], is_uncertain=False)),
    )
    assert ineligible.eligibility.status == "NOT_ELIGIBLE"
    assert ineligible.total_score < eligible.total_score


def test_expired_deadline_scores_zero_on_deadline_component():
    result = score_opportunity(
        _student(), _opportunity(deadline=datetime.now(timezone.utc) - timedelta(days=1))
    )
    assert result.deadline_score == 0.0


def test_reasons_are_populated_for_a_good_match():
    result = score_opportunity(_student(), _opportunity())
    assert len(result.reasons) > 0
    assert any("matches your skills" in r for r in result.reasons)


def test_score_is_bounded_between_0_and_100():
    result = score_opportunity(_student(), _opportunity())
    assert 0 <= result.total_score <= 100