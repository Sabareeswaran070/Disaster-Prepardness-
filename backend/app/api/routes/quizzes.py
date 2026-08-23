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
# from app.schemas.quiz import (
#     QuestionCreate,
#     QuestionResponse,
#     QuizCreate,
#     QuizDetailResponse,
#     QuizResponse,
#     QuizResultResponse,
#     QuizUpdate,
#     StartQuizResponse,
#     SubmitQuizRequest,
# )
from app.schemas.quiz import (
    AdminQuestionResponse,
    AdminQuizDetailResponse,
    QuestionCreate,
    QuizCreate,
    QuizResponse,
    QuizResultResponse,
    QuizUpdate,
    StartQuizResponse,
    StudentQuizDetailResponse,
    SubmitQuizRequest,
)
from app.services.quiz_service import (
    add_question,
    create_quiz,
    delete_quiz,
    get_quiz,
    get_quizzes,
    publish_quiz,
    start_quiz,
    submit_quiz,
    unpublish_quiz,
    update_quiz,
)


router = APIRouter(
    prefix="/api/v1/quizzes",
    tags=["Quizzes"],
)


CONTENT_ROLES = (
    "ADMIN",
    "INSTITUTION_ADMIN",
    "FACULTY",
)


@router.get(
    "",
    response_model=list[QuizResponse],
)
def list_published_quizzes(
    disaster_id: int | None = None,
    lesson_id: int | None = None,
    db: Session = Depends(get_db),
):

    return get_quizzes(
        db=db,
        published_only=True,
        disaster_id=disaster_id,
        lesson_id=lesson_id,
    )
@router.get(
    "/{quiz_id}/admin",
    response_model=AdminQuizDetailResponse,
)
def get_quiz_admin(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "INSTITUTION_ADMIN",
            "FACULTY",
        )
    ),
):

    quiz = get_quiz(
        db,
        quiz_id,
    )

    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found",
        )

    return quiz

@router.get(
    "/{quiz_id}",
    response_model=StudentQuizDetailResponse,
)
def get_published_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
):

    quiz = get_quiz(
        db,
        quiz_id,
    )

    if not quiz or not quiz.is_published:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found",
        )

    return quiz


@router.post(
    "",
    response_model=QuizResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_quiz(
    data: QuizCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(*CONTENT_ROLES)
    ),
):

    try:

        return create_quiz(
            db,
            data,
        )

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.put(
    "/{quiz_id}",
    response_model=QuizResponse,
)
def update_existing_quiz(
    quiz_id: int,
    data: QuizUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(*CONTENT_ROLES)
    ),
):

    quiz = get_quiz(
        db,
        quiz_id,
    )

    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found",
        )

    if quiz.is_published:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unpublish quiz before editing",
        )

    return update_quiz(
        db,
        quiz,
        data,
    )


@router.post(
    "/{quiz_id}/questions",
    response_model=AdminQuestionResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_question_to_quiz(
    quiz_id: int,
    data: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(*CONTENT_ROLES)
    ),
):

    quiz = get_quiz(
        db,
        quiz_id,
    )

    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found",
        )

    try:

        return add_question(
            db,
            quiz,
            data,
        )

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.patch(
    "/{quiz_id}/publish",
    response_model=QuizResponse,
)
def publish_existing_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(*CONTENT_ROLES)
    ),
):

    quiz = get_quiz(
        db,
        quiz_id,
    )

    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found",
        )

    try:

        return publish_quiz(
            db,
            quiz,
        )

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.patch(
    "/{quiz_id}/unpublish",
    response_model=QuizResponse,
)
def unpublish_existing_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(*CONTENT_ROLES)
    ),
):

    quiz = get_quiz(
        db,
        quiz_id,
    )

    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found",
        )

    return unpublish_quiz(
        db,
        quiz,
    )


@router.delete(
    "/{quiz_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_existing_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "INSTITUTION_ADMIN",
        )
    ),
):

    quiz = get_quiz(
        db,
        quiz_id,
    )

    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found",
        )

    delete_quiz(
        db,
        quiz,
    )

    return None


@router.post(
    "/{quiz_id}/start",
    response_model=StartQuizResponse,
)
def start_quiz_attempt(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    quiz = get_quiz(
        db,
        quiz_id,
    )

    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found",
        )

    try:

        attempt = start_quiz(
            db,
            quiz,
            current_user.id,
        )

        return {
            "attempt_id": attempt.id,
            "quiz_id": attempt.quiz_id,
            "started_at": attempt.started_at,
        }

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.post(
    "/attempts/{attempt_id}/submit",
    response_model=QuizResultResponse,
)
def submit_quiz_attempt(
    attempt_id: int,
    data: SubmitQuizRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    from app.models.quiz_attempt import QuizAttempt

    attempt = (
        db.query(QuizAttempt)
        .filter(
            QuizAttempt.id == attempt_id,
            QuizAttempt.user_id == current_user.id,
        )
        .first()
    )

    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz attempt not found",
        )

    try:

        result = submit_quiz(
            db,
            attempt,
            data.answers,
        )

        updated_attempt = result["attempt"]

        return {
            "attempt_id": updated_attempt.id,
            "quiz_id": updated_attempt.quiz_id,
            "score": updated_attempt.score,
            "total_points": updated_attempt.total_points,
            "percentage": result["percentage"],
            "passed": updated_attempt.passed,
            "completed_at": updated_attempt.completed_at,
        }

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )