from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.recommendation import RecommendationOut
from app.services.recommendation_service import ProfileRequiredError, get_recommendations

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("", response_model=list[RecommendationOut])
def get_my_recommendations_route(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return get_recommendations(db, current_user, limit=limit)
    except ProfileRequiredError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Create a student profile first")