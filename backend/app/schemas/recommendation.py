from pydantic import BaseModel, ConfigDict

from app.schemas.opportunity import OpportunityOut


class RecommendationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    opportunity: OpportunityOut
    match_score: float
    eligibility_status: str
    reasons: list[str]