from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.bookmark import Bookmark
from app.models.user import User
from app.repositories.bookmark_repository import create_bookmark, delete_bookmark, get_bookmark, list_bookmarks
from app.repositories.student_profile_repository import get_profile_by_user_id


class ProfileRequiredError(Exception):
    pass


class OpportunityAlreadyBookmarkedError(Exception):
    pass


class BookmarkNotFoundError(Exception):
    pass


def _require_profile_id(db: Session, user: User) -> int:
    profile = get_profile_by_user_id(db, user.id)
    if not profile:
        raise ProfileRequiredError()
    return profile.id


def add_bookmark(db: Session, user: User, opportunity_id: int) -> Bookmark:
    profile_id = _require_profile_id(db, user)
    if get_bookmark(db, profile_id, opportunity_id):
        raise OpportunityAlreadyBookmarkedError()
    try:
        return create_bookmark(db, profile_id, opportunity_id)
    except IntegrityError:
        raise OpportunityAlreadyBookmarkedError()


def remove_bookmark(db: Session, user: User, opportunity_id: int) -> None:
    profile_id = _require_profile_id(db, user)
    bookmark = get_bookmark(db, profile_id, opportunity_id)
    if not bookmark:
        raise BookmarkNotFoundError()
    delete_bookmark(db, bookmark)


def get_my_bookmarks(db: Session, user: User) -> list[Bookmark]:
    profile_id = _require_profile_id(db, user)
    return list_bookmarks(db, profile_id)