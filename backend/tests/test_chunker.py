from app.summarizer.chunker import chunk_text


def test_chunk_text_basic():
    text = "a" * 5000
    chunks = chunk_text(text, chunk_size=2000, overlap=200)

    assert len(chunks) > 1
    assert all(len(c) <= 2000 for c in chunks)


def test_chunk_text_overlap():
    text = "abcdefghijklmnopqrstuvwxyz" * 200
    chunks = chunk_text(text, chunk_size=1000, overlap=100)

    assert chunks[1][:100] == chunks[0][-100:]


def test_chunk_text_small_input():
    text = "short text"
    chunks = chunk_text(text)

    assert chunks == [text]
