from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.opportunity import OpportunityCategory, OpportunityMode, OpportunityStatus


class OpportunityEligibilityIn(BaseModel):
    eligible_branches: list[str] = []
    eligible_semesters: list[int] = []
    is_uncertain: bool = False


class OpportunityCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    category: OpportunityCategory
    organizer: str = Field(min_length=1, max_length=255)
    deadline: datetime
    start_date: date | None = None
    duration: str | None = None
    location: str | None = None
    mode: OpportunityMode
    registration_url: str = Field(min_length=1, max_length=500)
    source_url: str | None = None
    skills: list[str] = []
    eligibility: OpportunityEligibilityIn = OpportunityEligibilityIn()


class OpportunityUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    category: OpportunityCategory | None = None
    organizer: str | None = Field(default=None, min_length=1, max_length=255)
    deadline: datetime | None = None
    start_date: date | None = None
    duration: str | None = None
    location: str | None = None
    mode: OpportunityMode | None = None
    registration_url: str | None = None
    source_url: str | None = None
    status: OpportunityStatus | None = None
    skills: list[str] | None = None
    eligibility: OpportunityEligibilityIn | None = None


class OpportunityEligibilityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    eligible_branches: list[str]
    eligible_semesters: list[int]
    is_uncertain: bool


class OpportunityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    category: OpportunityCategory
    organizer: str
    deadline: datetime
    start_date: date | None
    duration: str | None
    location: str | None
    mode: OpportunityMode
    registration_url: str
    source_url: str | None
    status: OpportunityStatus
    created_at: datetime
    updated_at: datetime
    skills: list[str]
    eligibility: OpportunityEligibilityOut | None

    @field_validator("skills", mode="before")
    @classmethod
    def extract_skill_names(cls, value):
        if not value:
            return []
        return [item.name if hasattr(item, "name") else item for item in value]