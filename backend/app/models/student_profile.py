from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.interest import student_interests
from app.models.skill import student_skills

if TYPE_CHECKING:
    from app.models.interest import Interest
    from app.models.skill import Skill
    from app.models.user import User


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    branch: Mapped[str] = mapped_column(String(100), nullable=False)
    semester: Mapped[int] = mapped_column(Integer, nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    preferred_mode: Mapped[str | None] = mapped_column(String(50), nullable=True)
    preferred_location: Mapped[str | None] = mapped_column(String(100), nullable=True)

    user: Mapped["User"] = relationship(back_populates="student_profile")
    skills: Mapped[list["Skill"]] = relationship(secondary=student_skills, back_populates="student_profiles")
    interests: Mapped[list["Interest"]] = relationship(secondary=student_interests, back_populates="student_profiles")