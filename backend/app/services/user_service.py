from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User


VALID_ROLES = {
    "STUDENT",
    "FACULTY",
    "INSTITUTION_ADMIN",
    "ADMIN",
}


def get_user_by_id(
    db: Session,
    user_id: int,
) -> User | None:

    return (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )


def get_user_by_email(
    db: Session,
    email: str,
) -> User | None:

    return (
        db.query(User)
        .filter(User.email == email)
        .first()
    )


def get_users(
    db: Session,
    institution_id: int | None = None,
):

    query = db.query(User)

    if institution_id is not None:
        query = query.filter(
            User.institution_id == institution_id
        )

    return query.order_by(
        User.created_at.desc()
    ).all()


def create_managed_user(
    db: Session,
    full_name: str,
    email: str,
    password: str,
    role: str,
    institution_id: int | None,
) -> User:

    existing = get_user_by_email(
        db,
        email,
    )

    if existing:
        raise ValueError(
            "User with this email already exists"
        )

    if role not in VALID_ROLES:
        raise ValueError(
            "Invalid role"
        )

    user = User(
        full_name=full_name,
        email=email,
        password_hash=hash_password(password),
        role=role,
        institution_id=institution_id,
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def update_user_role(
    db: Session,
    user: User,
    new_role: str,
) -> User:

    if new_role not in VALID_ROLES:
        raise ValueError(
            "Invalid role"
        )

    user.role = new_role

    db.commit()
    db.refresh(user)

    return user


def update_user_status(
    db: Session,
    user: User,
    is_active: bool,
) -> User:

    user.is_active = is_active

    db.commit()
    db.refresh(user)

    return user