from pydantic import BaseModel


# ============================================================
# User Statistics
# ============================================================

class UserAnalyticsResponse(BaseModel):

    total_users: int

    active_users: int

    inactive_users: int

    total_students: int

    total_faculty: int

    total_institution_admins: int

    total_admins: int


# ============================================================
# Learning Statistics
# ============================================================

class LearningAnalyticsResponse(BaseModel):

    total_lessons: int

    completed_lessons: int

    lesson_completion_percentage: float


# ============================================================
# Quiz Statistics
# ============================================================

class QuizAnalyticsResponse(BaseModel):

    total_quizzes: int

    total_attempts: int

    completed_attempts: int

    passed_attempts: int

    average_percentage: float

    pass_percentage: float


# ============================================================
# Simulation Statistics
# ============================================================

class SimulationAnalyticsResponse(BaseModel):

    total_simulations: int

    total_responses: int

    completed_simulations: int

    average_percentage: float


# ============================================================
# Disaster Analytics
# ============================================================

class DisasterAnalyticsResponse(BaseModel):

    disaster_id: int

    disaster_name: str

    total_lessons: int

    completed_lessons: int

    lesson_completion_percentage: float

    total_quizzes: int

    quiz_attempts: int

    quiz_average_percentage: float

    total_simulations: int

    simulation_responses: int


# ============================================================
# Overall Analytics
# ============================================================

class AdminAnalyticsResponse(BaseModel):

    users: UserAnalyticsResponse

    learning: LearningAnalyticsResponse

    quizzes: QuizAnalyticsResponse

    simulations: SimulationAnalyticsResponse


# ============================================================
# Analytics Dashboard
# ============================================================

class AnalyticsDashboardResponse(BaseModel):

    users: UserAnalyticsResponse

    learning: LearningAnalyticsResponse

    quizzes: QuizAnalyticsResponse

    simulations: SimulationAnalyticsResponse

    disasters: list[DisasterAnalyticsResponse]