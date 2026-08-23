from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.learning_progress import LearningProgress
from app.models.lesson import Lesson
from app.models.quiz import Quiz
from app.models.quiz_attempt import QuizAttempt
from app.models.simulation import Simulation
from app.models.simulation_response import SimulationResponse
from app.models.simulation_scenario import SimulationScenario


# ============================================================
# Lesson Progress
# ============================================================

def get_lesson_progress(
    db: Session,
    user_id: int,
):

    rows = (
        db.query(
            LearningProgress,
            Lesson.title,
        )
        .join(
            Lesson,
            Lesson.id == LearningProgress.lesson_id,
        )
        .filter(
            LearningProgress.user_id == user_id,
        )
        .order_by(
            Lesson.id.asc()
        )
        .all()
    )

    return [
        {
            "lesson_id": progress.lesson_id,
            "lesson_title": title,
            "status": progress.status,
            "progress_percentage": (
                progress.progress_percentage
            ),
            "completed_at": progress.completed_at,
        }
        for progress, title in rows
    ]


# ============================================================
# Update Lesson Progress
# ============================================================

def update_lesson_progress(
    db: Session,
    user_id: int,
    lesson_id: int,
    progress_percentage: int,
    status: str,
):

    lesson = (
        db.query(Lesson)
        .filter(
            Lesson.id == lesson_id,
            Lesson.is_published.is_(True),
        )
        .first()
    )

    if not lesson:
        raise ValueError(
            "Published lesson not found"
        )

    if progress_percentage < 0:
        raise ValueError(
            "Progress percentage cannot be below 0"
        )

    if progress_percentage > 100:
        raise ValueError(
            "Progress percentage cannot exceed 100"
        )

    allowed_statuses = {
        "NOT_STARTED",
        "IN_PROGRESS",
        "COMPLETED",
    }

    if status not in allowed_statuses:
        raise ValueError(
            "Invalid lesson progress status"
        )

    progress = (
        db.query(LearningProgress)
        .filter(
            LearningProgress.user_id == user_id,
            LearningProgress.lesson_id == lesson_id,
        )
        .first()
    )

    if not progress:

        progress = LearningProgress(
            user_id=user_id,
            lesson_id=lesson_id,
            status=status,
            progress_percentage=progress_percentage,
        )

        db.add(progress)

    else:

        progress.status = status

        progress.progress_percentage = (
            progress_percentage
        )

    if status == "COMPLETED":

        from datetime import datetime

        progress.progress_percentage = 100
        progress.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(progress)

    return progress


# ============================================================
# Quiz Progress
# ============================================================

def get_quiz_progress(
    db: Session,
    user_id: int,
):

    quizzes = (
        db.query(Quiz)
        .filter(
            Quiz.is_published.is_(True)
        )
        .order_by(
            Quiz.id.asc()
        )
        .all()
    )

    results = []

    for quiz in quizzes:

        attempts = (
            db.query(QuizAttempt)
            .filter(
                QuizAttempt.quiz_id == quiz.id,
                QuizAttempt.user_id == user_id,
                QuizAttempt.completed_at.is_not(None),
            )
            .order_by(
                QuizAttempt.score.desc()
            )
            .all()
        )

        if not attempts:

            results.append(
                {
                    "quiz_id": quiz.id,
                    "quiz_title": quiz.title,
                    "attempts": 0,
                    "best_score": 0,
                    "total_points": 0,
                    "best_percentage": 0.0,
                    "passed": False,
                }
            )

            continue

        best_attempt = attempts[0]

        percentage = (
            (
                best_attempt.score
                / best_attempt.total_points
            ) * 100
            if best_attempt.total_points > 0
            else 0
        )

        results.append(
            {
                "quiz_id": quiz.id,
                "quiz_title": quiz.title,
                "attempts": len(attempts),
                "best_score": best_attempt.score,
                "total_points": (
                    best_attempt.total_points
                ),
                "best_percentage": round(
                    percentage,
                    2,
                ),
                "passed": any(
                    attempt.passed
                    for attempt in attempts
                ),
            }
        )

    return results


# ============================================================
# Simulation Progress
# ============================================================

def get_simulation_progress(
    db: Session,
    user_id: int,
):

    simulations = (
        db.query(Simulation)
        .filter(
            Simulation.is_published.is_(True)
        )
        .order_by(
            Simulation.id.asc()
        )
        .all()
    )

    results = []

    for simulation in simulations:

        responses = (
            db.query(
                SimulationResponse
            )
            .filter(
                SimulationResponse.simulation_id
                == simulation.id,
                SimulationResponse.user_id
                == user_id,
            )
            .all()
        )

        scenarios = (
            db.query(
                SimulationScenario
            )
            .filter(
                SimulationScenario.simulation_id
                == simulation.id
            )
            .all()
        )

        max_score = sum(
            scenario.points
            for scenario in scenarios
        )

        score = sum(
            response.points_earned
            for response in responses
        )

        scenarios_answered = len(
            responses
        )

        completed = (
            len(responses)
            == len(scenarios)
            and len(scenarios) > 0
        )

        percentage = (
            (score / max_score) * 100
            if max_score > 0
            else 0
        )

        results.append(
            {
                "simulation_id": simulation.id,
                "simulation_title": simulation.title,
                "scenarios_answered": (
                    scenarios_answered
                ),
                "score": score,
                "max_score": max_score,
                "percentage": round(
                    percentage,
                    2,
                ),
                "completed": completed,
            }
        )

    return results


# ============================================================
# Student Dashboard
# ============================================================

def get_student_dashboard(
    db: Session,
    user_id: int,
):

    # --------------------------------------------------------
    # Lessons
    # --------------------------------------------------------

    total_lessons = (
        db.query(Lesson)
        .filter(
            Lesson.is_published.is_(True)
        )
        .count()
    )

    completed_lessons = (
        db.query(LearningProgress)
        .join(
            Lesson,
            Lesson.id
            == LearningProgress.lesson_id,
        )
        .filter(
            LearningProgress.user_id == user_id,
            LearningProgress.status
            == "COMPLETED",
            Lesson.is_published.is_(True),
        )
        .count()
    )

    lesson_percentage = (
        (
            completed_lessons
            / total_lessons
        ) * 100
        if total_lessons > 0
        else 0
    )

    # --------------------------------------------------------
    # Quizzes
    # --------------------------------------------------------

    total_quizzes = (
        db.query(Quiz)
        .filter(
            Quiz.is_published.is_(True)
        )
        .count()
    )

    completed_quizzes = (
        db.query(QuizAttempt)
        .join(
            Quiz,
            Quiz.id
            == QuizAttempt.quiz_id,
        )
        .filter(
            QuizAttempt.user_id == user_id,
            QuizAttempt.completed_at.is_not(None),
            Quiz.is_published.is_(True),
        )
        .distinct(
            QuizAttempt.quiz_id
        )
        .count()
    )

    quiz_attempts = (
        db.query(QuizAttempt)
        .join(
            Quiz,
            Quiz.id
            == QuizAttempt.quiz_id,
        )
        .filter(
            QuizAttempt.user_id == user_id,
            QuizAttempt.completed_at.is_not(None),
            Quiz.is_published.is_(True),
        )
        .all()
    )

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

    quizzes_passed = (
        db.query(QuizAttempt)
        .join(
            Quiz,
            Quiz.id
            == QuizAttempt.quiz_id,
        )
        .filter(
            QuizAttempt.user_id == user_id,
            QuizAttempt.completed_at.is_not(None),
            QuizAttempt.passed.is_(True),
            Quiz.is_published.is_(True),
        )
        .count()
    )

    # --------------------------------------------------------
    # Simulations
    # --------------------------------------------------------

    total_simulations = (
        db.query(Simulation)
        .filter(
            Simulation.is_published.is_(True)
        )
        .count()
    )

    simulations = get_simulation_progress(
        db,
        user_id,
    )

    completed_simulations = sum(
        1
        for simulation in simulations
        if simulation["completed"]
    )

    simulation_percentages = [
        simulation["percentage"]
        for simulation in simulations
        if simulation["completed"]
    ]

    simulation_average = (
        sum(simulation_percentages)
        / len(simulation_percentages)
        if simulation_percentages
        else 0
    )

    # --------------------------------------------------------
    # Overall Preparedness
    # --------------------------------------------------------

    components = [
        lesson_percentage,
        quiz_average,
        simulation_average,
    ]

    overall = (
        sum(components)
        / len(components)
        if components
        else 0
    )

    return {
        "total_lessons": total_lessons,
        "completed_lessons": completed_lessons,
        "lesson_completion_percentage": round(
            lesson_percentage,
            2,
        ),
        "total_quizzes": total_quizzes,
        "completed_quizzes": completed_quizzes,
        "quiz_average_percentage": round(
            quiz_average,
            2,
        ),
        "quizzes_passed": quizzes_passed,
        "total_simulations": total_simulations,
        "completed_simulations": (
            completed_simulations
        ),
        "simulation_average_percentage": round(
            simulation_average,
            2,
        ),
        "overall_preparedness_percentage": round(
            overall,
            2,
        ),
    }