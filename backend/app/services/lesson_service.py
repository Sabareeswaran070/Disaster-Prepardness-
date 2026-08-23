from sqlalchemy.orm import Session

from app.models.disaster import Disaster
from app.models.lesson import Lesson
from app.models.learning_material import LearningMaterial
from app.schemas.lesson import (
    LessonCreate,
    LessonUpdate,
)


def get_lesson(
    db: Session,
    lesson_id: int,
) -> Lesson | None:

    return (
        db.query(Lesson)
        .filter(Lesson.id == lesson_id)
        .first()
    )


def get_lessons(
    db: Session,
    disaster_id: int | None = None,
    published_only: bool = False,
):

    query = db.query(Lesson)

    if disaster_id is not None:
        query = query.filter(
            Lesson.disaster_id == disaster_id
        )

    if published_only:
        query = query.filter(
            Lesson.is_published.is_(True)
        )

    return (
        query
        .order_by(Lesson.id.asc())
        .all()
    )


def create_lesson(
    db: Session,
    data: LessonCreate,
) -> Lesson:

    disaster = (
        db.query(Disaster)
        .filter(
            Disaster.id == data.disaster_id,
            Disaster.is_active.is_(True),
        )
        .first()
    )

    if not disaster:
        raise ValueError(
            "Active disaster not found"
        )

    lesson = Lesson(
        disaster_id=data.disaster_id,
        title=data.title,
        description=data.description,
        content=data.content,
        difficulty=data.difficulty,
        duration_minutes=data.duration_minutes,
        is_published=False,
    )

    db.add(lesson)
    db.commit()
    db.refresh(lesson)

    return lesson


def update_lesson(
    db: Session,
    lesson: Lesson,
    data: LessonUpdate,
) -> Lesson:

    updates = data.model_dump(
        exclude_unset=True
    )

    for field, value in updates.items():
        setattr(
            lesson,
            field,
            value
        )

    db.commit()
    db.refresh(lesson)

    return lesson


def publish_lesson(
    db: Session,
    lesson: Lesson,
) -> Lesson:

    lesson.is_published = True

    db.commit()
    db.refresh(lesson)

    return lesson


def unpublish_lesson(
    db: Session,
    lesson: Lesson,
) -> Lesson:

    lesson.is_published = False

    db.commit()
    db.refresh(lesson)

    return lesson


def delete_lesson(
    db: Session,
    lesson: Lesson,
) -> None:

    db.delete(lesson)
    db.commit()


def get_materials(
    db: Session,
    lesson_id: int,
):

    return (
        db.query(LearningMaterial)
        .filter(
            LearningMaterial.lesson_id == lesson_id
        )
        .order_by(
            LearningMaterial.id.asc()
        )
        .all()
    )


def get_material(
    db: Session,
    material_id: int,
) -> LearningMaterial | None:

    return (
        db.query(LearningMaterial)
        .filter(
            LearningMaterial.id == material_id
        )
        .first()
    )


def create_material(
    db: Session,
    lesson_id: int,
    title: str,
    material_type: str,
    file_url: str | None,
) -> LearningMaterial:

    material = LearningMaterial(
        lesson_id=lesson_id,
        title=title,
        material_type=material_type,
        file_url=file_url,
    )

    db.add(material)
    db.commit()
    db.refresh(material)

    return material


def delete_material(
    db: Session,
    material: LearningMaterial,
) -> None:

    db.delete(material)
    db.commit()