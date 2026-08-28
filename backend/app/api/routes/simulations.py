from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.orm import Session

from app.api.deps import (
    get_current_user,
    require_roles,
)
from app.core.database import get_db
from app.models.user import User

from app.schemas.simulation import (
    AdminScenarioResponse,
    AdminSimulationDetailResponse,
    ScenarioCreate,
    SimulationCreate,
    SimulationResponse,
    SimulationResultResponse,
    SimulationUpdate,
    StudentSimulationDetailResponse,
    SubmitSimulationRequest,
)

from app.services.simulation_service import (
    add_scenario,
    create_simulation,
    delete_simulation,
    get_simulation,
    get_simulations,
    publish_simulation,
    submit_simulation,
    unpublish_simulation,
    update_simulation,
)


router = APIRouter(
    prefix="/api/v1/simulations",
    tags=["Simulations"],
)


CONTENT_ROLES = (
    "ADMIN",
    "INSTITUTION_ADMIN",
    "FACULTY",
)


# =========================
# List Published Simulations
# =========================

@router.get(
    "",
    response_model=list[SimulationResponse],
)
def list_simulations(
    disaster_id: int | None = None,
    db: Session = Depends(get_db),
):

    return get_simulations(
        db=db,
        published_only=True,
        disaster_id=disaster_id,
    )

# =========================
# Admin Simulation List
# IMPORTANT: before /{simulation_id}
# =========================

@router.get(
    "/manage",
    response_model=list[SimulationResponse],
)
def list_admin_simulations(
    disaster_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "INSTITUTION_ADMIN",
            "FACULTY",
        )
    ),
):

    return get_simulations(
        db=db,
        published_only=False,
        disaster_id=disaster_id,
    )


# =========================
# Admin Simulation Detail
# IMPORTANT: before /{simulation_id}
# =========================

@router.get(
    "/{simulation_id}/admin",
    response_model=AdminSimulationDetailResponse,
)
def get_simulation_admin(
    simulation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "INSTITUTION_ADMIN",
            "FACULTY",
        )
    ),
):

    simulation = get_simulation(
        db,
        simulation_id,
    )

    if not simulation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulation not found",
        )

    return simulation


# =========================
# Student Simulation Detail
# =========================

@router.get(
    "/{simulation_id}",
    response_model=StudentSimulationDetailResponse,
)
def get_published_simulation(
    simulation_id: int,
    db: Session = Depends(get_db),
):

    simulation = get_simulation(
        db,
        simulation_id,
    )

    if (
        not simulation
        or not simulation.is_published
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulation not found",
        )

    return simulation


# =========================
# Create Simulation
# =========================

@router.post(
    "",
    response_model=SimulationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_simulation(
    data: SimulationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(*CONTENT_ROLES)
    ),
):

    try:

        return create_simulation(
            db,
            data,
        )

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


# =========================
# Update Simulation
# =========================

@router.put(
    "/{simulation_id}",
    response_model=SimulationResponse,
)
def update_existing_simulation(
    simulation_id: int,
    data: SimulationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(*CONTENT_ROLES)
    ),
):

    simulation = get_simulation(
        db,
        simulation_id,
    )

    if not simulation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulation not found",
        )

    try:

        return update_simulation(
            db,
            simulation,
            data,
        )

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


# =========================
# Add Scenario
# =========================

@router.post(
    "/{simulation_id}/scenarios",
    response_model=AdminScenarioResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_scenario(
    simulation_id: int,
    data: ScenarioCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(*CONTENT_ROLES)
    ),
):

    simulation = get_simulation(
        db,
        simulation_id,
    )

    if not simulation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulation not found",
        )

    try:

        return add_scenario(
            db,
            simulation,
            data,
        )

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


# =========================
# Publish
# =========================

@router.patch(
    "/{simulation_id}/publish",
    response_model=SimulationResponse,
)
def publish_existing_simulation(
    simulation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(*CONTENT_ROLES)
    ),
):

    simulation = get_simulation(
        db,
        simulation_id,
    )

    if not simulation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulation not found",
        )

    try:

        return publish_simulation(
            db,
            simulation,
        )

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


# =========================
# Unpublish
# =========================

@router.patch(
    "/{simulation_id}/unpublish",
    response_model=SimulationResponse,
)
def unpublish_existing_simulation(
    simulation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(*CONTENT_ROLES)
    ),
):

    simulation = get_simulation(
        db,
        simulation_id,
    )

    if not simulation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulation not found",
        )

    return unpublish_simulation(
        db,
        simulation,
    )


# =========================
# Delete
# =========================

@router.delete(
    "/{simulation_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_existing_simulation(
    simulation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "INSTITUTION_ADMIN",
        )
    ),
):

    simulation = get_simulation(
        db,
        simulation_id,
    )

    if not simulation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulation not found",
        )

    delete_simulation(
        db,
        simulation,
    )

    return None


# =========================
# Submit Simulation
# =========================

@router.post(
    "/{simulation_id}/submit",
    response_model=SimulationResultResponse,
)
def submit_simulation_answers(
    simulation_id: int,
    data: SubmitSimulationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    simulation = get_simulation(
        db,
        simulation_id,
    )

    if not simulation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulation not found",
        )

    try:

        return submit_simulation(
            db=db,
            simulation=simulation,
            user_id=current_user.id,
            decisions=data.decisions,
        )

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )