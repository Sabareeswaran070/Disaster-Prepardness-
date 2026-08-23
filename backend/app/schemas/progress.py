from datetime import datetime

from pydantic import BaseModel


# ============================================================
# Lesson Progress
# ============================================================

class LessonProgressResponse(BaseModel):

    lesson_id: int

    lesson_title: str

    status: str

    progress_percentage: int

    completed_at: datetime | None


# ============================================================
# Quiz Progress
# ============================================================

class QuizProgressResponse(BaseModel):

    quiz_id: int

    quiz_title: str

    attempts: int

    best_score: int

    total_points: int

    best_percentage: float

    passed: bool


# ============================================================
# Simulation Progress
# ============================================================

class SimulationProgressResponse(BaseModel):

    simulation_id: int

    simulation_title: str

    scenarios_answered: int

    score: int

    max_score: int

    percentage: float

    completed: bool


# ============================================================
# Student Dashboard
# ============================================================

class StudentDashboardResponse(BaseModel):

    total_lessons: int

    completed_lessons: int

    lesson_completion_percentage: float

    total_quizzes: int

    completed_quizzes: int

    quiz_average_percentage: float

    quizzes_passed: int

    total_simulations: int

    completed_simulations: int

    simulation_average_percentage: float

    overall_preparedness_percentage: float