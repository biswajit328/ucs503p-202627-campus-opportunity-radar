from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.bookmark import Bookmark


def create_bookmark(db: Session, student_profile_id: int, opportunity_id: int) -> Bookmark:
    bookmark = Bookmark(student_profile_id=student_profile_id, opportunity_id=opportunity_id)
    db.add(bookmark)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    db.refresh(bookmark)
    return bookmark


def get_bookmark(db: Session, student_profile_id: int, opportunity_id: int) -> Bookmark | None:
    return (
        db.query(Bookmark)
        .filter(Bookmark.student_profile_id == student_profile_id, Bookmark.opportunity_id == opportunity_id)
        .first()
    )


def list_bookmarks(db: Session, student_profile_id: int) -> list[Bookmark]:
    return (
        db.query(Bookmark)
        .filter(Bookmark.student_profile_id == student_profile_id)
        .order_by(Bookmark.created_at.desc())
        .all()
    )


def delete_bookmark(db: Session, bookmark: Bookmark) -> None:
    db.delete(bookmark)
    db.commit()