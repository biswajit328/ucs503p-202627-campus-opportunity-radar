from pydantic import BaseModel

from app.ai.schemas import ExtractedOpportunity
from app.ai.validation import ExtractionReview


class ExtractionRequest(BaseModel):
    raw_text: str


class ExtractionResponse(BaseModel):
    extracted: ExtractedOpportunity
    review: ExtractionReview