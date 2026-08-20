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

from app.schemas.ai import (
    AIChatRequest,
    AIChatResponse,
    AIGenerateQuizRequest,
    AIGenerateQuizResponse,
    AISaveQuizRequest,
    AISaveQuizResponse,
)

from app.services.ai_service import (
    chat_with_ai,
    generate_quiz_from_lesson,
    save_ai_quiz,
)


router = APIRouter(
    prefix="/api/v1/ai",
    tags=["AI"],
)


@router.post(
    "/chat",
    response_model=AIChatResponse,
)
def ai_chat(
    data: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    answer = chat_with_ai(
        db=db,
        message=data.message,
    )

    return {
        "answer": answer
    }


@router.post(
    "/generate-quiz",
    response_model=AIGenerateQuizResponse,
)
def generate_ai_quiz(
    data: AIGenerateQuizRequest,
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

        return generate_quiz_from_lesson(
            db=db,
            lesson_id=data.lesson_id,
            number_of_questions=(
                data.number_of_questions
            ),
        )

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )

@router.post(
    "/save-quiz",
    response_model=AISaveQuizResponse,
    status_code=status.HTTP_201_CREATED,
)
def save_generated_quiz(
    data: AISaveQuizRequest,
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

        return save_ai_quiz(
            db=db,
            lesson_id=data.lesson_id,
            title=data.title,
            description=data.description,
            passing_score=data.passing_score,
            time_limit_minutes=(
                data.time_limit_minutes
            ),
            questions=data.questions,
        )

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )