from sqlalchemy.orm import Session

from app.models.application import Application


def create_application(db: Session, student_profile_id: int, opportunity_id: int) -> Application:
    application = Application(student_profile_id=student_profile_id, opportunity_id=opportunity_id)
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


def get_application(db: Session, application_id: int, student_profile_id: int) -> Application | None:
    return (
        db.query(Application)
        .filter(Application.id == application_id, Application.student_profile_id == student_profile_id)
        .first()
    )


def list_applications(db: Session, student_profile_id: int) -> list[Application]:
    return (
        db.query(Application)
        .filter(Application.student_profile_id == student_profile_id)
        .order_by(Application.updated_at.desc())
        .all()
    )


def save_application(db: Session, application: Application) -> Application:
    db.commit()
    db.refresh(application)
    return application