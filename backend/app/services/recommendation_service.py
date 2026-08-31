from sqlalchemy.orm import Session

from app.models.user import User
from app.recommendation.scoring import score_opportunity
from app.repositories.opportunity_repository import list_opportunities
from app.repositories.student_profile_repository import get_profile_by_user_id
from app.schemas.recommendation import RecommendationOut


class ProfileRequiredError(Exception):
    pass


def get_recommendations(db: Session, user: User, limit: int = 20) -> list[RecommendationOut]:
    profile = get_profile_by_user_id(db, user.id)
    if not profile:
        raise ProfileRequiredError()

    opportunities = list_opportunities(db, skip=0, limit=200)

    scored = []
    for opportunity in opportunities:
        breakdown = score_opportunity(profile, opportunity)
        if breakdown.eligibility.status == "NOT_ELIGIBLE":
            continue
        scored.append(
            RecommendationOut(
                opportunity=opportunity,
                match_score=breakdown.total_score,
                eligibility_status=breakdown.eligibility.status,
                reasons=breakdown.reasons,
            )
        )

    scored.sort(key=lambda r: r.match_score, reverse=True)
    return scored[:limit]