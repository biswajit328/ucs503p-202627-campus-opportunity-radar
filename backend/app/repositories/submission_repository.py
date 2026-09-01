from sqlalchemy.orm import Session

from app.models.submission import Submission, SubmissionStatus


def create_submission(db: Session, organization_id: int, raw_text: str) -> Submission:
    submission = Submission(organization_id=organization_id, raw_payload={"raw_text": raw_text})
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission


def list_pending_submissions(db: Session) -> list[Submission]:
    return (
        db.query(Submission)
        .filter(Submission.review_status == SubmissionStatus.PENDING)
        .order_by(Submission.submitted_at.asc())
        .all()
    )


def get_submission(db: Session, submission_id: int) -> Submission | None:
    return db.query(Submission).filter(Submission.id == submission_id).first()


def save_submission(db: Session, submission: Submission) -> Submission:
    db.commit()
    db.refresh(submission)
    return submission