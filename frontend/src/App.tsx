import { useEffect, useState } from "react";
import { googleLogout } from "@react-oauth/google";
import GoogleLoginBtn from "./auth/GoogleLoginBtn";
import FileList from "./drive/FileList";
import { loginWithGoogle, fetchUserProfile } from "./api/backend";
import type { UserProfile } from "./types";
import "./App.css";

export default function App() {
  // 🔐 Load session from storage ONCE
  const [sessionId, setSessionId] = useState<string | null>(() =>
    sessionStorage.getItem("session_id")
  );

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  /* ---------------- LOGIN (ONLY ON GOOGLE CALLBACK) ---------------- */

  async function handleGoogleAuth(authCode: string) {
    try {
      const sid = await loginWithGoogle(authCode);

      // ✅ persist session
      sessionStorage.setItem("session_id", sid);
      setSessionId(sid);
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  }

  /* ---------------- LOAD USER FROM SESSION ---------------- */

  useEffect(() => {
    if (!sessionId) return;

    setLoadingUser(true);

    fetchUserProfile(sessionId)
      .then(setUser)
      .catch(() => {
        alert("Session expired. Please login again.");
        logout();
      })
      .finally(() => setLoadingUser(false));
  }, [sessionId]);

  /* ---------------- LOGOUT ---------------- */

  function logout() {
    googleLogout();
    sessionStorage.removeItem("session_id");
    setSessionId(null);
    setUser(null);
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="app-root">
      {/* HEADER */}
      <header className="app-header">
        <div className="header-left">
          <img src="/GoogleDriveFileSummary.png" className="app-logo" />
          <h1 className="app-title">Google Drive File Summarizer</h1>
        </div>

        {user && (
          <div className="user-bar">
            <span className="user-email">
              {user.name} · {user.email}
            </span>
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        )}
      </header>

      {/* MAIN */}
      <main className="main-card">
        {/* LOGIN */}
        {!sessionId && (
          <div className="login-container">
            <h2 className="login-heading">
              Summarize your Google Drive files instantly
            </h2>

            <p className="login-description">
              Securely connect your Google Drive and generate AI summaries.
            </p>

            <div className="login-action">
              <GoogleLoginBtn onAuthCode={handleGoogleAuth} />
            </div>

            <p className="login-note">
              🔒 We only request <strong>read-only</strong> access to your files.
            </p>
          </div>
        )}

        {/* LOADING USER */}
        {sessionId && loadingUser && (
          <div className="hint">Loading your account…</div>
        )}

        {/* APP */}
        {sessionId && user && <FileList sessionId={sessionId} />}
      </main>
    </div>
  );
}
