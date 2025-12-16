from app.summarizer import llm
from app.summarizer.llm import summarize


def mock_llm_response(text: str) -> str:
    return f"summary({text[:10]})"


def test_summarize_map_reduce(mocker):
    mocker.patch.object(
        llm,
        "_summarize_chunk",
        side_effect=mock_llm_response,
    )

    mocker.patch.object(
        llm,
        "_reduce_summaries",
        return_value="final summary",
    )

    text = "A" * 5000
    result = summarize(text, cache_key="test-file-123")

    assert result == "final summary"
