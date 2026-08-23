from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Column, ForeignKey, Integer, Table
from sqlalchemy.dialects.postgresql import CITEXT
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.student_profile import StudentProfile

student_skills = Table(
    "student_skills",
    Base.metadata,
    Column("student_profile_id", Integer, ForeignKey("student_profiles.id"), primary_key=True),
    Column("skill_id", Integer, ForeignKey("skills.id"), primary_key=True),
)


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(CITEXT, unique=True, nullable=False, index=True)

    student_profiles: Mapped[list["StudentProfile"]] = relationship(
        secondary=student_skills, back_populates="skills"
    )