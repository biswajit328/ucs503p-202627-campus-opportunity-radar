from fastapi import APIRouter, Depends, HTTPException, status

from app.ai.extraction import extract_and_review
from app.ai.service import AIService
from app.auth.dependencies import require_admin
from app.models.user import User
from app.schemas.extraction import ExtractionRequest, ExtractionResponse

router = APIRouter(prefix="/ingestion", tags=["ingestion"])


@router.post("/extract", response_model=ExtractionResponse)
def extract_opportunity_route(
    payload: ExtractionRequest,
    _admin: User = Depends(require_admin),
):
    if not payload.raw_text.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="raw_text cannot be empty")

    try:
        extracted, review = extract_and_review(AIService(), payload.raw_text)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI extraction failed. The source may need to be entered manually.",
        )

    return ExtractionResponse(extracted=extracted, review=review)