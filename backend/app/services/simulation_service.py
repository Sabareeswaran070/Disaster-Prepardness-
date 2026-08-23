from sqlalchemy.orm import Session, joinedload

from app.models.disaster import Disaster
from app.models.simulation import Simulation
from app.models.simulation_scenario import SimulationScenario
from app.models.simulation_response import SimulationResponse
from app.schemas.simulation import (
    ScenarioCreate,
    SimulationCreate,
    SimulationUpdate,
)


# =========================
# Get Simulation
# =========================

def get_simulation(
    db: Session,
    simulation_id: int,
) -> Simulation | None:

    return (
        db.query(Simulation)
        .options(
            joinedload(
                Simulation.scenarios
            )
        )
        .filter(
            Simulation.id == simulation_id
        )
        .first()
    )


# =========================
# List Simulations
# =========================

def get_simulations(
    db: Session,
    published_only: bool = False,
    disaster_id: int | None = None,
):

    query = db.query(Simulation)

    if published_only:
        query = query.filter(
            Simulation.is_published.is_(True)
        )

    if disaster_id is not None:
        query = query.filter(
            Simulation.disaster_id == disaster_id
        )

    return (
        query
        .order_by(
            Simulation.id.asc()
        )
        .all()
    )


# =========================
# Create Simulation
# =========================

def create_simulation(
    db: Session,
    data: SimulationCreate,
) -> Simulation:

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

    simulation = Simulation(
        disaster_id=data.disaster_id,
        title=data.title,
        description=data.description,
        difficulty=data.difficulty,
        is_published=False,
    )

    db.add(simulation)
    db.commit()
    db.refresh(simulation)

    return simulation


# =========================
# Update Simulation
# =========================

def update_simulation(
    db: Session,
    simulation: Simulation,
    data: SimulationUpdate,
) -> Simulation:

    if simulation.is_published:
        raise ValueError(
            "Unpublish simulation before editing"
        )

    updates = data.model_dump(
        exclude_unset=True
    )

    for field, value in updates.items():
        setattr(
            simulation,
            field,
            value,
        )

    db.commit()
    db.refresh(simulation)

    return simulation


# =========================
# Add Scenario
# =========================

def add_scenario(
    db: Session,
    simulation: Simulation,
    data: ScenarioCreate,
) -> SimulationScenario:

    if simulation.is_published:
        raise ValueError(
            "Cannot modify a published simulation"
        )

    scenario = SimulationScenario(
        simulation_id=simulation.id,
        scenario_order=data.scenario_order,
        situation=data.situation,
        choices=data.choices,
        correct_choice=data.correct_choice,
        explanation=data.explanation,
        points=data.points,
    )

    db.add(scenario)
    db.commit()
    db.refresh(scenario)

    return scenario


# =========================
# Publish Simulation
# =========================

def publish_simulation(
    db: Session,
    simulation: Simulation,
) -> Simulation:

    scenario_count = (
        db.query(
            SimulationScenario
        )
        .filter(
            SimulationScenario.simulation_id
            == simulation.id
        )
        .count()
    )

    if scenario_count == 0:
        raise ValueError(
            "Simulation must contain at least one scenario"
        )

    simulation.is_published = True

    db.commit()
    db.refresh(simulation)

    return simulation


# =========================
# Unpublish Simulation
# =========================

def unpublish_simulation(
    db: Session,
    simulation: Simulation,
) -> Simulation:

    simulation.is_published = False

    db.commit()
    db.refresh(simulation)

    return simulation


# =========================
# Delete Simulation
# =========================

def delete_simulation(
    db: Session,
    simulation: Simulation,
) -> None:

    db.delete(simulation)
    db.commit()


# =========================
# Submit Simulation
# =========================

def submit_simulation(
    db: Session,
    simulation: Simulation,
    user_id: int,
    decisions,
) -> dict:

    if not simulation.is_published:
        raise ValueError(
            "Simulation is not published"
        )

    scenarios = (
        db.query(
            SimulationScenario
        )
        .filter(
            SimulationScenario.simulation_id
            == simulation.id
        )
        .order_by(
            SimulationScenario.scenario_order.asc()
        )
        .all()
    )

    if not scenarios:
        raise ValueError(
            "Simulation has no scenarios"
        )

    scenario_map = {
        scenario.id: scenario
        for scenario in scenarios
    }

    if len(decisions) != len(scenarios):
        raise ValueError(
            "All scenarios must be answered"
        )

    submitted_scenarios = set()

    score = 0
    max_score = sum(
        scenario.points
        for scenario in scenarios
    )

    saved_responses = []

    for decision in decisions:

        scenario = scenario_map.get(
            decision.scenario_id
        )

        if not scenario:
            raise ValueError(
                "Scenario does not belong to this simulation"
            )

        if (
            decision.scenario_id
            in submitted_scenarios
        ):
            raise ValueError(
                "Duplicate scenario decision"
            )

        submitted_scenarios.add(
            decision.scenario_id
        )

        selected_choice = (
            decision.selected_choice.strip()
        )

        if not selected_choice:
            raise ValueError(
                "Selected choice cannot be empty"
            )

        is_correct = (
            selected_choice.casefold()
            == scenario.correct_choice.strip().casefold()
        )

        points_earned = (
            scenario.points
            if is_correct
            else 0
        )

        score += points_earned

        response = SimulationResponse(
            simulation_id=simulation.id,
            scenario_id=scenario.id,
            user_id=user_id,
            selected_choice=selected_choice,
            points_earned=points_earned,
        )

        db.add(response)

        saved_responses.append(
            response
        )

    percentage = (
        (score / max_score) * 100
        if max_score > 0
        else 0
    )

    db.commit()

    for response in saved_responses:
        db.refresh(response)

    return {
        "simulation_id": simulation.id,
        "score": score,
        "max_score": max_score,
        "percentage": round(
            percentage,
            2,
        ),
        "completed": True,
        "responses_saved": len(
            saved_responses
        ),
    }