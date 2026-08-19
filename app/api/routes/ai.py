from fastapi import (
    APIRouter,
    Depends,
)

from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User

from app.schemas.ai import (
    AIChatRequest,
    AIChatResponse,
)

from app.services.ai_service import (
    chat_with_ai,
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