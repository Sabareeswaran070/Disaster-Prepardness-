from sqlalchemy import ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class SimulationScenario(Base):
    __tablename__ = "simulation_scenarios"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    simulation_id: Mapped[int] = mapped_column(
        ForeignKey("simulations.id"),
        nullable=False,
        index=True
    )

    scenario_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    situation: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    choices: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    correct_choice: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    explanation: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    points: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False
    )

    simulation = relationship(
        "Simulation",
        back_populates="scenarios"
    )