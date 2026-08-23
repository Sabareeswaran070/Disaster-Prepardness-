from datetime import datetime

from pydantic import BaseModel, ConfigDict


class LearningMaterialResponse(BaseModel):

    id: int

    lesson_id: int

    title: str

    material_type: str

    file_url: str | None

    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )