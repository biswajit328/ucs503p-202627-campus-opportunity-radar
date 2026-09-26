from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

from app.models.skill import Skill


def get_or_create_skill(db: Session, name: str) -> Skill:
    normalized = name.strip()
    stmt = pg_insert(Skill).values(name=normalized).on_conflict_do_nothing(index_elements=["name"])
    db.execute(stmt)
    db.flush()
    return db.query(Skill).filter(Skill.name == normalized).first()