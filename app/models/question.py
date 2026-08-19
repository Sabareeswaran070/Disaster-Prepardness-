from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    Text
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    quiz_id: Mapped[int] = mapped_column(
        ForeignKey("quizzes.id"),
        nullable=False,
        index=True
    )

    question_text: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    question_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    points: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    quiz = relationship(
        "Quiz",
        back_populates="questions"
    )

    options = relationship(
        "QuizOption",
        back_populates="question",
        cascade="all, delete-orphan"
    )

    answers = relationship(
        "QuizAnswer",
        back_populates="question"
    )