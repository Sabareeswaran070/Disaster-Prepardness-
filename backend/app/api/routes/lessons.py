import os
import uuid

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from app.api.deps import (
    get_current_user,
    require_roles,
)
from app.core.database import get_db
from app.models.user import User
from app.schemas.lesson import (
    LessonCreate,
    LessonResponse,
    LessonUpdate,
)
from app.schemas.learning_material import (
    LearningMaterialResponse,
)
from app.services.lesson_service import (
    create_lesson,
    create_material,
    delete_lesson,
    delete_material,
    get_lesson,
    get_lessons,
    get_material,
    get_materials,
    publish_lesson,
    unpublish_lesson,
    update_lesson,
)


router = APIRouter(
    prefix="/api/v1/lessons",
    tags=["Lessons"],
)


UPLOAD_DIR = "uploads/lessons"

ALLOWED_EXTENSIONS = {
    ".pdf",
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".mp4",
    ".webm",
}


@router.get(
    "",
    response_model=list[LessonResponse],
)
def list_lessons(
    disaster_id: int | None = None,
    db: Session = Depends(get_db),
):

    return get_lessons(
        db=db,
        disaster_id=disaster_id,
        published_only=True,
    )

# ============================================================
# Admin / Content Management — List All Lessons
# ============================================================

@router.get(
    "/manage",
    response_model=list[LessonResponse],
)
def list_manage_lessons(
    disaster_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "INSTITUTION_ADMIN",
            "FACULTY",
        )
    ),
):

    return get_lessons(
        db=db,
        disaster_id=disaster_id,
        published_only=False,
    )

@router.get(
    "/{lesson_id}",
    response_model=LessonResponse,
)
def get_lesson_by_id(
    lesson_id: int,
    db: Session = Depends(get_db),
):

    lesson = get_lesson(
        db,
        lesson_id,
    )

    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found",
        )

    if not lesson.is_published:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found",
        )

    return lesson


@router.post(
    "",
    response_model=LessonResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_lesson(
    data: LessonCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "INSTITUTION_ADMIN",
            "FACULTY",
        )
    ),
):

    try:

        return create_lesson(
            db,
            data,
        )

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.put(
    "/{lesson_id}",
    response_model=LessonResponse,
)
def update_existing_lesson(
    lesson_id: int,
    data: LessonUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "INSTITUTION_ADMIN",
            "FACULTY",
        )
    ),
):

    lesson = get_lesson(
        db,
        lesson_id,
    )

    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found",
        )

    return update_lesson(
        db,
        lesson,
        data,
    )


@router.patch(
    "/{lesson_id}/publish",
    response_model=LessonResponse,
)
def publish_existing_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "INSTITUTION_ADMIN",
            "FACULTY",
        )
    ),
):

    lesson = get_lesson(
        db,
        lesson_id,
    )

    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found",
        )

    return publish_lesson(
        db,
        lesson,
    )


@router.patch(
    "/{lesson_id}/unpublish",
    response_model=LessonResponse,
)
def unpublish_existing_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "INSTITUTION_ADMIN",
            "FACULTY",
        )
    ),
):

    lesson = get_lesson(
        db,
        lesson_id,
    )

    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found",
        )

    return unpublish_lesson(
        db,
        lesson,
    )


@router.delete(
    "/{lesson_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_existing_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "INSTITUTION_ADMIN",
        )
    ),
):

    lesson = get_lesson(
        db,
        lesson_id,
    )

    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found",
        )

    delete_lesson(
        db,
        lesson,
    )

    return None


@router.get(
    "/{lesson_id}/materials",
    response_model=list[LearningMaterialResponse],
)
def list_lesson_materials(
    lesson_id: int,
    db: Session = Depends(get_db),
):

    lesson = get_lesson(
        db,
        lesson_id,
    )

    if not lesson or not lesson.is_published:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found",
        )

    return get_materials(
        db,
        lesson_id,
    )


@router.post(
    "/{lesson_id}/materials",
    response_model=LearningMaterialResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_learning_material(
    lesson_id: int,
    title: str = Form(...),
    material_type: str = Form(...),
    file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "INSTITUTION_ADMIN",
            "FACULTY",
        )
    ),
):

    lesson = get_lesson(
        db,
        lesson_id,
    )

    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found",
        )

    file_url = None

    if file:

        extension = os.path.splitext(
            file.filename or ""
        )[1].lower()

        if extension not in ALLOWED_EXTENSIONS:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Unsupported file type. "
                    "Allowed: PDF, images and video."
                ),
            )

        os.makedirs(
            UPLOAD_DIR,
            exist_ok=True
        )

        unique_name = (
            f"{uuid.uuid4().hex}{extension}"
        )

        file_path = os.path.join(
            UPLOAD_DIR,
            unique_name
        )

        with open(
            file_path,
            "wb"
        ) as output:

            while chunk := await file.read(1024 * 1024):
                output.write(chunk)

        file_url = f"/uploads/lessons/{unique_name}"

    material = create_material(
        db=db,
        lesson_id=lesson_id,
        title=title,
        material_type=material_type,
        file_url=file_url,
    )

    return material


@router.delete(
    "/materials/{material_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_learning_material(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "INSTITUTION_ADMIN",
            "FACULTY",
        )
    ),
):

    material = get_material(
        db,
        material_id,
    )

    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learning material not found",
        )

    if material.file_url:

        file_path = material.file_url.lstrip(
            "/"
        )

        if os.path.exists(file_path):
            os.remove(file_path)

    delete_material(
        db,
        material,
    )

    return None