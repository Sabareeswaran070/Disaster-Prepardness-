from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# =========================
# Simulation Create / Update
# =========================

class SimulationCreate(BaseModel):
    disaster_id: int
    title: str = Field(
        min_length=2,
        max_length=200,
    )
    description: str | None = None
    difficulty: str = "BEGINNER"


class SimulationUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=2,
        max_length=200,
    )
    description: str | None = None
    difficulty: str | None = None


class SimulationResponse(BaseModel):
    id: int
    disaster_id: int
    title: str
    description: str | None
    difficulty: str
    is_published: bool
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


# =========================
# Admin Scenario
# =========================

class ScenarioCreate(BaseModel):
    scenario_order: int = Field(
        ge=1,
    )

    situation: str = Field(
        min_length=3,
    )

    choices: str = Field(
        min_length=1,
    )

    correct_choice: str = Field(
        min_length=1,
    )

    explanation: str | None = None

    points: int = Field(
        default=1,
        ge=1,
    )


class AdminScenarioResponse(BaseModel):
    id: int
    simulation_id: int
    scenario_order: int
    situation: str
    choices: str
    correct_choice: str
    explanation: str | None
    points: int

    model_config = ConfigDict(
        from_attributes=True,
    )


class AdminSimulationDetailResponse(
    SimulationResponse
):
    scenarios: list[AdminScenarioResponse] = []


# =========================
# Student Scenario
# =========================

class StudentScenarioResponse(BaseModel):
    id: int
    simulation_id: int
    scenario_order: int
    situation: str
    choices: str
    points: int

    model_config = ConfigDict(
        from_attributes=True,
    )


class StudentSimulationDetailResponse(
    SimulationResponse
):
    scenarios: list[StudentScenarioResponse] = []


# =========================
# Submit Simulation
# =========================

class SimulationDecision(BaseModel):
    scenario_id: int
    selected_choice: str = Field(
        min_length=1,
        max_length=500,
    )


class SubmitSimulationRequest(BaseModel):
    decisions: list[SimulationDecision]


# =========================
# Simulation Result
# =========================

class SimulationResultResponse(BaseModel):
    simulation_id: int
    score: int
    max_score: int
    percentage: float
    completed: bool
    responses_saved: int