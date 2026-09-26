from datetime import datetime, time, timezone

from sqlalchemy.orm import Session

from app.ai.extraction import extract_and_review
from app.ai.service import AIService
from app.models.opportunity import Opportunity, OpportunityStatus
from app.models.submission import Submission, SubmissionStatus
from app.models.user import User
from app.repositories.opportunity_repository import create_opportunity
from app.repositories.organization_repository import get_organization_by_owner
from app.repositories.skill_repository import get_or_create_skill
from app.repositories.submission_repository import create_submission, get_submission, save_submission


class OrganizationRequiredError(Exception):
    pass


class SubmissionNotFoundError(Exception):
    pass


class SubmissionAlreadyReviewedError(Exception):
    pass


class InvalidExtractionError(Exception):
    pass


def submit_opportunity_text(db: Session, user: User, raw_text: str) -> Submission:
    org = get_organization_by_owner(db, user.id)
    if not org:
        raise OrganizationRequiredError()
    return create_submission(db, org.id, raw_text)


def review_submission(db: Session, submission_id: int):
    submission = get_submission(db, submission_id)
    if not submission:
        raise SubmissionNotFoundError()
    raw_text = submission.raw_payload["raw_text"]
    extracted, review = extract_and_review(AIService(), raw_text)
    return submission, raw_text, extracted, review


def approve_submission(db: Session, admin: User, submission_id: int) -> Opportunity:
    submission = get_submission(db, submission_id)
    if not submission:
        raise SubmissionNotFoundError()
    if submission.review_status != SubmissionStatus.PENDING:
        raise SubmissionAlreadyReviewedError()

    raw_text = submission.raw_payload["raw_text"]
    extracted, review = extract_and_review(AIService(), raw_text)

    if review.parsed_deadline is None:
        raise InvalidExtractionError("Extracted deadline is not a valid date")

    deadline_dt = datetime.combine(review.parsed_deadline, time.min, tzinfo=timezone.utc)

    opportunity = Opportunity(
        title=extracted.title,
        description=raw_text,
        category=extracted.category,
        organizer=extracted.organizer,
        deadline=deadline_dt,
        mode=extracted.mode,
        location=extracted.location or None,
        registration_url="",
        source_type="organizer_submission",
        status=OpportunityStatus.APPROVED,
    )
    opportunity.skills = list({s.id: s for s in [get_or_create_skill(db, n) for n in extracted.skills]}.values())
    create_opportunity(db, opportunity)

    submission.review_status = SubmissionStatus.APPROVED
    submission.opportunity_id = opportunity.id
    submission.reviewed_by = admin.id
    save_submission(db, submission)

    return opportunity


def reject_submission(db: Session, admin: User, submission_id: int) -> Submission:
    submission = get_submission(db, submission_id)
    if not submission:
        raise SubmissionNotFoundError()
    if submission.review_status != SubmissionStatus.PENDING:
        raise SubmissionAlreadyReviewedError()
    submission.review_status = SubmissionStatus.REJECTED
    submission.reviewed_by = admin.id
    save_submission(db, submission)
    return submission