from datetime import datetime

from sqlalchemy.orm import Session

from app.models.announcement import Announcement
from app.models.disaster import Disaster

from app.schemas.announcement import (
    AnnouncementCreate,
    AnnouncementUpdate,
)


ALLOWED_PRIORITIES = {
    "LOW",
    "NORMAL",
    "HIGH",
    "CRITICAL",
}

ALLOWED_TARGET_ROLES = {
    "ALL",
    "STUDENT",
    "FACULTY",
    "INSTITUTION_ADMIN",
}


def get_announcements(
    db: Session,
    disaster_id: int | None = None,
    current_user_role: str | None = None,
    published_only: bool = True,
):

    query = db.query(Announcement)

    if published_only:

        query = query.filter(
            Announcement.is_published.is_(True)
        )

    if disaster_id is not None:

        query = query.filter(
            Announcement.disaster_id
            == disaster_id
        )

    if current_user_role is not None:

        query = query.filter(
            Announcement.target_role.in_(
                [
                    "ALL",
                    current_user_role,
                ]
            )
        )

    return (
        query
        .order_by(
            Announcement.created_at.desc()
        )
        .all()
    )


def get_announcement(
    db: Session,
    announcement_id: int,
):

    return (
        db.query(Announcement)
        .filter(
            Announcement.id
            == announcement_id
        )
        .first()
    )


def validate_announcement_data(
    db: Session,
    disaster_id: int | None,
    priority: str,
    target_role: str,
):

    if priority not in ALLOWED_PRIORITIES:

        raise ValueError(
            "Invalid announcement priority"
        )

    if target_role not in ALLOWED_TARGET_ROLES:

        raise ValueError(
            "Invalid announcement target role"
        )

    if disaster_id is not None:

        disaster = (
            db.query(Disaster)
            .filter(
                Disaster.id == disaster_id,
                Disaster.is_active.is_(True),
            )
            .first()
        )

        if not disaster:

            raise ValueError(
                "Active disaster not found"
            )


def create_announcement(
    db: Session,
    data: AnnouncementCreate,
):

    priority = data.priority.strip().upper()
    target_role = data.target_role.strip().upper()

    validate_announcement_data(
        db=db,
        disaster_id=data.disaster_id,
        priority=priority,
        target_role=target_role,
    )

    announcement = Announcement(
        disaster_id=data.disaster_id,
        title=data.title.strip(),
        message=data.message.strip(),
        priority=priority,
        target_role=target_role,
        is_published=False,
    )

    db.add(announcement)
    db.commit()
    db.refresh(announcement)

    return announcement


def update_announcement(
    db: Session,
    announcement: Announcement,
    data: AnnouncementUpdate,
):

    updates = data.model_dump(
        exclude_unset=True
    )

    if "priority" in updates:

        updates["priority"] = (
            updates["priority"]
            .strip()
            .upper()
        )

    if "target_role" in updates:

        updates["target_role"] = (
            updates["target_role"]
            .strip()
            .upper()
        )

    validate_announcement_data(
        db=db,
        disaster_id=updates.get(
            "disaster_id",
            announcement.disaster_id,
        ),
        priority=updates.get(
            "priority",
            announcement.priority,
        ),
        target_role=updates.get(
            "target_role",
            announcement.target_role,
        ),
    )

    if (
        updates.get("is_published") is True
        and not announcement.is_published
    ):

        updates["published_at"] = (
            datetime.utcnow()
        )

    if (
        updates.get("is_published") is False
    ):

        updates["published_at"] = None

    for field, value in updates.items():

        if isinstance(value, str):
            value = value.strip()

        setattr(
            announcement,
            field,
            value,
        )

    db.commit()
    db.refresh(announcement)

    return announcement


def publish_announcement(
    db: Session,
    announcement: Announcement,
):

    if announcement.is_published:

        return announcement

    announcement.is_published = True
    announcement.published_at = datetime.utcnow()

    db.commit()
    db.refresh(announcement)

    return announcement


def unpublish_announcement(
    db: Session,
    announcement: Announcement,
):

    announcement.is_published = False
    announcement.published_at = None

    db.commit()
    db.refresh(announcement)

    return announcement


def delete_announcement(
    db: Session,
    announcement: Announcement,
):

    db.delete(announcement)
    db.commit()