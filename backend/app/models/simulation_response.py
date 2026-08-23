from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class SimulationResponse(Base):
    __tablename__ = "simulation_responses"

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

    scenario_id: Mapped[int] = mapped_column(
        ForeignKey("simulation_scenarios.id"),
        nullable=False,
        index=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    selected_choice: Mapped[str] = mapped_column(
        String(500),
        nullable=False
    )

    points_earned: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False
    )

    responded_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    simulation = relationship("Simulation")

    scenario = relationship("SimulationScenario")

    user = relationship("User")