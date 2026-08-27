from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user, require_admin
from app.core.database import get_db
from app.models.opportunity import OpportunityCategory, OpportunityMode
from app.models.user import User
from app.schemas.opportunity import OpportunityCreate, OpportunityOut, OpportunityUpdate
from app.services.opportunity_service import (
    OpportunityNotFoundError,
    create_new_opportunity,
    delete_opportunity_by_id,
    get_opportunity,
    list_all_opportunities,
    search_all_opportunities,
    update_existing_opportunity,
)

router = APIRouter(prefix="/opportunities", tags=["opportunities"])


@router.post("", response_model=OpportunityOut, status_code=status.HTTP_201_CREATED)
def create_opportunity_route(
    payload: OpportunityCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    return create_new_opportunity(db, payload)


@router.get("", response_model=list[OpportunityOut])
def list_opportunities_route(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    return list_all_opportunities(db, skip=skip, limit=limit)

@router.get("/search", response_model=list[OpportunityOut])
def search_opportunities_route(
    keyword: str | None = Query(None),
    category: OpportunityCategory | None = Query(None),
    skill: str | None = Query(None),
    branch: str | None = Query(None),
    semester: int | None = Query(None, ge=1, le=8),
    mode: OpportunityMode | None = Query(None),
    location: str | None = Query(None),
    deadline_after: datetime | None = Query(None),
    deadline_before: datetime | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    return search_all_opportunities(
        db,
        keyword=keyword,
        category=category,
        skill=skill,
        branch=branch,
        semester=semester,
        mode=mode,
        location=location,
        deadline_after=deadline_after,
        deadline_before=deadline_before,
        skip=skip,
        limit=limit,
    )


@router.get("/{opportunity_id}", response_model=OpportunityOut)
def get_opportunity_route(
    opportunity_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    try:
        return get_opportunity(db, opportunity_id)
    except OpportunityNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")


@router.put("/{opportunity_id}", response_model=OpportunityOut)
def update_opportunity_route(
    opportunity_id: int,
    payload: OpportunityUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    try:
        return update_existing_opportunity(db, opportunity_id, payload)
    except OpportunityNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")


@router.delete("/{opportunity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_opportunity_route(
    opportunity_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    try:
        delete_opportunity_by_id(db, opportunity_id)
    except OpportunityNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")