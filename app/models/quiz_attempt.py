from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    Boolean
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

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

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    score: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False
    )

    total_points: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False
    )

    passed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    started_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )

    quiz = relationship(
        "Quiz",
        back_populates="attempts"
    )

    user = relationship("User")

    answers = relationship(
        "QuizAnswer",
        back_populates="attempt",
        cascade="all, delete-orphan"
    )