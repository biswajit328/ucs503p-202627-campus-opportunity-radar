from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User
from app.repositories.user_repository import get_user_by_email, create_user


class EmailAlreadyRegisteredError(Exception):
    pass


class InvalidCredentialsError(Exception):
    pass


def register_user(db: Session, email: str, password: str) -> User:
    if get_user_by_email(db, email):
        raise EmailAlreadyRegisteredError()
    hashed = hash_password(password)
    return create_user(db, email=email, hashed_password=hashed)


def authenticate_user(db: Session, email: str, password: str) -> User:
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        raise InvalidCredentialsError()
    return user


def create_token_for_user(user: User) -> str:
    return create_access_token({"sub": str(user.id), "role": user.role.value})