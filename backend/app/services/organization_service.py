from sqlalchemy.orm import Session

from app.models.organization import Organization
from app.models.user import User, UserRole
from app.repositories.organization_repository import create_organization, get_organization_by_owner


class OrganizationAlreadyExistsError(Exception):
    pass


def create_my_organization(db: Session, user: User, name: str) -> Organization:
    if get_organization_by_owner(db, user.id):
        raise OrganizationAlreadyExistsError()
    org = create_organization(db, name, user.id)
    user.role = UserRole.ORGANIZER
    db.commit()
    return org