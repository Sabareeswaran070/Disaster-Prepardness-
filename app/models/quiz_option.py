from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class QuizOption(Base):
    __tablename__ = "quiz_options"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    question_id: Mapped[int] = mapped_column(
        ForeignKey("questions.id"),
        nullable=False,
        index=True
    )

    option_text: Mapped[str] = mapped_column(
        String(500),
        nullable=False
    )

    option_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    is_correct: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    question = relationship(
        "Question",
        back_populates="options"
    )