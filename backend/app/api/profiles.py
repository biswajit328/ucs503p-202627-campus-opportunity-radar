from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.student_profile import StudentProfileCreate, StudentProfileOut, StudentProfileUpdate
from app.services.student_profile_service import (
    ProfileAlreadyExistsError,
    ProfileNotFoundError,
    create_profile,
    get_profile,
    update_profile,
)

router = APIRouter(prefix="/users/me/profile", tags=["student-profile"])


@router.post("", response_model=StudentProfileOut, status_code=status.HTTP_201_CREATED)
def create_my_profile(
    payload: StudentProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return create_profile(db, current_user, payload)
    except ProfileAlreadyExistsError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Profile already exists")


@router.get("", response_model=StudentProfileOut)
def read_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return get_profile(db, current_user)
    except ProfileNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")


@router.put("", response_model=StudentProfileOut)
def update_my_profile(
    payload: StudentProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return update_profile(db, current_user, payload)
    except ProfileNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")