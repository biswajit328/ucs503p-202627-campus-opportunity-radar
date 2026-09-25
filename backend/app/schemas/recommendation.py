from pydantic import BaseModel, ConfigDict

from app.schemas.opportunity import OpportunityOut


class ScoreBreakdownOut(BaseModel):
    skill_score: float
    eligibility_score: float
    interest_score: float
    deadline_score: float
    mode_score: float


class RecommendationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    opportunity: OpportunityOut
    match_score: float
    eligibility_status: str
    reasons: list[str]
    score_breakdown: ScoreBreakdownOut