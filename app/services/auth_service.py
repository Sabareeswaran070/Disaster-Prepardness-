from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import RegisterRequest


# ALLOWED_ROLES = {
#     "STUDENT",
#     "FACULTY",
#     "INSTITUTION_ADMIN",
#     "ADMIN",
# }


def get_user_by_email(
    db: Session,
    email: str,
) -> User | None:

    return (
        db.query(User)
        .filter(User.email == email)
        .first()
    )


def register_user(
    db: Session,
    data: RegisterRequest,
) -> User:

    existing_user = get_user_by_email(
        db,
        data.email,
    )

    if existing_user:
        raise ValueError(
            "User with this email already exists"
        )

    # if data.role not in ALLOWED_ROLES:
    #     raise ValueError(
    #         "Invalid user role"
    #     )

    user = User(
        full_name=data.full_name,
        email=data.email,
        password_hash=hash_password(data.password),
        role="STUDENT",
        institution_id=data.institution_id,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def authenticate_user(
    db: Session,
    email: str,
    password: str,
) -> User | None:

    user = get_user_by_email(
        db,
        email,
    )

    if not user:
        return None

    if not user.is_active:
        return None

    if not verify_password(
        password,
        user.password_hash,
    ):
        return None

    return user


def generate_token(user: User) -> str:

    return create_access_token(
        user_id=user.id,
        role=user.role,
    )