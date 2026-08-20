from groq import Groq

from app.core.config import settings


client = Groq(
    api_key=settings.GROQ_API_KEY
)


def generate_response(
    system_prompt: str,
    user_prompt: str,
    json_mode: bool = False,
) -> str:

    request = {
        "model": settings.GROQ_MODEL,
        "messages": [
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": user_prompt,
            },
        ],
        "temperature": 0.2,
        "max_tokens": 2000,
    }

    if json_mode:

        request["response_format"] = {
            "type": "json_object"
        }

    response = client.chat.completions.create(
        **request
    )

    content = response.choices[0].message.content

    if not content:
        raise ValueError(
            "Groq returned an empty response"
        )

    return content.strip()