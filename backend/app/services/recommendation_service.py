from sqlalchemy.orm import Session

from app.models.user import User
from app.recommendation.scoring import score_opportunity
from app.repositories.opportunity_repository import list_opportunities
from app.repositories.student_profile_repository import get_profile_by_user_id
from app.schemas.recommendation import RecommendationOut, ScoreBreakdownOut


class ProfileRequiredError(Exception):
    pass


def get_recommendations(db: Session, user: User, limit: int = 20) -> list[RecommendationOut]:
    profile = get_profile_by_user_id(db, user.id)
    if not profile:
        raise ProfileRequiredError()

    opportunities = list_opportunities(db, skip=0, limit=200)

    scored = []
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)

    from app.recommendation.scoring import _normalized

    student_skills_normalized = _normalized([s.name for s in profile.skills])
    student_interests_normalized = _normalized([i.name for i in profile.interests])

    for opportunity in opportunities:
        # 1. Filter out mock/eval data
        title_upper = opportunity.title.upper()
        if "[EVAL]" in title_upper or "MOCK" in title_upper or "TEST" in title_upper or "DEBUG" in title_upper:
            continue

        # 2. Filter out strictly expired opportunities from default active recommendations
        if opportunity.deadline:
            opp_deadline = opportunity.deadline
            if opp_deadline.tzinfo is None:
                opp_deadline = opp_deadline.replace(tzinfo=timezone.utc)
            if opp_deadline < now:
                continue

        breakdown = score_opportunity(profile, opportunity, student_skills_normalized, student_interests_normalized)
        if breakdown.eligibility.status == "NOT_ELIGIBLE":
            continue
        scored.append(
            RecommendationOut(
                opportunity=opportunity,
                match_score=breakdown.total_score,
                eligibility_status=breakdown.eligibility.status,
                reasons=breakdown.reasons,
                score_breakdown=ScoreBreakdownOut(
                    skill_score=breakdown.skill_score,
                    eligibility_score=breakdown.eligibility_score,
                    interest_score=breakdown.interest_score,
                    deadline_score=breakdown.deadline_score,
                    mode_score=breakdown.mode_score,
                ),
            )
        )

    scored.sort(key=lambda r: r.match_score, reverse=True)
    return scored[:limit]
