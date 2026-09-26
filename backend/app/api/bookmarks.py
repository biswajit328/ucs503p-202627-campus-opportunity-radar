from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.bookmark import BookmarkOut
from app.services.bookmark_service import ProfileRequiredError, get_my_bookmarks
from fastapi import HTTPException, status

router = APIRouter(prefix="/bookmarks", tags=["bookmarks"])


@router.get("", response_model=list[BookmarkOut])
def list_my_bookmarks_route(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return get_my_bookmarks(db, current_user)
    except ProfileRequiredError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Create a student profile first")