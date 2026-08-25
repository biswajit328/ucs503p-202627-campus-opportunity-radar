from sqlalchemy.orm import Session, joinedload

from app.models.opportunity import Opportunity


def create_opportunity(db: Session, opportunity: Opportunity) -> Opportunity:
    db.add(opportunity)
    db.commit()
    db.refresh(opportunity)
    return opportunity


def get_opportunity_by_id(db: Session, opportunity_id: int) -> Opportunity | None:
    return (
        db.query(Opportunity)
        .options(joinedload(Opportunity.skills), joinedload(Opportunity.eligibility))
        .filter(Opportunity.id == opportunity_id)
        .first()
    )


def list_opportunities(db: Session, skip: int = 0, limit: int = 20) -> list[Opportunity]:
    return (
        db.query(Opportunity)
        .options(joinedload(Opportunity.skills), joinedload(Opportunity.eligibility))
        .order_by(Opportunity.deadline.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def delete_opportunity(db: Session, opportunity: Opportunity) -> None:
    db.delete(opportunity)
    db.commit()