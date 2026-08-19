from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.institution import Institution
from app.models.disaster import Disaster
from app.models.lesson import Lesson
from app.models.learning_progress import LearningProgress
from app.models.quiz import Quiz
from app.models.quiz_attempt import QuizAttempt
from app.models.simulation import Simulation
from app.models.simulation_response import SimulationResponse


# ============================================================
# Helper
# ============================================================

def get_institution_filter(
    current_user: User,
):
    """
    ADMIN:
        No institution restriction.

    INSTITUTION_ADMIN / FACULTY:
        Restrict analytics to their institution.
    """

    if current_user.role == "ADMIN":
        return None

    return current_user.institution_id


# ============================================================
# User Analytics
# ============================================================

def get_user_analytics(
    db: Session,
    institution_id: int | None = None,
):

    query = db.query(User)

    if institution_id is not None:

        query = query.filter(
            User.institution_id
            == institution_id
        )

    total_users = query.count()

    active_users = (
        query
        .filter(
            User.is_active.is_(True)
        )
        .count()
    )

    inactive_users = (
        query
        .filter(
            User.is_active.is_(False)
        )
        .count()
    )

    total_students = (
        query
        .filter(
            User.role == "STUDENT"
        )
        .count()
    )

    total_faculty = (
        query
        .filter(
            User.role == "FACULTY"
        )
        .count()
    )

    total_institution_admins = (
        query
        .filter(
            User.role == "INSTITUTION_ADMIN"
        )
        .count()
    )

    total_admins = (
        query
        .filter(
            User.role == "ADMIN"
        )
        .count()
    )

    return {
        "total_users": total_users,
        "active_users": active_users,
        "inactive_users": inactive_users,
        "total_students": total_students,
        "total_faculty": total_faculty,
        "total_institution_admins": (
            total_institution_admins
        ),
        "total_admins": total_admins,
    }


# ============================================================
# Learning Analytics
# ============================================================

def get_learning_analytics(
    db: Session,
    institution_id: int | None = None,
):

    total_lessons = (
        db.query(Lesson)
        .filter(
            Lesson.is_published.is_(True)
        )
        .count()
    )

    query = (
        db.query(LearningProgress)
        .join(
            User,
            User.id
            == LearningProgress.user_id,
        )
        .join(
            Lesson,
            Lesson.id
            == LearningProgress.lesson_id,
        )
        .filter(
            Lesson.is_published.is_(True),
            LearningProgress.status
            == "COMPLETED",
        )
    )

    if institution_id is not None:

        query = query.filter(
            User.institution_id
            == institution_id
        )

    completed_lessons = query.count()

    total_progress_records = (
        db.query(LearningProgress)
        .join(
            User,
            User.id
            == LearningProgress.user_id,
        )
        .join(
            Lesson,
            Lesson.id
            == LearningProgress.lesson_id,
        )
        .filter(
            Lesson.is_published.is_(True)
        )
    )

    if institution_id is not None:

        total_progress_records = (
            total_progress_records.filter(
                User.institution_id
                == institution_id
            )
        )

    total_progress_records = (
        total_progress_records.count()
    )

    lesson_completion_percentage = (
        (
            completed_lessons
            / total_progress_records
        ) * 100
        if total_progress_records > 0
        else 0
    )

    return {
        "total_lessons": total_lessons,
        "completed_lessons": completed_lessons,
        "lesson_completion_percentage": round(
            lesson_completion_percentage,
            2,
        ),
    }


# ============================================================
# Quiz Analytics
# ============================================================

def get_quiz_analytics(
    db: Session,
    institution_id: int | None = None,
):

    total_quizzes = (
        db.query(Quiz)
        .filter(
            Quiz.is_published.is_(True)
        )
        .count()
    )

    query = (
        db.query(QuizAttempt)
        .join(
            User,
            User.id
            == QuizAttempt.user_id,
        )
        .join(
            Quiz,
            Quiz.id
            == QuizAttempt.quiz_id,
        )
        .filter(
            Quiz.is_published.is_(True)
        )
    )

    if institution_id is not None:

        query = query.filter(
            User.institution_id
            == institution_id
        )

    total_attempts = query.count()

    completed_attempts = (
        query
        .filter(
            QuizAttempt.completed_at.is_not(None)
        )
        .count()
    )

    passed_attempts = (
        query
        .filter(
            QuizAttempt.completed_at.is_not(None),
            QuizAttempt.passed.is_(True),
        )
        .count()
    )

    completed = (
        query
        .filter(
            QuizAttempt.completed_at.is_not(None),
            QuizAttempt.total_points > 0,
        )
        .all()
    )

    percentages = []

    for attempt in completed:

        percentage = (
            attempt.score
            / attempt.total_points
        ) * 100

        percentages.append(
            percentage
        )

    average_percentage = (
        sum(percentages)
        / len(percentages)
        if percentages
        else 0
    )

    pass_percentage = (
        (
            passed_attempts
            / completed_attempts
        ) * 100
        if completed_attempts > 0
        else 0
    )

    return {
        "total_quizzes": total_quizzes,
        "total_attempts": total_attempts,
        "completed_attempts": (
            completed_attempts
        ),
        "passed_attempts": passed_attempts,
        "average_percentage": round(
            average_percentage,
            2,
        ),
        "pass_percentage": round(
            pass_percentage,
            2,
        ),
    }


# ============================================================
# Simulation Analytics
# ============================================================

def get_simulation_analytics(
    db: Session,
    institution_id: int | None = None,
):

    total_simulations = (
        db.query(Simulation)
        .filter(
            Simulation.is_published.is_(True)
        )
        .count()
    )

    query = (
        db.query(
            SimulationResponse
        )
        .join(
            User,
            User.id
            == SimulationResponse.user_id,
        )
        .join(
            Simulation,
            Simulation.id
            == SimulationResponse.simulation_id,
        )
        .filter(
            Simulation.is_published.is_(True)
        )
    )

    if institution_id is not None:

        query = query.filter(
            User.institution_id
            == institution_id
        )

    responses = query.all()

    total_responses = len(
        responses
    )

    # --------------------------------------------------------
    # Calculate simulation completion
    # --------------------------------------------------------

    simulation_ids = [
        simulation.id
        for simulation in (
            db.query(Simulation)
            .filter(
                Simulation.is_published.is_(True)
            )
            .all()
        )
    ]

    completed_simulations = 0

    percentages = []

    for simulation_id in simulation_ids:

        scenario_count = (
            db.query(
                func.count(
                    SimulationResponse.scenario_id
                )
            )
            .join(
                User,
                User.id
                == SimulationResponse.user_id,
            )
            .filter(
                SimulationResponse.simulation_id
                == simulation_id
            )
        )

        if institution_id is not None:

            scenario_count = (
                scenario_count.filter(
                    User.institution_id
                    == institution_id
                )
            )

        # Get users who answered this simulation
        users = (
            db.query(
                SimulationResponse.user_id
            )
            .join(
                User,
                User.id
                == SimulationResponse.user_id,
            )
            .filter(
                SimulationResponse.simulation_id
                == simulation_id
            )
        )

        if institution_id is not None:

            users = users.filter(
                User.institution_id
                == institution_id
            )

        user_ids = [
            row[0]
            for row in users.distinct().all()
        ]

        scenario_total = (
            db.query(
                SimulationResponse.scenario_id
            )
            .filter(
                SimulationResponse.simulation_id
                == simulation_id
            )
            .distinct()
            .count()
        )

        if scenario_total == 0:
            continue

        for user_id in user_ids:

            response_count = (
                db.query(
                    SimulationResponse
                )
                .filter(
                    SimulationResponse.simulation_id
                    == simulation_id,
                    SimulationResponse.user_id
                    == user_id,
                )
                .count()
            )

            if response_count >= scenario_total:

                completed_simulations += 1

                student_responses = (
                    db.query(
                        SimulationResponse
                    )
                    .filter(
                        SimulationResponse.simulation_id
                        == simulation_id,
                        SimulationResponse.user_id
                        == user_id,
                    )
                    .all()
                )

                score = sum(
                    response.points_earned
                    for response
                    in student_responses
                )

                # Maximum score
                from app.models.simulation_scenario import (
                    SimulationScenario,
                )

                max_score = (
                    db.query(
                        func.sum(
                            SimulationScenario.points
                        )
                    )
                    .filter(
                        SimulationScenario.simulation_id
                        == simulation_id
                    )
                    .scalar()
                    or 0
                )

                if max_score > 0:

                    percentages.append(
                        (score / max_score) * 100
                    )

    average_percentage = (
        sum(percentages)
        / len(percentages)
        if percentages
        else 0
    )

    return {
        "total_simulations": (
            total_simulations
        ),
        "total_responses": total_responses,
        "completed_simulations": (
            completed_simulations
        ),
        "average_percentage": round(
            average_percentage,
            2,
        ),
    }


# ============================================================
# Disaster Analytics
# ============================================================

def get_disaster_analytics(
    db: Session,
    institution_id: int | None = None,
):

    disasters = (
        db.query(Disaster)
        .filter(
            Disaster.is_active.is_(True)
        )
        .order_by(
            Disaster.id.asc()
        )
        .all()
    )

    results = []

    for disaster in disasters:

        # ----------------------------------------------------
        # Lessons
        # ----------------------------------------------------

        total_lessons = (
            db.query(Lesson)
            .filter(
                Lesson.disaster_id
                == disaster.id,
                Lesson.is_published.is_(True),
            )
            .count()
        )

        completed_lessons_query = (
            db.query(LearningProgress)
            .join(
                User,
                User.id
                == LearningProgress.user_id,
            )
            .join(
                Lesson,
                Lesson.id
                == LearningProgress.lesson_id,
            )
            .filter(
                Lesson.disaster_id
                == disaster.id,
                Lesson.is_published.is_(True),
                LearningProgress.status
                == "COMPLETED",
            )
        )

        if institution_id is not None:

            completed_lessons_query = (
                completed_lessons_query.filter(
                    User.institution_id
                    == institution_id
                )
            )

        completed_lessons = (
            completed_lessons_query.count()
        )

        lesson_percentage = (
            (
                completed_lessons
                / total_lessons
            ) * 100
            if total_lessons > 0
            else 0
        )

        # ----------------------------------------------------
        # Quizzes
        # ----------------------------------------------------

        total_quizzes = (
            db.query(Quiz)
            .filter(
                Quiz.disaster_id
                == disaster.id,
                Quiz.is_published.is_(True),
            )
            .count()
        )

        quiz_query = (
            db.query(QuizAttempt)
            .join(
                User,
                User.id
                == QuizAttempt.user_id,
            )
            .join(
                Quiz,
                Quiz.id
                == QuizAttempt.quiz_id,
            )
            .filter(
                Quiz.disaster_id
                == disaster.id,
                Quiz.is_published.is_(True),
                QuizAttempt.completed_at.is_not(None),
            )
        )

        if institution_id is not None:

            quiz_query = quiz_query.filter(
                User.institution_id
                == institution_id
            )

        quiz_attempts = quiz_query.all()

        quiz_percentages = []

        for attempt in quiz_attempts:

            if attempt.total_points > 0:

                quiz_percentages.append(
                    (
                        attempt.score
                        / attempt.total_points
                    ) * 100
                )

        quiz_average = (
            sum(quiz_percentages)
            / len(quiz_percentages)
            if quiz_percentages
            else 0
        )

        # ----------------------------------------------------
        # Simulations
        # ----------------------------------------------------

        total_simulations = (
            db.query(Simulation)
            .filter(
                Simulation.disaster_id
                == disaster.id,
                Simulation.is_published.is_(True),
            )
            .count()
        )

        simulation_query = (
            db.query(
                SimulationResponse
            )
            .join(
                User,
                User.id
                == SimulationResponse.user_id,
            )
            .join(
                Simulation,
                Simulation.id
                == SimulationResponse.simulation_id,
            )
            .filter(
                Simulation.disaster_id
                == disaster.id,
                Simulation.is_published.is_(True),
            )
        )

        if institution_id is not None:

            simulation_query = (
                simulation_query.filter(
                    User.institution_id
                    == institution_id
                )
            )

        simulation_responses = (
            simulation_query.count()
        )

        results.append(
            {
                "disaster_id": disaster.id,
                "disaster_name": disaster.name,
                "total_lessons": total_lessons,
                "completed_lessons": (
                    completed_lessons
                ),
                "lesson_completion_percentage": round(
                    lesson_percentage,
                    2,
                ),
                "total_quizzes": total_quizzes,
                "quiz_attempts": len(
                    quiz_attempts
                ),
                "quiz_average_percentage": round(
                    quiz_average,
                    2,
                ),
                "total_simulations": (
                    total_simulations
                ),
                "simulation_responses": (
                    simulation_responses
                ),
            }
        )

    return results


# ============================================================
# Complete Dashboard
# ============================================================

def get_analytics_dashboard(
    db: Session,
    current_user: User,
):

    institution_id = (
        get_institution_filter(
            current_user
        )
    )

    return {
        "users": get_user_analytics(
            db,
            institution_id,
        ),
        "learning": get_learning_analytics(
            db,
            institution_id,
        ),
        "quizzes": get_quiz_analytics(
            db,
            institution_id,
        ),
        "simulations": get_simulation_analytics(
            db,
            institution_id,
        ),
        "disasters": get_disaster_analytics(
            db,
            institution_id,
        ),
    }