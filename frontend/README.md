📁 Google Drive File Summarizer — Frontend

A modern React + Vite frontend that connects to Google Drive, lets users browse files & folders, and generate AI-powered summaries securely using a backend session-based API.

✨ Features

🔐 Google OAuth login (secure, session-based)

📂 Browse Google Drive files & folders

🔁 Folder navigation (My Drive → subfolders)

🔍 Search & filter files

⌨️ Keyboard navigation (↑ ↓ Enter)

🧠 AI-powered file summarization

⚡ Frontend caching of summaries (per file)

🏷️ “Cached” badge for instant feedback

🎨 Clean, modern UI (dark theme)

🚪 Logout + session handling

🧱 Tech Stack

React 18

TypeScript

Vite

@react-oauth/google

Axios

Fetch API

CSS (custom, no UI library)

📂 Project Structure
frontend/
├── src/
│   ├── api/            # Backend API wrappers
│   ├── auth/           # Google Login component
│   ├── drive/          # Drive file list + summary UI
│   ├── types.ts        # Shared TypeScript types
│   ├── App.tsx         # App shell + session handling
│   ├── main.tsx        # React entry point
│   └── App.css         # Global & component styles
├── public/
│   ├── GoogleLogin.png
│   └── GoogleDriveFileSummary.png
├── index.html
├── package.json
└── vite.config.ts

✅ Prerequisites

Before running the frontend, make sure you have:

Node.js ≥ 18

npm (or yarn / pnpm)

Backend server running locally (see backend README)

Google OAuth Client ID

🔑 Environment Variables

Create a .env file in the frontend root:

VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id_here


⚠️ This must be the Web OAuth Client ID
Redirect URI should include:

http://localhost:5173

🚀 Setup & Run Locally
1️⃣ Clone the repository
git clone <your-repo-url>
cd <repo-name>/frontend

2️⃣ Install dependencies
npm install


(or)

yarn install

3️⃣ Start the frontend dev server
npm run dev

4️⃣ Open in browser
http://localhost:5173

🔁 Backend Dependency

This frontend expects the backend to be running on:

http://localhost:8000

Required backend APIs:
Method	Endpoint
POST	/auth/login
GET	/auth/me
POST	/drive/files
POST	/drive/summarize

The frontend uses session_id, not auth_code, after login.

🧠 Authentication Flow (Frontend)

User clicks Continue with Google

Google returns auth_code

Frontend calls:

POST /auth/login


Backend returns session_id

Frontend stores session_id in sessionStorage

All future requests use session_id

Logout clears session + Google auth

⌨️ Keyboard Shortcuts
Key	Action
↑ / ↓	Navigate file list
Enter	Summarize selected file
🧪 Development Notes

React StrictMode is enabled

Login is guarded to avoid double session creation

Summarize button is disabled until a file is selected

Folders cannot be summarized

Summaries are cached (max 10 per session)

🛠️ Common Issues
❌ “Session expired” after login

Ensure backend is running

Ensure /auth/login is called only once

Ensure session_id is stored in sessionStorage

❌ Google login popup fails

Check OAuth Client ID

Verify localhost:5173 is allowed in Google Console

📌 Future Improvements

Persist cache across reloads

Breadcrumb click navigation

Virtualized list for large Drives

Batch folder summarization

Dark / light theme toggle

👨‍💻 Author

Built with ❤️ for learning, experimentation, and real-world architecture practice.