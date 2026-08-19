from sqlalchemy.orm import Session

from app.models.disaster import Disaster
from app.models.emergency import Emergency
from app.schemas.emergency import (
    EmergencyCreate,
    EmergencyUpdate,
)


def get_emergencies(
    db: Session,
    disaster_id: int | None = None,
    active_only: bool = True,
):
    query = db.query(Emergency)

    if active_only:
        query = query.filter(
            Emergency.is_active.is_(True)
        )

    if disaster_id is not None:
        query = query.filter(
            Emergency.disaster_id == disaster_id
        )

    return (
        query
        .order_by(Emergency.id.asc())
        .all()
    )


def get_emergency(
    db: Session,
    emergency_id: int,
):
    return (
        db.query(Emergency)
        .filter(
            Emergency.id == emergency_id
        )
        .first()
    )


def create_emergency(
    db: Session,
    data: EmergencyCreate,
):
    if data.disaster_id is not None:

        disaster = (
            db.query(Disaster)
            .filter(
                Disaster.id == data.disaster_id,
                Disaster.is_active.is_(True),
            )
            .first()
        )

        if not disaster:
            raise ValueError(
                "Active disaster not found"
            )

    emergency = Emergency(
        disaster_id=data.disaster_id,
        name=data.name.strip(),
        category=data.category.strip(),
        phone=(
            data.phone.strip()
            if data.phone
            else None
        ),
        description=data.description,
        is_active=True,
    )

    db.add(emergency)
    db.commit()
    db.refresh(emergency)

    return emergency


def update_emergency(
    db: Session,
    emergency: Emergency,
    data: EmergencyUpdate,
):
    updates = data.model_dump(
        exclude_unset=True
    )

    if (
        "disaster_id" in updates
        and updates["disaster_id"] is not None
    ):

        disaster = (
            db.query(Disaster)
            .filter(
                Disaster.id
                == updates["disaster_id"],
                Disaster.is_active.is_(True),
            )
            .first()
        )

        if not disaster:
            raise ValueError(
                "Active disaster not found"
            )

    for field, value in updates.items():

        if isinstance(value, str):
            value = value.strip()

        setattr(
            emergency,
            field,
            value,
        )

    db.commit()
    db.refresh(emergency)

    return emergency


def delete_emergency(
    db: Session,
    emergency: Emergency,
):
    db.delete(emergency)
    db.commit()