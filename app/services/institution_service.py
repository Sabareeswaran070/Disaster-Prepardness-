from sqlalchemy.orm import Session

from app.models.institution import Institution
from app.schemas.institution import (
    InstitutionCreate,
    InstitutionUpdate,
)


def get_institution_by_id(
    db: Session,
    institution_id: int,
) -> Institution | None:

    return (
        db.query(Institution)
        .filter(
            Institution.id == institution_id
        )
        .first()
    )


def get_institutions(
    db: Session,
    include_inactive: bool = False,
):

    query = db.query(Institution)

    if not include_inactive:
        query = query.filter(
            Institution.is_active.is_(True)
        )

    return query.order_by(
        Institution.name
    ).all()


def create_institution(
    db: Session,
    data: InstitutionCreate,
) -> Institution:

    existing = (
        db.query(Institution)
        .filter(
            Institution.name == data.name
        )
        .first()
    )

    if existing:
        raise ValueError(
            "Institution with this name already exists"
        )

    institution = Institution(
        name=data.name,
        institution_type=data.institution_type,
        address=data.address,
        city=data.city,
        state=data.state,
        contact_email=data.contact_email,
        contact_phone=data.contact_phone,
    )

    db.add(institution)
    db.commit()
    db.refresh(institution)

    return institution


def update_institution(
    db: Session,
    institution: Institution,
    data: InstitutionUpdate,
) -> Institution:

    updates = data.model_dump(
        exclude_unset=True
    )

    for field, value in updates.items():
        setattr(
            institution,
            field,
            value
        )

    db.commit()
    db.refresh(institution)

    return institution


def deactivate_institution(
    db: Session,
    institution: Institution,
) -> Institution:

    institution.is_active = False

    db.commit()
    db.refresh(institution)

    return institution