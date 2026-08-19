from sqlalchemy.orm import Session

from app.ai.groq_client import generate_response
from app.ai.prompts import SYSTEM_PROMPT

from app.models.disaster import Disaster


def get_disaster_context(
    db: Session,
    message: str,
) -> str:

    disasters = (
        db.query(Disaster)
        .filter(
            Disaster.is_active.is_(True)
        )
        .all()
    )

    if not disasters:
        return ""

    context_parts = []

    for disaster in disasters:

        context_parts.append(
            f"""
DISASTER:
{disaster.name}

DESCRIPTION:
{disaster.description or "Not available"}

PREPAREDNESS GUIDELINES:
{disaster.preparedness_guidelines or "Not available"}

RESPONSE GUIDELINES:
{disaster.response_guidelines or "Not available"}

RECOVERY GUIDELINES:
{disaster.recovery_guidelines or "Not available"}
"""
        )

    return "\n".join(context_parts)


def chat_with_ai(
    db: Session,
    message: str,
) -> str:

    context = get_disaster_context(
        db=db,
        message=message,
    )

    if not context:

        context = (
            "No disaster-management content "
            "is currently available."
        )

    user_prompt = f"""
STUDENT QUESTION:
{message.strip()}

DISASTER MANAGEMENT CONTEXT:
{context}

Answer the student's question using the supplied
context and the system rules.
"""

    return generate_response(
        system_prompt=SYSTEM_PROMPT,
        user_prompt=user_prompt,
    )