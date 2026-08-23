from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# =========================
# Quiz Create / Update
# =========================

class QuizCreate(BaseModel):
    lesson_id: int | None = None
    disaster_id: int | None = None
    title: str = Field(min_length=2, max_length=200)
    description: str | None = None
    passing_score: int = Field(default=60, ge=0, le=100)
    time_limit_minutes: int | None = Field(default=None, ge=1)


class QuizUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=200)
    description: str | None = None
    passing_score: int | None = Field(default=None, ge=0, le=100)
    time_limit_minutes: int | None = Field(default=None, ge=1)


class QuizResponse(BaseModel):
    id: int
    lesson_id: int | None
    disaster_id: int | None
    title: str
    description: str | None
    passing_score: int
    time_limit_minutes: int | None
    is_published: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =========================
# Create Question
# =========================

class QuizOptionCreate(BaseModel):
    option_text: str = Field(min_length=1, max_length=500)
    option_order: int = Field(ge=1)
    is_correct: bool = False


class QuestionCreate(BaseModel):
    question_text: str = Field(min_length=3)
    question_order: int = Field(ge=1)
    points: int = Field(default=1, ge=1)
    options: list[QuizOptionCreate] = Field(min_length=2)


# =========================
# Admin / Faculty Responses
# =========================

class AdminQuizOptionResponse(BaseModel):
    id: int
    question_id: int
    option_text: str
    option_order: int
    is_correct: bool

    model_config = ConfigDict(from_attributes=True)


class AdminQuestionResponse(BaseModel):
    id: int
    quiz_id: int
    question_text: str
    question_order: int
    points: int
    options: list[AdminQuizOptionResponse]

    model_config = ConfigDict(from_attributes=True)


class AdminQuizDetailResponse(QuizResponse):
    questions: list[AdminQuestionResponse] = []


# =========================
# Student Responses
# =========================

class StudentQuizOptionResponse(BaseModel):
    id: int
    option_text: str
    option_order: int

    model_config = ConfigDict(from_attributes=True)


class StudentQuestionResponse(BaseModel):
    id: int
    question_text: str
    question_order: int
    points: int
    options: list[StudentQuizOptionResponse]

    model_config = ConfigDict(from_attributes=True)


class StudentQuizDetailResponse(QuizResponse):
    questions: list[StudentQuestionResponse] = []


# =========================
# Attempts
# =========================

class StartQuizResponse(BaseModel):
    attempt_id: int
    quiz_id: int
    started_at: datetime


class SubmitAnswer(BaseModel):
    question_id: int
    selected_option_id: int | None = None


class SubmitQuizRequest(BaseModel):
    answers: list[SubmitAnswer]


class QuizResultResponse(BaseModel):
    attempt_id: int
    quiz_id: int
    score: int
    total_points: int
    percentage: float
    passed: bool
    completed_at: datetime