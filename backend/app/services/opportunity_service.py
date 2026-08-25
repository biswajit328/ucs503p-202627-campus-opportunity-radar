from sqlalchemy.orm import Session

from app.models.opportunity import Opportunity
from app.models.opportunity_eligibility import OpportunityEligibility
from app.repositories.opportunity_repository import (
    create_opportunity,
    delete_opportunity,
    get_opportunity_by_id,
    list_opportunities,
)
from app.repositories.skill_repository import get_or_create_skill
from app.schemas.opportunity import OpportunityCreate, OpportunityUpdate


class OpportunityNotFoundError(Exception):
    pass


def _dedup_skills(db: Session, names: list[str]):
    objs = [get_or_create_skill(db, name) for name in names]
    return list({s.id: s for s in objs}.values())


def create_new_opportunity(db: Session, payload: OpportunityCreate) -> Opportunity:
    opportunity = Opportunity(
        title=payload.title,
        description=payload.description,
        category=payload.category,
        organizer=payload.organizer,
        deadline=payload.deadline,
        start_date=payload.start_date,
        duration=payload.duration,
        location=payload.location,
        mode=payload.mode,
        registration_url=payload.registration_url,
        source_url=payload.source_url,
        source_type="admin",
    )
    opportunity.skills = _dedup_skills(db, payload.skills)
    opportunity.eligibility = OpportunityEligibility(
        eligible_branches=payload.eligibility.eligible_branches,
        eligible_semesters=payload.eligibility.eligible_semesters,
        is_uncertain=payload.eligibility.is_uncertain,
    )
    return create_opportunity(db, opportunity)


def get_opportunity(db: Session, opportunity_id: int) -> Opportunity:
    opportunity = get_opportunity_by_id(db, opportunity_id)
    if not opportunity:
        raise OpportunityNotFoundError()
    return opportunity


def list_all_opportunities(db: Session, skip: int = 0, limit: int = 20) -> list[Opportunity]:
    return list_opportunities(db, skip=skip, limit=limit)


def update_existing_opportunity(db: Session, opportunity_id: int, payload: OpportunityUpdate) -> Opportunity:
    opportunity = get_opportunity_by_id(db, opportunity_id)
    if not opportunity:
        raise OpportunityNotFoundError()

    update_data = payload.model_dump(exclude_unset=True, exclude={"skills", "eligibility"})
    for field, value in update_data.items():
        setattr(opportunity, field, value)

    if payload.skills is not None:
        opportunity.skills = _dedup_skills(db, payload.skills)

    if payload.eligibility is not None:
        opportunity.eligibility.eligible_branches = payload.eligibility.eligible_branches
        opportunity.eligibility.eligible_semesters = payload.eligibility.eligible_semesters
        opportunity.eligibility.is_uncertain = payload.eligibility.is_uncertain

    db.commit()
    db.refresh(opportunity)
    return opportunity


def delete_opportunity_by_id(db: Session, opportunity_id: int) -> None:
    opportunity = get_opportunity_by_id(db, opportunity_id)
    if not opportunity:
        raise OpportunityNotFoundError()
    delete_opportunity(db, opportunity)