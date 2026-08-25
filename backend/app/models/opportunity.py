from __future__ import annotations

import enum
from datetime import date, datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Table, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.opportunity_eligibility import OpportunityEligibility
    from app.models.skill import Skill


class OpportunityCategory(str, enum.Enum):
    INTERNSHIP = "INTERNSHIP"
    HACKATHON = "HACKATHON"
    COMPETITION = "COMPETITION"
    SCHOLARSHIP = "SCHOLARSHIP"
    RESEARCH = "RESEARCH"
    WORKSHOP = "WORKSHOP"
    CONFERENCE = "CONFERENCE"
    CAMPUS_EVENT = "CAMPUS_EVENT"
    OTHER = "OTHER"


class OpportunityMode(str, enum.Enum):
    ONLINE = "ONLINE"
    OFFLINE = "OFFLINE"
    HYBRID = "HYBRID"


class OpportunityStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"


opportunity_skills = Table(
    "opportunity_skills",
    Base.metadata,
    Column("opportunity_id", Integer, ForeignKey("opportunities.id"), primary_key=True),
    Column("skill_id", Integer, ForeignKey("skills.id"), primary_key=True),
)


class Opportunity(Base):
    __tablename__ = "opportunities"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[OpportunityCategory] = mapped_column(Enum(OpportunityCategory), nullable=False)
    organizer: Mapped[str] = mapped_column(String(255), nullable=False)
    deadline: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    start_date: Mapped[date | None] = mapped_column(nullable=True)
    duration: Mapped[str | None] = mapped_column(String(100), nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    mode: Mapped[OpportunityMode] = mapped_column(Enum(OpportunityMode), nullable=False)
    registration_url: Mapped[str] = mapped_column(String(500), nullable=False)
    source_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    source_type: Mapped[str] = mapped_column(String(50), nullable=False, default="admin")
    status: Mapped[OpportunityStatus] = mapped_column(
        Enum(OpportunityStatus), nullable=False, default=OpportunityStatus.APPROVED
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    skills: Mapped[list["Skill"]] = relationship(secondary=opportunity_skills)
    eligibility: Mapped["OpportunityEligibility"] = relationship(
        back_populates="opportunity", uselist=False, cascade="all, delete-orphan"
    )