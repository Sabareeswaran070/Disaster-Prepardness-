from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class DisasterBase(BaseModel):

    name: str = Field(
        min_length=2,
        max_length=100
    )

    description: str | None = None

    preparedness_guidelines: str | None = None

    response_guidelines: str | None = None

    recovery_guidelines: str | None = None


class DisasterCreate(DisasterBase):
    pass


class DisasterUpdate(BaseModel):

    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=100
    )

    description: str | None = None

    preparedness_guidelines: str | None = None

    response_guidelines: str | None = None

    recovery_guidelines: str | None = None

    is_active: bool | None = None


class DisasterResponse(DisasterBase):

    id: int

    is_active: bool

    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )