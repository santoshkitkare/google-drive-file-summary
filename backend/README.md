# Google Drive File Summarizer – Backend

This project is a **FastAPI-based backend service** that allows users to:

- Authenticate using **Google OAuth**
- Browse Google Drive **folder-wise** (root folders & files)
- Select a file (PDF / DOCX / TXT / Google Doc)
- Generate an **AI-powered summary** using an LLM
- Cache summaries to reduce repeated LLM calls

The backend is designed for **local development first**, with clean architecture and production-ready patterns.

---

## 🚀 Features

- Google OAuth 2.0 login (Drive Read-only access)
- Folder-wise Google Drive browsing (not “Recent files”)
- File summarization using LLM (map-reduce style)
- In-memory caching for summaries (cost & latency optimized)
- Clean API contracts (JSON-based)
- Linting with Ruff
- Unit tests with pytest

---

## 🧱 Tech Stack

- **Python** 3.11+
- **FastAPI**
- **Google Drive API**
- **OpenAI API**
- **pytest**
- **Ruff**
- **uv** (fast Python package manager & environment)

---

## 📂 Project Structure
```
backend/
├── app/
│ ├── api/ # FastAPI routes
│ ├── auth/ # Google OAuth logic
│ ├── core/ # Config, settings
│ ├── drive/ # Google Drive client
│ ├── reader/ # PDF / DOCX / TXT readers
│ ├── summarizer/ # Chunking, LLM, caching
│ └── main.py # FastAPI app entry
│
├── tests/ # Unit tests
├── pyproject.toml # Dependencies & tooling
├── credentials.json # Google OAuth credentials (NOT committed)
└── README.md
```

---

## 🔑 Prerequisites

Before you begin, make sure you have:

- Python **3.11 or higher**
- A Google Cloud account
- An OpenAI API key
- Git installed

## INSTALL uv (ONE-TIME)

### Windows:
```
    pip install uv
```

### Verify:
```
    uv --version
```

## 🔐 Google OAuth Setup (Required)

### 1️⃣ Create Google OAuth Credentials

1. Go to **Google Cloud Console**
2. Create or select a project
3. Navigate to: APIs & Services → Credentials
4. Create **OAuth Client ID**
- Application type: **Web**
- Authorized redirect URI:
  ```
  http://localhost
  ```

5. Download the credentials file

---

### 2️⃣ Add `credentials.json`

Place the downloaded file here:
backend/credentials.json

⚠️ **Do NOT commit this file to GitHub**

---

### 3️⃣ OAuth Consent Screen

- User type: **External**
- Scopes:
  - `openid`
  - `userinfo.email`
  - `userinfo.profile`
  - `drive.readonly`
- Publish the app to allow **all Google accounts** to log in

---

## 🔑 OpenAI API Key Setup

Create a `.env` file in the `backend/` folder:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=openai_model_name default: gpt-4o-mini
```

## 📥 Code Checkout
```
git clone <your-github-repo-url>
cd google-drive-file-summary/backend
```

## 🐍 Create Virtual Environment(uv)
1) Create virtual environment
```
    uv venv
```
This creates a .venv/ directory automatically.

2) Activate environment
```
    .venv\Scripts\activate
```

3) Install dependencies from pyproject.toml

Recommended:
```
    uv sync
```

## ▶️ Run the Backend Locally
```
uvicorn app.main:application --reload
```


You should see:
```
Uvicorn running on http://127.0.0.1:8000
```

## 📚 API Endpoints (Overview)
### 🔐 Authentication
* POST /auth/login
* GET /auth/me

### 📂 Google Drive
* POST /drive/files
    - Lists root folders & files
    - Supports folder_id for navigation

### 📝 Summarization
* POST /drive/summarize
    - Accepts JSON payload
    - Returns cached or freshly generated summary

## 🧪 Run Tests
```
pytest
```

### Expected output:

All tests passed

## 🧹 Run Linting
```
ruff check .
```
(Optional auto-fix)
```
ruff check . --fix
```

## ⚠️ Notes & Limitations

- Caching is in-memory
- Resets on server restart
- Suitable for local dev & single-instance setups

## For production:
- Replace cache with Redis
- Secure secrets properly
- Add token refresh & logout

## 🚀 Future Enhancements
- Redis-based cache
- Async background summarization
- Pagination for large drives
- Breadcrumb navigation
- Deployment to AWS / GCP

## 📄 License

MIT License (or update as needed)