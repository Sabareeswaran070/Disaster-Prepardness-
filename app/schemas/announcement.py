from datetime import datetime

from pydantic import BaseModel, Field


class AnnouncementCreate(BaseModel):

    disaster_id: int | None = None

    title: str = Field(
        min_length=2,
        max_length=200,
    )

    message: str = Field(
        min_length=3,
    )

    priority: str = Field(
        default="NORMAL",
        min_length=3,
        max_length=20,
    )

    target_role: str = Field(
        default="ALL",
        max_length=30,
    )


class AnnouncementUpdate(BaseModel):

    disaster_id: int | None = None

    title: str | None = Field(
        default=None,
        min_length=2,
        max_length=200,
    )

    message: str | None = Field(
        default=None,
        min_length=3,
    )

    priority: str | None = Field(
        default=None,
        min_length=3,
        max_length=20,
    )

    target_role: str | None = Field(
        default=None,
        max_length=30,
    )

    is_published: bool | None = None


class AnnouncementResponse(BaseModel):

    id: int
    disaster_id: int | None
    title: str
    message: str
    priority: str
    target_role: str
    is_published: bool
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }