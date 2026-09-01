from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.orm import Session

from app.api.deps import (
    get_current_user,
    require_roles,
)
from app.core.database import get_db
from app.models.user import User
from app.schemas.institution import (
    InstitutionCreate,
    InstitutionResponse,
    InstitutionUpdate,
)
from app.services.institution_service import (
    create_institution,
    deactivate_institution,
    get_institution_by_id,
    get_institutions,
    update_institution,
)


router = APIRouter(
    prefix="/api/v1/institutions",
    tags=["Institutions"],
)


# =========================
# List Institutions
# =========================

@router.get(
    "",
    response_model=list[InstitutionResponse],
)
def list_institutions(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    # ADMIN can see all active institutions.
    if current_user.role == "ADMIN":
        return get_institutions(db)

    # Other users can only see their own institution.
    if current_user.institution_id is None:
        return []

    institution = get_institution_by_id(
        db,
        current_user.institution_id,
    )

    if not institution or not institution.is_active:
        return []

    return [institution]


# =========================
# Get Institution
# =========================

@router.get(
    "/{institution_id}",
    response_model=InstitutionResponse,
)
def get_institution(
    institution_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    institution = get_institution_by_id(
        db,
        institution_id,
    )

    if (
        not institution
        or not institution.is_active
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Institution not found",
        )

    # ADMIN can access any institution.
    if current_user.role == "ADMIN":
        return institution

    # Other users can only access
    # their own institution.
    if (
        current_user.institution_id is None
        or institution.id
        != current_user.institution_id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot access this institution",
        )

    return institution


# =========================
# Create Institution
# =========================

@router.post(
    "",
    response_model=InstitutionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_institution(
    data: InstitutionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("ADMIN")
    ),
):

    try:

        return create_institution(
            db,
            data,
        )

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


# =========================
# Update Institution
# =========================

@router.put(
    "/{institution_id}",
    response_model=InstitutionResponse,
)
def update_existing_institution(
    institution_id: int,
    data: InstitutionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("ADMIN")
    ),
):

    institution = get_institution_by_id(
        db,
        institution_id,
    )

    if not institution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Institution not found",
        )

    return update_institution(
        db,
        institution,
        data,
    )


# =========================
# Deactivate Institution
# =========================

@router.delete(
    "/{institution_id}",
    response_model=InstitutionResponse,
)
def deactivate_existing_institution(
    institution_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("ADMIN")
    ),
):

    institution = get_institution_by_id(
        db,
        institution_id,
    )

    if not institution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Institution not found",
        )

    return deactivate_institution(
        db,
        institution,
    )