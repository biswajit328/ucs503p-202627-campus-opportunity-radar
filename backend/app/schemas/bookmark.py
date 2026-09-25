from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.opportunity import OpportunityOut


class BookmarkOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    opportunity_id: int
    created_at: datetime
    opportunity: OpportunityOut