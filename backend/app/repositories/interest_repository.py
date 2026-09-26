from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

from app.models.interest import Interest


def get_or_create_interest(db: Session, name: str) -> Interest:
    normalized = name.strip()
    stmt = pg_insert(Interest).values(name=normalized).on_conflict_do_nothing(index_elements=["name"])
    db.execute(stmt)
    db.flush()
    return db.query(Interest).filter(Interest.name == normalized).first()