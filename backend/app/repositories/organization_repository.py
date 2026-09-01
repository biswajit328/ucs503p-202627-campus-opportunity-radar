from sqlalchemy.orm import Session

from app.models.organization import Organization


def get_organization_by_owner(db: Session, user_id: int) -> Organization | None:
    return db.query(Organization).filter(Organization.owner_user_id == user_id).first()


def create_organization(db: Session, name: str, owner_user_id: int) -> Organization:
    org = Organization(name=name, owner_user_id=owner_user_id)
    db.add(org)
    db.commit()
    db.refresh(org)
    return org