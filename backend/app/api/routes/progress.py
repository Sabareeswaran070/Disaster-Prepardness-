from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User

from app.schemas.progress import (
    LessonProgressResponse,
    QuizProgressResponse,
    SimulationProgressResponse,
    StudentDashboardResponse,
)

from app.services.progress_service import (
    get_lesson_progress,
    get_quiz_progress,
    get_simulation_progress,
    get_student_dashboard,
    update_lesson_progress,
)


router = APIRouter(
    prefix="/api/v1/progress",
    tags=["Learning Progress"],
)


# ============================================================
# Student Dashboard
# ============================================================

@router.get(
    "/dashboard",
    response_model=StudentDashboardResponse,
)
def student_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    return get_student_dashboard(
        db,
        current_user.id,
    )


# ============================================================
# Lesson Progress
# ============================================================

@router.get(
    "/lessons",
    response_model=list[LessonProgressResponse],
)
def student_lesson_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    return get_lesson_progress(
        db,
        current_user.id,
    )


# ============================================================
# Update Lesson Progress
# ============================================================

@router.put(
    "/lessons/{lesson_id}",
)
def update_student_lesson_progress(
    lesson_id: int,
    progress_percentage: int,
    status_value: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    try:

        progress = update_lesson_progress(
            db=db,
            user_id=current_user.id,
            lesson_id=lesson_id,
            progress_percentage=(
                progress_percentage
            ),
            status=status_value,
        )

        return {
            "message": "Lesson progress updated",
            "lesson_id": progress.lesson_id,
            "status": progress.status,
            "progress_percentage": (
                progress.progress_percentage
            ),
            "completed_at": progress.completed_at,
        }

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


# ============================================================
# Quiz Progress
# ============================================================

@router.get(
    "/quizzes",
    response_model=list[QuizProgressResponse],
)
def student_quiz_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    return get_quiz_progress(
        db,
        current_user.id,
    )


# ============================================================
# Simulation Progress
# ============================================================

@router.get(
    "/simulations",
    response_model=list[
        SimulationProgressResponse
    ],
)
def student_simulation_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    return get_simulation_progress(
        db,
        current_user.id,
    )