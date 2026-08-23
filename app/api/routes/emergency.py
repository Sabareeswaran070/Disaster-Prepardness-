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

from app.schemas.emergency import (
    EmergencyCreate,
    EmergencyResponse,
    EmergencyUpdate,
)

from app.services.emergency_service import (
    create_emergency,
    delete_emergency,
    get_emergencies,
    get_emergency,
    update_emergency,
)


router = APIRouter(
    prefix="/api/v1/emergencies",
    tags=["Emergencies"],
)


# ============================================================
# List Emergency Resources
# ============================================================

@router.get(
    "",
    response_model=list[EmergencyResponse],
)
def list_emergencies(
    disaster_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    return get_emergencies(
        db=db,
        disaster_id=disaster_id,
        active_only=True,
    )


# ============================================================
# Get Emergency Resource
# ============================================================

@router.get(
    "/{emergency_id}",
    response_model=EmergencyResponse,
)
def get_emergency_resource(
    emergency_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    emergency = get_emergency(
        db,
        emergency_id,
    )

    if (
        not emergency
        or not emergency.is_active
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Emergency resource not found",
        )

    return emergency


# ============================================================
# Create Emergency Resource
# ADMIN / INSTITUTION_ADMIN
# ============================================================

@router.post(
    "",
    response_model=EmergencyResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_emergency_resource(
    data: EmergencyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "INSTITUTION_ADMIN",
        )
    ),
):
    try:

        return create_emergency(
            db,
            data,
        )

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


# ============================================================
# Update Emergency Resource
# ADMIN / INSTITUTION_ADMIN
# ============================================================

@router.put(
    "/{emergency_id}",
    response_model=EmergencyResponse,
)
def update_emergency_resource(
    emergency_id: int,
    data: EmergencyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "INSTITUTION_ADMIN",
        )
    ),
):
    emergency = get_emergency(
        db,
        emergency_id,
    )

    if not emergency:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Emergency resource not found",
        )

    try:

        return update_emergency(
            db,
            emergency,
            data,
        )

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


# ============================================================
# Delete Emergency Resource
# ADMIN / INSTITUTION_ADMIN
# ============================================================

@router.delete(
    "/{emergency_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_emergency_resource(
    emergency_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "INSTITUTION_ADMIN",
        )
    ),
):
    emergency = get_emergency(
        db,
        emergency_id,
    )

    if not emergency:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Emergency resource not found",
        )

    delete_emergency(
        db,
        emergency,
    )

    return None