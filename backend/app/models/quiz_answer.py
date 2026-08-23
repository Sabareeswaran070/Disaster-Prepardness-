from sqlalchemy import ForeignKey, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class QuizAnswer(Base):
    __tablename__ = "quiz_answers"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    attempt_id: Mapped[int] = mapped_column(
        ForeignKey("quiz_attempts.id"),
        nullable=False,
        index=True
    )

    question_id: Mapped[int] = mapped_column(
        ForeignKey("questions.id"),
        nullable=False,
        index=True
    )

    selected_option_id: Mapped[int | None] = mapped_column(
        ForeignKey("quiz_options.id"),
        nullable=True
    )

    is_correct: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    points_earned: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False
    )

    attempt = relationship(
        "QuizAttempt",
        back_populates="answers"
    )

    question = relationship(
        "Question",
        back_populates="answers"
    )

    selected_option = relationship(
        "QuizOption"
    )