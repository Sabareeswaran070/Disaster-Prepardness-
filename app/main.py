from fastapi import FastAPI
from app.core.database import Base, engine
import app.models
from app.core.config import settings
from app.api.routes.auth import router as auth_router
from app.api.routes.health import router as health_router
from app.api.routes.disasters import (
    router as disaster_router,
)
from app.api.routes.users import (
    router as users_router,
)
from app.api.routes.institutions import (
    router as institution_router,
)
from app.api.routes.lessons import (
    router as lesson_router,
)
from app.api.routes.quizzes import (
    router as quiz_router,
)
from app.api.routes.simulations import (
    router as simulation_router,
)
from app.api.routes.progress import (
    router as progress_router,
)
from app.api.routes.analytics import (
    router as analytics_router,
)
from app.api.routes.emergency import (
    router as emergency_router,
)
from app.api.routes.announcement import (
    router as announcement_router,
)
from app.api.routes.ai import (
    router as ai_router,
)
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "Backend API for Disaster Preparedness "
        "and Response Education System"
    ),
)
Base.metadata.create_all(bind=engine)

app.include_router(
    health_router
)
app.include_router(
    users_router
)

app.include_router(
    auth_router
)
app.include_router(
    disaster_router
)

app.include_router(
    institution_router
)

app.include_router(
    lesson_router
)
app.include_router(
    quiz_router
)
app.include_router(
    simulation_router
)
app.include_router(
    progress_router
)
app.include_router(
    analytics_router
)
app.include_router(
    emergency_router
)
app.include_router(
    announcement_router
)
app.include_router(
    ai_router
)
@app.get("/")
def root():

    return {
        "message": "Disaster Education API",
        "version": settings.APP_VERSION,
    }