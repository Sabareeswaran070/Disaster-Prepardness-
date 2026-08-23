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
from app.schemas.disaster import (
    DisasterCreate,
    DisasterResponse,
    DisasterUpdate,
)
from app.services.disaster_service import (
    create_disaster,
    delete_disaster,
    get_disaster,
    get_disasters,
    update_disaster,
)


router = APIRouter(
    prefix="/api/v1/disasters",
    tags=["Disasters"],
)


@router.get(
    "",
    response_model=list[DisasterResponse],
)
def list_disasters(
    db: Session = Depends(get_db),
):

    return get_disasters(db)


@router.get(
    "/{disaster_id}",
    response_model=DisasterResponse,
)
def get_disaster_by_id(
    disaster_id: int,
    db: Session = Depends(get_db),
):

    disaster = get_disaster(
        db,
        disaster_id,
    )

    if not disaster or not disaster.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Disaster not found",
        )

    return disaster


@router.post(
    "",
    response_model=DisasterResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_disaster(
    data: DisasterCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "INSTITUTION_ADMIN",
            "FACULTY",
        )
    ),
):

    try:

        return create_disaster(
            db,
            data,
        )

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.put(
    "/{disaster_id}",
    response_model=DisasterResponse,
)
def update_existing_disaster(
    disaster_id: int,
    data: DisasterUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "INSTITUTION_ADMIN",
            "FACULTY",
        )
    ),
):

    disaster = get_disaster(
        db,
        disaster_id,
    )

    if not disaster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Disaster not found",
        )

    return update_disaster(
        db,
        disaster,
        data,
    )


@router.delete(
    "/{disaster_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_existing_disaster(
    disaster_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "INSTITUTION_ADMIN",
        )
    ),
):

    disaster = get_disaster(
        db,
        disaster_id,
    )

    if not disaster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Disaster not found",
        )

    delete_disaster(
        db,
        disaster,
    )

    return None