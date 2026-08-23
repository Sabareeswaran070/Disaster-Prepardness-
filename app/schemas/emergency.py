from datetime import datetime

from pydantic import BaseModel, Field


class EmergencyCreate(BaseModel):
    disaster_id: int | None = None

    name: str = Field(
        min_length=2,
        max_length=150,
    )

    category: str = Field(
        min_length=2,
        max_length=50,
    )

    phone: str | None = Field(
        default=None,
        max_length=30,
    )

    description: str | None = None


class EmergencyUpdate(BaseModel):
    disaster_id: int | None = None

    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=150,
    )

    category: str | None = Field(
        default=None,
        min_length=2,
        max_length=50,
    )

    phone: str | None = Field(
        default=None,
        max_length=30,
    )

    description: str | None = None

    is_active: bool | None = None


class EmergencyResponse(BaseModel):
    id: int
    disaster_id: int | None
    name: str
    category: str
    phone: str | None
    description: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }