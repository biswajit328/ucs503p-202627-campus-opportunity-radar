from datetime import datetime, timezone

from pydantic import BaseModel

from app.models.opportunity import Opportunity
from app.models.student_profile import StudentProfile
from app.recommendation.eligibility import EligibilityResult, check_eligibility

SKILL_WEIGHT = 0.30
ELIGIBILITY_WEIGHT = 0.25
INTEREST_WEIGHT = 0.20
DEADLINE_WEIGHT = 0.15
MODE_WEIGHT = 0.10


class ScoreBreakdown(BaseModel):
    skill_score: float
    eligibility_score: float
    interest_score: float
    deadline_score: float
    mode_score: float
    total_score: float
    eligibility: EligibilityResult
    reasons: list[str]


def _normalized(values: list[str]) -> set[str]:
    return {v.strip().lower() for v in values}


def _skill_score(student_skills: list[str], opportunity_skills: list[str]) -> tuple[float, str | None]:
    if not opportunity_skills:
        return 1.0, None
    student_set = _normalized(student_skills)
    opp_set = _normalized(opportunity_skills)
    matched = student_set & opp_set
    if not matched:
        return 0.0, None
    score = len(matched) / len(opp_set)
    matched_display = ", ".join(sorted(matched))
    return min(score, 1.0), f"{matched_display} matches your skills"


def _interest_score(
    student_interests: list[str], opportunity_category: str
) -> tuple[float, str | None]:
    interest_set = _normalized(student_interests)
    category_words = opportunity_category.replace("_", " ").lower()
    for interest in interest_set:
        if interest in category_words or category_words in interest:
            return 1.0, f"{interest.title()} matches your interests"
    return 0.3, None  # small baseline, not zero — category relevance is fuzzy, not binary


def _deadline_score(deadline: datetime) -> tuple[float, str]:
    now = datetime.now(timezone.utc)
    days_left = (deadline - now).total_seconds() / 86400
    if days_left < 0:
        return 0.0, "Deadline has passed"
    if days_left <= 3:
        return 0.6, "Deadline approaching (urgent)"
    if days_left <= 7:
        return 0.9, "Deadline coming up soon"
    if days_left <= 30:
        return 1.0, "Deadline is upcoming"
    return 0.8, "Deadline is far off"


def _mode_score(preferred_mode: str | None, opportunity_mode: str) -> tuple[float, str | None]:
    if not preferred_mode:
        return 0.7, None
    if preferred_mode.strip().lower() == opportunity_mode.strip().lower():
        return 1.0, f"{opportunity_mode.title()} mode matches your preference"
    return 0.4, None


def score_opportunity(student: StudentProfile, opportunity: Opportunity) -> ScoreBreakdown:
    eligibility_result = check_eligibility(student, opportunity.eligibility)
    eligibility_score = {"ELIGIBLE": 1.0, "UNCERTAIN": 0.5, "NOT_ELIGIBLE": 0.0}[eligibility_result.status]

    student_skill_names = [s.name for s in student.skills]
    student_interest_names = [i.name for i in student.interests]
    opportunity_skill_names = [s.name for s in opportunity.skills]

    skill_score, skill_reason = _skill_score(student_skill_names, opportunity_skill_names)
    interest_score, interest_reason = _interest_score(student_interest_names, opportunity.category.value)
    deadline_score, deadline_reason = _deadline_score(opportunity.deadline)
    mode_score, mode_reason = _mode_score(student.preferred_mode, opportunity.mode.value)

    total = (
        skill_score * SKILL_WEIGHT
        + eligibility_score * ELIGIBILITY_WEIGHT
        + interest_score * INTEREST_WEIGHT
        + deadline_score * DEADLINE_WEIGHT
        + mode_score * MODE_WEIGHT
    ) * 100

    reasons = [r for r in [skill_reason, interest_reason, mode_reason, deadline_reason] if r]
    reasons.extend(eligibility_result.reasons)

    return ScoreBreakdown(
        skill_score=skill_score,
        eligibility_score=eligibility_score,
        interest_score=interest_score,
        deadline_score=deadline_score,
        mode_score=mode_score,
        total_score=round(total, 1),
        eligibility=eligibility_result,
        reasons=reasons,
    )