from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ARRAY, Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.opportunity import Opportunity


class OpportunityEligibility(Base):
    __tablename__ = "opportunity_eligibility"

    id: Mapped[int] = mapped_column(primary_key=True)
    opportunity_id: Mapped[int] = mapped_column(ForeignKey("opportunities.id"), unique=True, nullable=False)
    eligible_branches: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=False, default=list)
    eligible_semesters: Mapped[list[int]] = mapped_column(ARRAY(Integer), nullable=False, default=list)
    is_uncertain: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    opportunity: Mapped["Opportunity"] = relationship(back_populates="eligibility")