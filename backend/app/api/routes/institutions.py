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


@router.get(
    "",
    response_model=list[InstitutionResponse],
)
def list_institutions(
    db: Session = Depends(get_db),
):

    return get_institutions(db)


@router.get(
    "/{institution_id}",
    response_model=InstitutionResponse,
)
def get_institution(
    institution_id: int,
    db: Session = Depends(get_db),
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

    return institution


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