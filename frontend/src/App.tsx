import { useState } from "react";
import GoogleLoginBtn from "./auth/GoogleLoginBtn";
import FileList from "./drive/FileList";
import "./App.css";

export default function App() {
  const [authCode, setAuthCode] = useState<string | null>(null);

  return (
    <div className="app-root">
      {/* HEADER */}
      <header className="app-header">
        <img src="/GoogleDriveFileSummary.png" className="app-logo" />
        <h1 className="app-title">Google Drive File Summarizer</h1>
      </header>

      {/* MAIN CONTENT */}
      <main className="main-card">
        {!authCode && (
          <div className="login-container">
            <h2 className="login-heading">
              Summarize your Google Drive files instantly
            </h2>

            <p className="login-description">
              Securely connect your Google Drive and generate high-quality AI
              summaries for PDFs, Word documents, and Google Docs — all in one
              click.
            </p>

            <div className="login-action">
              <GoogleLoginBtn onAuthCode={setAuthCode} />
            </div>

            <p className="login-note">
              We only request read-only access to your files.
            </p>
          </div>
        )}

        {authCode && <FileList authCode={authCode} />}
      </main>
    </div>
  );
}
