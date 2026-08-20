import json

from sqlalchemy.orm import Session

from app.ai.groq_client import generate_response

from app.ai.prompts import (
    SYSTEM_PROMPT,
    QUIZ_GENERATION_PROMPT,
)

from app.models.disaster import Disaster
from app.models.lesson import Lesson
from app.models.quiz import Quiz

from app.schemas.ai import (
    AIGeneratedQuestion,
)
from app.schemas.quiz import (
    QuestionCreate,
    QuizCreate,
    QuizOptionCreate,
)
from app.services.quiz_service import (
    add_question,
    create_quiz,
)

def extract_json(
    response: str,
) -> dict:

    response = response.strip()

    # Remove Markdown JSON fences
    if response.startswith("```"):

        lines = response.splitlines()

        if lines:
            lines = lines[1:]

        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]

        response = "\n".join(lines).strip()

    # Try direct JSON first
    try:

        return json.loads(response)

    except json.JSONDecodeError:
        pass

    # Try to find JSON object inside extra text
    start = response.find("{")
    end = response.rfind("}")

    if start == -1 or end == -1 or end <= start:

        raise ValueError(
            "AI returned invalid JSON"
        )

    json_text = response[
        start:end + 1
    ]

    try:

        return json.loads(
            json_text
        )

    except json.JSONDecodeError:

        raise ValueError(
            "AI returned invalid JSON"
        )

# ============================================================
# Find Relevant Disaster
# ============================================================

def find_relevant_disaster(
    db: Session,
    message: str,
) -> Disaster | None:

    disasters = (
        db.query(Disaster)
        .filter(
            Disaster.is_active.is_(True)
        )
        .all()
    )

    message_lower = message.casefold()

    for disaster in disasters:

        if disaster.name.casefold() in message_lower:
            return disaster

    message_words = set(
        message_lower
        .replace(",", " ")
        .replace(".", " ")
        .split()
    )

    best_disaster = None
    best_score = 0

    for disaster in disasters:

        disaster_words = set(
            disaster.name.casefold().split()
        )

        score = len(
            message_words.intersection(
                disaster_words
            )
        )

        if score > best_score:
            best_score = score
            best_disaster = disaster

    return best_disaster


# ============================================================
# Build Disaster Context
# ============================================================

def build_disaster_context(
    db: Session,
    disaster: Disaster,
) -> str:

    context = f"""
DISASTER
Name: {disaster.name}

Description:
{disaster.description or "Not available"}

Preparedness Guidelines:
{disaster.preparedness_guidelines or "Not available"}

Response Guidelines:
{disaster.response_guidelines or "Not available"}

Recovery Guidelines:
{disaster.recovery_guidelines or "Not available"}
"""

    lessons = (
        db.query(Lesson)
        .filter(
            Lesson.disaster_id == disaster.id,
            Lesson.is_published.is_(True),
        )
        .order_by(
            Lesson.id.asc()
        )
        .all()
    )

    if lessons:

        context += "\n\nPUBLISHED LESSONS:\n"

        for lesson in lessons:

            context += f"""
Lesson:
{lesson.title}

Description:
{lesson.description or "Not available"}

Content:
{lesson.content or "Not available"}

---
"""

    return context


# ============================================================
# AI Chat
# ============================================================

def chat_with_ai(
    db: Session,
    message: str,
) -> str:

    disaster = find_relevant_disaster(
        db=db,
        message=message,
    )

    if not disaster:

        return (
            "I could not identify a specific disaster "
            "from your question. Please mention the "
            "disaster you are asking about."
        )

    context = build_disaster_context(
        db=db,
        disaster=disaster,
    )

    user_prompt = f"""
STUDENT QUESTION:
{message.strip()}

RELEVANT DISASTER:
{disaster.name}

EDUCATIONAL CONTEXT:
{context}

Answer the student's question using the supplied
educational context and the system rules.
"""

    return generate_response(
        system_prompt=SYSTEM_PROMPT,
        user_prompt=user_prompt,
    )


# ============================================================
# AI Quiz Generation
# ============================================================

def generate_quiz_from_lesson(
    db: Session,
    lesson_id: int,
    number_of_questions: int,
) -> dict:

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

    if not lesson.content:

        raise ValueError(
            "Lesson does not contain content"
        )

    user_prompt = f"""
Generate exactly {number_of_questions}
multiple-choice questions from this lesson.

LESSON TITLE:
{lesson.title}

LESSON DESCRIPTION:
{lesson.description or "Not available"}

LESSON CONTENT:
{lesson.content}
"""

    raw_response = generate_response(
        system_prompt=QUIZ_GENERATION_PROMPT,
        user_prompt=user_prompt,
        json_mode=True,
    )

    try:

        parsed = extract_json(
            raw_response
        )

    except json.JSONDecodeError:

        raise ValueError(
            "AI returned invalid JSON"
        )

    questions_data = parsed.get(
        "questions"
    )

    if not isinstance(
        questions_data,
        list,
    ):

        raise ValueError(
            "AI response does not contain questions"
        )

    if len(questions_data) != number_of_questions:

        raise ValueError(
            "AI generated an incorrect number of questions"
        )

    validated_questions = []

    for index, question_data in enumerate(
        questions_data,
        start=1,
    ):

        question_data[
            "question_order"
        ] = index

        question = (
            AIGeneratedQuestion.model_validate(
                question_data
            )
        )

        correct_count = sum(
            1
            for option in question.options
            if option.is_correct
        )

        if correct_count != 1:

            raise ValueError(
                f"Question {index} must have exactly "
                "one correct option"
            )

        if len(question.options) != 4:

            raise ValueError(
                f"Question {index} must have exactly "
                "four options"
            )

        validated_questions.append(
            question
        )

    return {
        "lesson_id": lesson.id,
        "lesson_title": lesson.title,
        "questions": validated_questions,
    }

# ============================================================
# Save Reviewed AI Quiz
# ============================================================

def save_ai_quiz(
    db: Session,
    lesson_id: int,
    title: str,
    description: str | None,
    passing_score: int,
    time_limit_minutes: int | None,
    questions,
) -> dict:

    # --------------------------------------------------------
    # Validate lesson
    # --------------------------------------------------------

    lesson = (
        db.query(Lesson)
        .filter(
            Lesson.id == lesson_id
        )
        .first()
    )

    if not lesson:
        raise ValueError(
            "Lesson not found"
        )

    # --------------------------------------------------------
    # Create unpublished quiz
    # --------------------------------------------------------

    quiz_data = QuizCreate(
        lesson_id=lesson_id,
        disaster_id=None,
        title=title,
        description=description,
        passing_score=passing_score,
        time_limit_minutes=time_limit_minutes,
    )

    quiz = create_quiz(
        db=db,
        data=quiz_data,
    )

    # --------------------------------------------------------
    # Add reviewed questions
    # --------------------------------------------------------

    try:

        for index, question in enumerate(
            questions,
            start=1,
        ):

            options = []

            for option in question.options:

                options.append(
                    QuizOptionCreate(
                        option_text=option.option_text,
                        option_order=option.option_order,
                        is_correct=option.is_correct,
                    )
                )

            question_data = QuestionCreate(
                question_text=question.question_text,
                question_order=index,
                points=question.points,
                options=options,
            )

            add_question(
                db=db,
                quiz=quiz,
                data=question_data,
            )

    except Exception:

        db.rollback()

        # Delete partially created quiz
        quiz_to_delete = (
            db.query(Quiz)
            .filter(
                Quiz.id == quiz.id
            )
            .first()
        )

        if quiz_to_delete:
            db.delete(
                quiz_to_delete
            )
            db.commit()

        raise

    return {
        "quiz_id": quiz.id,
        "lesson_id": lesson_id,
        "title": quiz.title,
        "question_count": len(
            questions
        ),
        "is_published": False,
    }