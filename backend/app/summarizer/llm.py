from openai import OpenAI

from app.core.config import settings
from app.summarizer.chunker import chunk_text


def get_openai_client() -> OpenAI:
    if not settings.OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY is not configured")
    return OpenAI(api_key=settings.OPENAI_API_KEY)


def summarize_chunk(chunk: str) -> str:
    client = get_openai_client()

    prompt = f"""
Summarize the following text concisely.
Focus on key points and factual accuracy.

TEXT:
{chunk}
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a precise summarization assistant."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.3,
    )

    return response.choices[0].message.content.strip()


def reduce_summaries(partial_summaries: list[str]) -> str:
    client = get_openai_client()

    combined = "\n".join(partial_summaries)

    final_prompt = f"""
Combine the following summaries into a single coherent summary
of no more than {settings.MAX_SUMMARY_WORDS} words.

SUMMARIES:
{combined}
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a senior technical writer."},
            {"role": "user", "content": final_prompt},
        ],
        temperature=0.3,
    )

    return response.choices[0].message.content.strip()


def summarize(text: str) -> str:
    chunks = chunk_text(text)
    partial_summaries = [summarize_chunk(chunk) for chunk in chunks]
    return reduce_summaries(partial_summaries)
