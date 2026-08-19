from sqlalchemy.orm import Session

from app.models.disaster import Disaster
from app.schemas.disaster import (
    DisasterCreate,
    DisasterUpdate,
)


def create_disaster(
    db: Session,
    data: DisasterCreate,
) -> Disaster:

    existing = (
        db.query(Disaster)
        .filter(Disaster.name == data.name)
        .first()
    )

    if existing:
        raise ValueError(
            "Disaster with this name already exists"
        )

    disaster = Disaster(
        name=data.name,
        description=data.description,
        preparedness_guidelines=data.preparedness_guidelines,
        response_guidelines=data.response_guidelines,
        recovery_guidelines=data.recovery_guidelines,
    )

    db.add(disaster)
    db.commit()
    db.refresh(disaster)

    return disaster


def get_disasters(
    db: Session,
    include_inactive: bool = False,
):

    query = db.query(Disaster)

    if not include_inactive:
        query = query.filter(
            Disaster.is_active.is_(True)
        )

    return query.order_by(
        Disaster.name
    ).all()


def get_disaster(
    db: Session,
    disaster_id: int,
) -> Disaster | None:

    return (
        db.query(Disaster)
        .filter(Disaster.id == disaster_id)
        .first()
    )


def update_disaster(
    db: Session,
    disaster: Disaster,
    data: DisasterUpdate,
) -> Disaster:

    updates = data.model_dump(
        exclude_unset=True
    )

    for field, value in updates.items():
        setattr(disaster, field, value)

    db.commit()
    db.refresh(disaster)

    return disaster


def delete_disaster(
    db: Session,
    disaster: Disaster,
) -> None:

    # Soft delete instead of physically
    # removing educational content.
    disaster.is_active = False

    db.commit()