from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, EmailStr


class InstitutionCreate(BaseModel):

    name: str = Field(
        min_length=2,
        max_length=200
    )

    institution_type: str = Field(
        min_length=2,
        max_length=50
    )

    address: str | None = None

    city: str | None = Field(
        default=None,
        max_length=100
    )

    state: str | None = Field(
        default=None,
        max_length=100
    )

    contact_email: EmailStr | None = None

    contact_phone: str | None = Field(
        default=None,
        max_length=20
    )


class InstitutionUpdate(BaseModel):

    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=200
    )

    institution_type: str | None = Field(
        default=None,
        min_length=2,
        max_length=50
    )

    address: str | None = None

    city: str | None = Field(
        default=None,
        max_length=100
    )

    state: str | None = Field(
        default=None,
        max_length=100
    )

    contact_email: EmailStr | None = None

    contact_phone: str | None = Field(
        default=None,
        max_length=20
    )

    is_active: bool | None = None


class InstitutionResponse(BaseModel):

    id: int

    name: str

    institution_type: str

    address: str | None

    city: str | None

    state: str | None

    contact_email: str | None

    contact_phone: str | None

    is_active: bool

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )