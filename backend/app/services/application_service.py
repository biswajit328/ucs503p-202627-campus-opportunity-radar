from sqlalchemy.orm import Session

from app.models.application import Application, ApplicationStatus
from app.models.user import User
from app.repositories.application_repository import (
    create_application,
    get_application,
    list_applications,
    save_application,
)
from app.repositories.student_profile_repository import get_profile_by_user_id


class ProfileRequiredError(Exception):
    pass


class ApplicationNotFoundError(Exception):
    pass


def _require_profile_id(db: Session, user: User) -> int:
    profile = get_profile_by_user_id(db, user.id)
    if not profile:
        raise ProfileRequiredError()
    return profile.id


def track_opportunity(db: Session, user: User, opportunity_id: int) -> Application:
    profile_id = _require_profile_id(db, user)
    return create_application(db, profile_id, opportunity_id)


def list_my_applications(db: Session, user: User) -> list[Application]:
    profile_id = _require_profile_id(db, user)
    return list_applications(db, profile_id)


def update_application_status(
    db: Session, user: User, application_id: int, new_status: ApplicationStatus
) -> Application:
    profile_id = _require_profile_id(db, user)
    application = get_application(db, application_id, profile_id)
    if not application:
        raise ApplicationNotFoundError()
    application.status = new_status
    return save_application(db, application)