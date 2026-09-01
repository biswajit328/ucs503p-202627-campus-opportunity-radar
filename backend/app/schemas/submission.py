from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.ai.schemas import ExtractedOpportunity
from app.ai.validation import ExtractionReview
from app.models.submission import SubmissionStatus


class SubmissionCreate(BaseModel):
    raw_text: str


class SubmissionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    review_status: SubmissionStatus
    submitted_at: datetime


class SubmissionReviewOut(BaseModel):
    id: int
    review_status: SubmissionStatus
    submitted_at: datetime
    raw_text: str
    extracted: ExtractedOpportunity | None
    review: ExtractionReview | None


class SubmissionReject(BaseModel):
    reason: str | None = None