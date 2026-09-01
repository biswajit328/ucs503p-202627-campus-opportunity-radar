from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user, require_admin
from app.core.database import get_db
from app.models.user import User
from app.repositories.submission_repository import list_pending_submissions
from app.schemas.submission import SubmissionCreate, SubmissionOut, SubmissionReviewOut
from app.services.submission_service import (
    InvalidExtractionError,
    OrganizationRequiredError,
    SubmissionAlreadyReviewedError,
    SubmissionNotFoundError,
    approve_submission,
    reject_submission,
    review_submission,
    submit_opportunity_text,
)

router = APIRouter(prefix="/submissions", tags=["submissions"])


@router.post("", response_model=SubmissionOut, status_code=status.HTTP_201_CREATED)
def create_submission_route(
    payload: SubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return submit_opportunity_text(db, current_user, payload.raw_text)
    except OrganizationRequiredError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Create an organization first")

@router.post("/{submission_id}/approve", status_code=status.HTTP_201_CREATED)
def approve_submission_route(
    submission_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    try:
        opportunity = approve_submission(db, admin, submission_id)
    except SubmissionNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
    except SubmissionAlreadyReviewedError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Submission already reviewed")
    except InvalidExtractionError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return {"opportunity_id": opportunity.id}

@router.get("/pending", response_model=list[SubmissionOut])
def list_pending_route(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    return list_pending_submissions(db)


@router.get("/{submission_id}/review", response_model=SubmissionReviewOut)
def review_submission_route(
    submission_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    try:
        submission, raw_text, extracted, review = review_submission(db, submission_id)
    except SubmissionNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
    return SubmissionReviewOut(
        id=submission.id,
        review_status=submission.review_status,
        submitted_at=submission.submitted_at,
        raw_text=raw_text,
        extracted=extracted,
        review=review,
    )


@router.post("/{submission_id}/approve", status_code=status.HTTP_201_CREATED)
def approve_submission_route(
    submission_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    try:
        opportunity = approve_submission(db, admin, submission_id)
    except SubmissionNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
    except SubmissionAlreadyReviewedError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Submission already reviewed")
    return {"opportunity_id": opportunity.id}


@router.post("/{submission_id}/reject", response_model=SubmissionOut)
def reject_submission_route(
    submission_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    try:
        return reject_submission(db, admin, submission_id)
    except SubmissionNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
    except SubmissionAlreadyReviewedError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Submission already reviewed")