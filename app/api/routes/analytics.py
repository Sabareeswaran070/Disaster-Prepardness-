from fastapi import (
    APIRouter,
    Depends,
)

from sqlalchemy.orm import Session

from app.api.deps import (
    get_current_user,
    require_roles,
)

from app.core.database import get_db

from app.models.user import User

from app.schemas.analytics import (
    AnalyticsDashboardResponse,
)

from app.services.analytics_service import (
    get_analytics_dashboard,
)


router = APIRouter(
    prefix="/api/v1/analytics",
    tags=["Analytics"],
)


ANALYTICS_ROLES = (
    "ADMIN",
    "INSTITUTION_ADMIN",
    "FACULTY",
)


# ============================================================
# Analytics Dashboard
# ============================================================

@router.get(
    "/dashboard",
    response_model=AnalyticsDashboardResponse,
)
def analytics_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            *ANALYTICS_ROLES
        )
    ),
):

    return get_analytics_dashboard(
        db,
        current_user,
    )