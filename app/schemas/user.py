from datetime import datetime

from pydantic import BaseModel, ConfigDict , EmailStr , Field


class UserResponse(BaseModel):

    id: int

    full_name: str

    email: str

    role: str

    institution_id: int | None

    is_active: bool

    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )

class CreateManagedUserRequest(BaseModel):

    full_name: str = Field(
        min_length=2,
        max_length=150
    )

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=128
    )

    institution_id: int | None = None


class UpdateUserRoleRequest(BaseModel):

    role: str


class UpdateUserStatusRequest(BaseModel):

    is_active: bool