<p align="center">
  <img src="assets/banner.png" alt="Google Drive File Summarizer" width="100%" />
</p>
# 🚀 Google Drive File Summarizer

An end-to-end application that securely connects to Google Drive, lets users browse files and folders, and generates AI-powered summaries — built with a React frontend and a FastAPI backend using Google OAuth.

## 🧭 Repository Overview

This repository is organized into two independent applications:
```
google-drive-file-summary/
├── backend/     # FastAPI backend (OAuth, Drive API, summarization)
├── frontend/    # React + Vite frontend (UI, session handling)
└── README.md    # ← You are here
```


Each part has its own README with detailed setup and run instructions.

## 🧱 High-Level Architecture
```
Browser (React)
   │
   │  Google OAuth (auth code)
   ▼
Frontend (Vite + React)
   │
   │  session_id-based API calls
   ▼
Backend (FastAPI)
   │
   ├── Google OAuth Token Exchange
   ├── Google Drive Files / Folders
   └── AI Summarization Service
```

- Frontend handles UI, UX, caching, keyboard navigation
- Backend handles OAuth, sessions, Drive API, summarization
- auth_code is used only once
- All subsequent calls use a secure session_id

## ✨ Key Features

- 🔐 Secure Google OAuth login
- 📂 Browse Google Drive files & folders
- 🔁 Folder navigation (My Drive → subfolders)
- 🔍 Search & filter files
- ⌨️ Keyboard navigation (↑ ↓ Enter)
- 🧠 AI-powered summaries
- ⚡ Frontend summary caching
- 🏷️ Cached indicator in UI
- 🚪 Logout + session handling

## 📌 Getting Started (Recommended Order)
### 1️⃣ Backend Setup (Required First)

The backend provides:
- OAuth login
- Google Drive access
- Session management
- Summarization APIs

### ➡️ Go to backend setup instructions:
👉 backend/README.md

### 2️⃣ Frontend Setup
The frontend provides:
- Google login UI
- Drive file & folder browser
- Summary rendering
- UX features (search, cache, keyboard)

### ➡️ Go to frontend setup instructions:

👉 frontend/README.md

## 🔑 Environment Requirements (Summary)
| Component | Requirement                       |
| --------- | --------------------------------- |
| Backend   | Python 3.10+                      |
| Frontend  | Node.js 18+                       |
| Auth      | Google OAuth Client ID            |
| Ports     | Backend: `8000`, Frontend: `5173` |

## 🔁 How the System Works (Quick Flow)
1. User logs in via Google (Frontend)
2. Backend exchanges auth code → creates session
3. Frontend stores session_id
4. User browses Drive files/folders
5. User selects file → requests summary
6. Backend returns AI-generated summary
7. Frontend formats & displays result

## 🧪 Development Notes
- Frontend and backend can be run independently
- No database required (session stored in-memory)
- Designed for local development & learning
- Architecture mirrors real-world production patterns

## 🛣️ Roadmap / Ideas
- Redis-backed sessions
- Persistent summary cache
- Batch folder summarization
- Breadcrumb navigation
- Production deployment (Docker / Cloud)

## 👨‍💻 Maintainer

Built for hands-on learning, clean architecture, and real-world system design practice.
