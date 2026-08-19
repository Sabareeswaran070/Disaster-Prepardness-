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

from app.schemas.announcement import (
    AnnouncementCreate,
    AnnouncementResponse,
    AnnouncementUpdate,
)

from app.services.announcement_service import (
    create_announcement,
    delete_announcement,
    get_announcement,
    get_announcements,
    publish_announcement,
    unpublish_announcement,
    update_announcement,
)


router = APIRouter(
    prefix="/api/v1/announcements",
    tags=["Announcements"],
)


CONTENT_ROLES = (
    "ADMIN",
    "INSTITUTION_ADMIN",
)


# ============================================================
# List Published Announcements
# ============================================================

@router.get(
    "",
    response_model=list[AnnouncementResponse],
)
def list_announcements(
    disaster_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    return get_announcements(
        db=db,
        disaster_id=disaster_id,
        current_user_role=current_user.role,
        published_only=True,
    )


# ============================================================
# Get Announcement
# ============================================================

@router.get(
    "/{announcement_id}",
    response_model=AnnouncementResponse,
)
def get_announcement_detail(
    announcement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    announcement = get_announcement(
        db,
        announcement_id,
    )

    if (
        not announcement
        or not announcement.is_published
    ):

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found",
        )

    if announcement.target_role not in {
        "ALL",
        current_user.role,
    }:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found",
        )

    return announcement


# ============================================================
# Create Announcement
# ============================================================

@router.post(
    "",
    response_model=AnnouncementResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_announcement(
    data: AnnouncementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(*CONTENT_ROLES)
    ),
):

    try:

        return create_announcement(
            db,
            data,
        )

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


# ============================================================
# Update Announcement
# ============================================================

@router.put(
    "/{announcement_id}",
    response_model=AnnouncementResponse,
)
def update_existing_announcement(
    announcement_id: int,
    data: AnnouncementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(*CONTENT_ROLES)
    ),
):

    announcement = get_announcement(
        db,
        announcement_id,
    )

    if not announcement:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found",
        )

    try:

        return update_announcement(
            db,
            announcement,
            data,
        )

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


# ============================================================
# Publish
# ============================================================

@router.patch(
    "/{announcement_id}/publish",
    response_model=AnnouncementResponse,
)
def publish_existing_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(*CONTENT_ROLES)
    ),
):

    announcement = get_announcement(
        db,
        announcement_id,
    )

    if not announcement:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found",
        )

    return publish_announcement(
        db,
        announcement,
    )


# ============================================================
# Unpublish
# ============================================================

@router.patch(
    "/{announcement_id}/unpublish",
    response_model=AnnouncementResponse,
)
def unpublish_existing_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(*CONTENT_ROLES)
    ),
):

    announcement = get_announcement(
        db,
        announcement_id,
    )

    if not announcement:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found",
        )

    return unpublish_announcement(
        db,
        announcement,
    )


# ============================================================
# Delete
# ============================================================

@router.delete(
    "/{announcement_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_existing_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(*CONTENT_ROLES)
    ),
):

    announcement = get_announcement(
        db,
        announcement_id,
    )

    if not announcement:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found",
        )

    delete_announcement(
        db,
        announcement,
    )

    return None