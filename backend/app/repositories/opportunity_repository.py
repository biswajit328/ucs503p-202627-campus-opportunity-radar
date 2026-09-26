from datetime import datetime

from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.models.opportunity import Opportunity, OpportunityCategory, OpportunityMode, OpportunityStatus
from app.models.opportunity_eligibility import OpportunityEligibility
from app.models.skill import Skill


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
        .filter(Opportunity.status == OpportunityStatus.APPROVED)
        .order_by(Opportunity.deadline.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def search_opportunities(
    db: Session,
    keyword: str | None = None,
    category: OpportunityCategory | None = None,
    skill: str | None = None,
    branch: str | None = None,
    semester: int | None = None,
    mode: OpportunityMode | None = None,
    location: str | None = None,
    deadline_after: datetime | None = None,
    deadline_before: datetime | None = None,
    skip: int = 0,
    limit: int = 20,
) -> list[Opportunity]:
    query = (
        db.query(Opportunity)
        .options(joinedload(Opportunity.skills), joinedload(Opportunity.eligibility))
        .filter(Opportunity.status == OpportunityStatus.APPROVED)
    )

    if keyword:
        like_pattern = f"%{keyword}%"
        query = query.filter(
            or_(Opportunity.title.ilike(like_pattern), Opportunity.description.ilike(like_pattern))
        )
    if category:
        query = query.filter(Opportunity.category == category)
    if mode:
        query = query.filter(Opportunity.mode == mode)
    if location:
        query = query.filter(Opportunity.location.ilike(f"%{location}%"))
    if deadline_after:
        query = query.filter(Opportunity.deadline >= deadline_after)
    if deadline_before:
        query = query.filter(Opportunity.deadline <= deadline_before)
    if skill:
        query = query.filter(Opportunity.skills.any(Skill.name == skill))
    if branch or semester:
        query = query.join(Opportunity.eligibility)
        if branch:
            query = query.filter(OpportunityEligibility.eligible_branches.any(branch))
        if semester:
            query = query.filter(OpportunityEligibility.eligible_semesters.any(semester))

    return query.order_by(Opportunity.deadline.asc()).offset(skip).limit(limit).all()


def delete_opportunity(db: Session, opportunity: Opportunity) -> None:
    db.delete(opportunity)
    db.commit()