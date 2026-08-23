from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Column, ForeignKey, Integer, Table
from sqlalchemy.dialects.postgresql import CITEXT
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.student_profile import StudentProfile

student_interests = Table(
    "student_interests",
    Base.metadata,
    Column("student_profile_id", Integer, ForeignKey("student_profiles.id"), primary_key=True),
    Column("interest_id", Integer, ForeignKey("interests.id"), primary_key=True),
)


class Interest(Base):
    __tablename__ = "interests"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(CITEXT, unique=True, nullable=False, index=True)

    student_profiles: Mapped[list["StudentProfile"]] = relationship(
        secondary=student_interests, back_populates="interests"
    )