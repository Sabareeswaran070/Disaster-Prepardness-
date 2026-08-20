from pydantic import BaseModel, Field


# ============================================================
# AI Chat
# ============================================================

class AIChatRequest(BaseModel):

    message: str = Field(
        min_length=2,
        max_length=2000,
    )


class AIChatResponse(BaseModel):

    answer: str


# ============================================================
# AI Quiz Generation
# ============================================================

class AIGenerateQuizRequest(BaseModel):

    lesson_id: int = Field(
        ge=1
    )

    number_of_questions: int = Field(
        default=5,
        ge=1,
        le=20,
    )


class AIGeneratedOption(BaseModel):

    option_text: str = Field(
        min_length=1,
        max_length=500,
    )

    option_order: int = Field(
        ge=1
    )

    is_correct: bool


class AIGeneratedQuestion(BaseModel):

    question_text: str = Field(
        min_length=3,
    )

    question_order: int = Field(
        ge=1
    )

    points: int = Field(
        default=1,
        ge=1,
    )

    options: list[AIGeneratedOption] = Field(
        min_length=2,
        max_length=6,
    )


class AIGenerateQuizResponse(BaseModel):

    lesson_id: int

    lesson_title: str

    questions: list[AIGeneratedQuestion]

# ============================================================
# Save AI Generated Quiz
# ============================================================

class AISaveQuizRequest(BaseModel):

    lesson_id: int = Field(
        ge=1
    )

    title: str = Field(
        min_length=2,
        max_length=200,
    )

    description: str | None = None

    passing_score: int = Field(
        default=60,
        ge=0,
        le=100,
    )

    time_limit_minutes: int | None = Field(
        default=None,
        ge=1,
    )

    questions: list[AIGeneratedQuestion] = Field(
        min_length=1,
        max_length=20,
    )


class AISaveQuizResponse(BaseModel):

    quiz_id: int

    lesson_id: int

    title: str

    question_count: int

    is_published: bool