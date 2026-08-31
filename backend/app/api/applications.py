from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.application import ApplicationCreate, ApplicationOut, ApplicationStatusUpdate
from app.services.application_service import (
    ApplicationNotFoundError,
    ProfileRequiredError,
    list_my_applications,
    track_opportunity,
    update_application_status,
)

router = APIRouter(prefix="/applications", tags=["applications"])


@router.post("", response_model=ApplicationOut, status_code=status.HTTP_201_CREATED)
def create_application_route(
    payload: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return track_opportunity(db, current_user, payload.opportunity_id)
    except ProfileRequiredError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Create a student profile first")


@router.get("", response_model=list[ApplicationOut])
def list_applications_route(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return list_my_applications(db, current_user)
    except ProfileRequiredError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Create a student profile first")


@router.patch("/{application_id}", response_model=ApplicationOut)
def update_application_route(
    application_id: int,
    payload: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return update_application_status(db, current_user, application_id, payload.status)
    except ProfileRequiredError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Create a student profile first")
    except ApplicationNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")