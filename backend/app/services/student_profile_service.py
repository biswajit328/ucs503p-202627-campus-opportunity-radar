from sqlalchemy.orm import Session

from app.models.student_profile import StudentProfile
from app.models.user import User
from app.repositories.interest_repository import get_or_create_interest
from app.repositories.skill_repository import get_or_create_skill
from app.repositories.student_profile_repository import get_profile_by_user_id, save_profile
from app.schemas.student_profile import StudentProfileCreate, StudentProfileUpdate


class ProfileAlreadyExistsError(Exception):
    pass


class ProfileNotFoundError(Exception):
    pass


def create_profile(db: Session, user: User, payload: StudentProfileCreate) -> StudentProfile:
    if get_profile_by_user_id(db, user.id):
        raise ProfileAlreadyExistsError()

    profile = StudentProfile(
        user_id=user.id,
        name=payload.name,
        branch=payload.branch,
        semester=payload.semester,
        year=payload.year,
        preferred_mode=payload.preferred_mode,
        preferred_location=payload.preferred_location,
    )
    db.add(profile)

    skill_objs = [get_or_create_skill(db, name) for name in payload.skills]
    profile.skills = list({s.id: s for s in skill_objs}.values())

    interest_objs = [get_or_create_interest(db, name) for name in payload.interests]
    profile.interests = list({i.id: i for i in interest_objs}.values())

    return save_profile(db, profile)


def get_profile(db: Session, user: User) -> StudentProfile:
    profile = get_profile_by_user_id(db, user.id)
    if not profile:
        raise ProfileNotFoundError()
    return profile


def update_profile(db: Session, user: User, payload: StudentProfileUpdate) -> StudentProfile:
    profile = get_profile_by_user_id(db, user.id)
    if not profile:
        raise ProfileNotFoundError()

    update_data = payload.model_dump(exclude_unset=True, exclude={"skills", "interests"})
    for field, value in update_data.items():
        setattr(profile, field, value)

    if payload.skills is not None:
        skill_objs = [get_or_create_skill(db, name) for name in payload.skills]
        profile.skills = list({s.id: s for s in skill_objs}.values())

    if payload.interests is not None:
        interest_objs = [get_or_create_interest(db, name) for name in payload.interests]
        profile.interests = list({i.id: i for i in interest_objs}.values())

    return save_profile(db, profile)