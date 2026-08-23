from sqlalchemy.orm import Session

from app.models.student_profile import StudentProfile


def get_profile_by_user_id(db: Session, user_id: int) -> StudentProfile | None:
    return db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()


def save_profile(db: Session, profile: StudentProfile) -> StudentProfile:
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile