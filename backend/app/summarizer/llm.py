from openai import OpenAI
from functools import lru_cache

from app.core.config import settings
from app.summarizer.chunker import chunk_text


def get_openai_client() -> OpenAI:
    if not settings.OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY is not configured")
    return OpenAI(api_key=settings.OPENAI_API_KEY)

# -------------------------------
# 🔹 LLM CALLS (LOW LEVEL)
# -------------------------------
def _summarize_chunk(chunk: str) -> str:
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


def _reduce_summaries(partial_summaries: list[str]) -> str:
    client = get_openai_client()

    combined = "\n".join(partial_summaries)

    final_prompt = f"""
Combine the following summaries into a concise, high-signal summary.

Requirements:
- Use clear bullet points (• or -).
- Include ONLY the most important information.
- Focus on key facts, decisions, findings, and conclusions.
- Avoid repetition, filler, and generic phrasing.
- Total length MUST NOT exceed {settings.MAX_SUMMARY_WORDS} words.

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




@lru_cache(maxsize=128)
def summarize_cached(cache_key: str, text: str) -> str:
    """
    Cached summary.
    cache_key should uniquely identify the file (e.g. file_id + filename)
    """
    chunks = chunk_text(text)
    partial_summaries = [_summarize_chunk(chunk) for chunk in chunks]
    return _reduce_summaries(partial_summaries)

# -------------------------------
# 🔹 PUBLIC API
# -------------------------------

def summarize(text: str, cache_key: str) -> str:
    """
    Public summarization API with caching
    """
    return summarize_cached(cache_key, text)
