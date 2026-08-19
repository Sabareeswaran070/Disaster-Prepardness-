from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class LessonCreate(BaseModel):

    disaster_id: int

    title: str = Field(
        min_length=2,
        max_length=200
    )

    description: str | None = None

    content: str | None = None

    difficulty: str = "BEGINNER"

    duration_minutes: int | None = Field(
        default=None,
        ge=1
    )


class LessonUpdate(BaseModel):

    title: str | None = Field(
        default=None,
        min_length=2,
        max_length=200
    )

    description: str | None = None

    content: str | None = None

    difficulty: str | None = None

    duration_minutes: int | None = Field(
        default=None,
        ge=1
    )

    # is_published: bool | None = None


class LessonResponse(BaseModel):

    id: int

    disaster_id: int

    title: str

    description: str | None

    content: str | None

    difficulty: str

    duration_minutes: int | None

    is_published: bool

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )