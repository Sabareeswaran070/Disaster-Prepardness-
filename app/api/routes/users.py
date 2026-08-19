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
from app.schemas.user import (
    CreateManagedUserRequest,
    UpdateUserRoleRequest,
    UpdateUserStatusRequest,
    UserResponse,
)
from app.services.user_service import (
    create_managed_user,
    get_user_by_id,
    get_users,
    update_user_role,
    update_user_status,
)


router = APIRouter(
    prefix="/api/v1/users",
    tags=["Users"],
)


@router.get(
    "",
    response_model=list[UserResponse],
)
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    # ADMIN can see all users.
    if current_user.role == "ADMIN":
        return get_users(db)

    # Institution administrators and faculty
    # only see users from their institution.
    if current_user.institution_id is None:
        return []

    return get_users(
        db,
        institution_id=current_user.institution_id,
    )


@router.get(
    "/{user_id}",
    response_model=UserResponse,
)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    user = get_user_by_id(
        db,
        user_id,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # ADMIN can access everyone.
    if current_user.role == "ADMIN":
        return user

    # Other roles can only access users
    # belonging to their institution.
    if (
        current_user.institution_id is None
        or user.institution_id
        != current_user.institution_id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot access this user",
        )

    return user


@router.post(
    "/faculty",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_faculty(
    data: CreateManagedUserRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "INSTITUTION_ADMIN",
        )
    ),
):

    # Institution admin must create faculty
    # inside their own institution.
    if current_user.role == "INSTITUTION_ADMIN":

        if current_user.institution_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Institution administrator "
                    "has no institution assigned"
                ),
            )

        institution_id = current_user.institution_id

    else:
        # ADMIN must explicitly provide institution.
        if data.institution_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "institution_id is required "
                    "when an ADMIN creates faculty"
                ),
            )

        institution_id = data.institution_id

    try:

        return create_managed_user(
            db=db,
            full_name=data.full_name,
            email=data.email,
            password=data.password,
            role="FACULTY",
            institution_id=institution_id,
        )

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.post(
    "/institution-admin",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_institution_admin(
    data: CreateManagedUserRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("ADMIN")
    ),
):

    if data.institution_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="institution_id is required",
        )

    try:

        return create_managed_user(
            db=db,
            full_name=data.full_name,
            email=data.email,
            password=data.password,
            role="INSTITUTION_ADMIN",
            institution_id=data.institution_id,
        )

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.patch(
    "/{user_id}/role",
    response_model=UserResponse,
)
def change_user_role(
    user_id: int,
    data: UpdateUserRoleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("ADMIN")
    ),
):

    user = get_user_by_id(
        db,
        user_id,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot change your own role",
        )

    try:

        return update_user_role(
            db,
            user,
            data.role,
        )

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.patch(
    "/{user_id}/status",
    response_model=UserResponse,
)
def change_user_status(
    user_id: int,
    data: UpdateUserStatusRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "INSTITUTION_ADMIN",
        )
    ),
):

    user = get_user_by_id(
        db,
        user_id,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot disable yourself",
        )

    # Institution admins can only manage
    # users in their own institution.
    if current_user.role == "INSTITUTION_ADMIN":

        if (
            current_user.institution_id is None
            or user.institution_id
            != current_user.institution_id
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot manage this user",
            )

    return update_user_status(
        db,
        user,
        data.is_active,
    )