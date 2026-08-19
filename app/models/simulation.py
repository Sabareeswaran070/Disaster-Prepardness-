from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Simulation(Base):
    __tablename__ = "simulations"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    disaster_id: Mapped[int] = mapped_column(
        ForeignKey("disasters.id"),
        nullable=False,
        index=True
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    difficulty: Mapped[str] = mapped_column(
        String(30),
        default="BEGINNER",
        nullable=False
    )

    is_published: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    disaster = relationship("Disaster")

    scenarios = relationship(
        "SimulationScenario",
        back_populates="simulation",
        cascade="all, delete-orphan"
    )