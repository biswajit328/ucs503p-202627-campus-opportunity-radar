from pydantic import BaseModel

from app.models.opportunity import OpportunityCategory, OpportunityMode


class ExtractedOpportunity(BaseModel):
    title: str
    category: OpportunityCategory
    organizer: str
    skills: list[str]
    eligible_branches: list[str]
    eligible_academic_levels: list[str]
    mode: OpportunityMode
    deadline: str
    location: str
    is_uncertain: bool
    uncertainty_notes: str