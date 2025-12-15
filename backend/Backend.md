no📄 Google Drive File Summarizer (FastAPI + LLM)

A production-lean backend service that securely connects to a user’s Google Drive, extracts document content, and generates high-quality summaries using an LLM.
Built with FastAPI, Google OAuth, chunked map-reduce summarization, and Docker.

🚀 Features

🔐 Google OAuth 2.0 authentication

📁 User-scoped Google Drive access (read-only)

📄 Supports:

PDF

DOCX

TXT

Google Docs (exported as text)

🧠 Chunked map-reduce summarization for large documents

⚡ Rate limiting to prevent abuse & control cost

🧹 Static code analysis with Ruff + cyclomatic complexity limits

🧪 Unit tests with proper mocking (no external calls)

🐳 Dockerized for reproducible local setup

📊 Interactive API testing via Swagger UI

🧱 High-Level Architecture
Client (Swagger / Frontend)
        |
        v
FastAPI Backend
  ├── Google OAuth (auth code → token)
  ├── Google Drive API (list & download files)
  ├── File Readers (PDF / DOCX / TXT / Docs)
  ├── Chunker (large document handling)
  ├── LLM Summarizer (map-reduce)
  └── Rate Limiter

🔐 Authentication Model

Uses Google OAuth 2.0 Authorization Code Flow

User explicitly consents to Drive access

Access is limited to the user’s own files

Scope used:

https://www.googleapis.com/auth/drive.readonly


No domain restriction is enforced — any Google account (personal or Workspace) can authenticate.

📂 Supported File Types
File Type	Handling
TXT	Direct read
PDF	Extracted using pypdf
DOCX	Parsed using python-docx
Google Docs	Exported as text/plain

❌ Scanned PDFs (OCR not enabled)
❌ Sheets / Slides (out of scope)

🧠 Summarization Strategy

To handle large documents safely and accurately:

Chunking

Split text into overlapping chunks

Map step

Summarize each chunk independently

Reduce step

Combine partial summaries into a final ≤ 300-word summary

This avoids context overflow and improves consistency.

⚙️ API Endpoints
🔹 List Google Drive Files
POST /drive/files?auth_code=AUTH_CODE


Returns a list of supported files from the user’s Drive.

🔹 Summarize Text
POST /summarize?content=TEXT


Returns a summarized version of the provided text.

🧪 Testing Strategy

Unit tests only (no external services)

External dependencies (OpenAI, Google APIs) are mocked

Focus on:

Chunking logic

Map-reduce orchestration

Error-free execution

Run tests:

pytest -v

🧹 Code Quality & Static Analysis

Ruff for linting and formatting

Cyclomatic complexity enforced (max-complexity = 10)

Prepares codebase for long-term maintainability

Run locally:

ruff check .
ruff format .

🐳 Local Setup (Docker – Recommended)
1️⃣ Prerequisites

Docker + Docker Compose

Google OAuth credentials.json

OpenAI API key

2️⃣ Environment Variables

Create .env from example:

OPENAI_API_KEY=your_openai_key_here

3️⃣ Run the Service
docker compose up --build


Backend will be available at:

http://localhost:8000


Swagger UI:

http://localhost:8000/docs

🔑 Google OAuth Setup (One-Time)

Create a Google Cloud project

Enable Google Drive API

Create OAuth Client ID

Type: Web or Desktop

Download credentials.json

Place it in the project root

The file is mounted into the container securely.

⚠️ Known Limitations

OAuth auth code is short-lived and single-use

No OCR for scanned PDFs

In-memory rate limiting (Redis recommended for production)

Synchronous summarization (async workers can be added)

🔮 Future Improvements

One-click endpoint: /drive/summarize/{file_id}

React + Vite frontend

Async background jobs

Redis-based rate limiting

OCR support for scanned PDFs

Multi-provider support (OneDrive, Dropbox)

🧠 Why This Project Matters

This project demonstrates:

Secure OAuth handling

Real-world Google API integration

Practical LLM engineering (chunking, map-reduce)

Testable and maintainable backend design

Production hygiene (rate limits, Docker, linting)

👤 Author

Built with ❤️ as a production-lean backend case study.