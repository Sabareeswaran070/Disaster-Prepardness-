from datetime import datetime

from sqlalchemy.orm import Session, joinedload

from app.models.disaster import Disaster
from app.models.lesson import Lesson
from app.models.question import Question
from app.models.quiz import Quiz
from app.models.quiz_answer import QuizAnswer
from app.models.quiz_attempt import QuizAttempt
from app.models.quiz_option import QuizOption
from app.schemas.quiz import (
    QuestionCreate,
    QuizCreate,
    QuizUpdate,
)


def get_quiz(
    db: Session,
    quiz_id: int,
) -> Quiz | None:

    return (
        db.query(Quiz)
        .options(
            joinedload(Quiz.questions)
            .joinedload(Question.options)
        )
        .filter(
            Quiz.id == quiz_id
        )
        .first()
    )


def get_quizzes(
    db: Session,
    published_only: bool = False,
    disaster_id: int | None = None,
    lesson_id: int | None = None,
):

    query = db.query(Quiz)

    if published_only:
        query = query.filter(
            Quiz.is_published.is_(True)
        )

    if disaster_id is not None:
        query = query.filter(
            Quiz.disaster_id == disaster_id
        )

    if lesson_id is not None:
        query = query.filter(
            Quiz.lesson_id == lesson_id
        )

    return (
        query
        .order_by(Quiz.id.asc())
        .all()
    )


def create_quiz(
    db: Session,
    data: QuizCreate,
) -> Quiz:

    if (
        data.lesson_id is None
        and data.disaster_id is None
    ):
        raise ValueError(
            "Either lesson_id or disaster_id is required"
        )

    if (
        data.lesson_id is not None
        and data.disaster_id is not None
    ):
        raise ValueError(
            "Provide either lesson_id or disaster_id, not both"
        )

    if data.lesson_id is not None:

        lesson = (
            db.query(Lesson)
            .filter(
                Lesson.id == data.lesson_id
            )
            .first()
        )

        if not lesson:
            raise ValueError(
                "Lesson not found"
            )

    if data.disaster_id is not None:

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

    quiz = Quiz(
        lesson_id=data.lesson_id,
        disaster_id=data.disaster_id,
        title=data.title,
        description=data.description,
        passing_score=data.passing_score,
        time_limit_minutes=data.time_limit_minutes,
        is_published=False,
    )

    db.add(quiz)
    db.commit()
    db.refresh(quiz)

    return quiz


def update_quiz(
    db: Session,
    quiz: Quiz,
    data: QuizUpdate,
) -> Quiz:

    updates = data.model_dump(
        exclude_unset=True
    )

    for field, value in updates.items():
        setattr(
            quiz,
            field,
            value
        )

    db.commit()
    db.refresh(quiz)

    return quiz


def publish_quiz(
    db: Session,
    quiz: Quiz,
) -> Quiz:

    question_count = (
        db.query(Question)
        .filter(
            Question.quiz_id == quiz.id
        )
        .count()
    )

    if question_count == 0:
        raise ValueError(
            "Quiz must contain at least one question"
        )

    quiz.is_published = True

    db.commit()
    db.refresh(quiz)

    return quiz


def unpublish_quiz(
    db: Session,
    quiz: Quiz,
) -> Quiz:

    quiz.is_published = False

    db.commit()
    db.refresh(quiz)

    return quiz


def delete_quiz(
    db: Session,
    quiz: Quiz,
) -> None:

    db.delete(quiz)
    db.commit()


def add_question(
    db: Session,
    quiz: Quiz,
    data: QuestionCreate,
) -> Question:

    if quiz.is_published:
        raise ValueError(
            "Cannot modify a published quiz"
        )

    correct_count = sum(
        1
        for option in data.options
        if option.is_correct
    )

    if correct_count != 1:
        raise ValueError(
            "Each question must have exactly one correct option"
        )

    question = Question(
        quiz_id=quiz.id,
        question_text=data.question_text,
        question_order=data.question_order,
        points=data.points,
    )

    db.add(question)
    db.flush()

    for option_data in data.options:

        option = QuizOption(
            question_id=question.id,
            option_text=option_data.option_text,
            option_order=option_data.option_order,
            is_correct=option_data.is_correct,
        )

        db.add(option)

    db.commit()
    db.refresh(question)

    return question


def start_quiz(
    db: Session,
    quiz: Quiz,
    user_id: int,
) -> QuizAttempt:

    if not quiz.is_published:
        raise ValueError(
            "Quiz is not published"
        )

    existing_attempt = (
        db.query(QuizAttempt)
        .filter(
            QuizAttempt.quiz_id == quiz.id,
            QuizAttempt.user_id == user_id,
            QuizAttempt.completed_at.is_(None),
        )
        .first()
    )

    if existing_attempt:
        return existing_attempt

    questions = (
        db.query(Question)
        .filter(
            Question.quiz_id == quiz.id
        )
        .all()
    )

    if not questions:
        raise ValueError(
            "Quiz has no questions"
        )

    total_points = sum(
        question.points
        for question in questions
    )

    attempt = QuizAttempt(
        quiz_id=quiz.id,
        user_id=user_id,
        score=0,
        total_points=total_points,
        passed=False,
    )

    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return attempt


def submit_quiz(
    db: Session,
    attempt: QuizAttempt,
    answers,
) -> dict:

    if attempt.completed_at is not None:
        raise ValueError(
            "Quiz attempt has already been completed"
        )

    questions = (
        db.query(Question)
        .options(
            joinedload(Question.options)
        )
        .filter(
            Question.quiz_id == attempt.quiz_id
        )
        .all()
    )

    question_map = {
        question.id: question
        for question in questions
    }

    score = 0

    for answer in answers:

        question = question_map.get(
            answer.question_id
        )

        if not question:
            raise ValueError(
                f"Question {answer.question_id} does not belong to this quiz"
            )

        selected_option = None

        if answer.selected_option_id is not None:

            selected_option = (
                db.query(QuizOption)
                .filter(
                    QuizOption.id
                    == answer.selected_option_id,
                    QuizOption.question_id
                    == question.id,
                )
                .first()
            )

            if not selected_option:
                raise ValueError(
                    "Selected option does not belong to the question"
                )

        is_correct = (
            selected_option is not None
            and selected_option.is_correct
        )

        points = (
            question.points
            if is_correct
            else 0
        )

        score += points

        quiz_answer = QuizAnswer(
            attempt_id=attempt.id,
            question_id=question.id,
            selected_option_id=(
                selected_option.id
                if selected_option
                else None
            ),
            is_correct=is_correct,
            points_earned=points,
        )

        db.add(quiz_answer)

    attempt.score = score

    percentage = (
        (score / attempt.total_points) * 100
        if attempt.total_points > 0
        else 0
    )

    quiz = (
        db.query(Quiz)
        .filter(
            Quiz.id == attempt.quiz_id
        )
        .first()
    )

    attempt.passed = (
        percentage >= quiz.passing_score
    )

    attempt.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(attempt)

    return {
        "attempt": attempt,
        "percentage": round(
            percentage,
            2
        ),
    }