import { useEffect, useState } from "react";
import axios from "axios";
import type { DriveFile } from "../types";

const API_BASE = "http://localhost:8000";

export default function FileList({ sessionId }: { sessionId: string }) {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
  const [summary, setSummary] = useState("");
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  /* ---------------- FETCH FILE LIST ---------------- */

  useEffect(() => {
    fetchFiles();
  }, []);

  async function fetchFiles() {
    setLoadingFiles(true);
    try {
      const res = await axios.post(
        `${API_BASE}/drive/files`,
        null,
        { params: { session_id: sessionId } }
      );
      setFiles(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load Drive files");
    } finally {
      setLoadingFiles(false);
    }
  }

  /* ---------------- SUMMARIZE (UPDATED CONTRACT) ---------------- */

  async function summarizeSelectedFile() {
    if (!selectedFile) return;

    setLoadingSummary(true);
    setSummary("");

    try {
      const response = await fetch(`${API_BASE}/drive/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,        // ✅ BODY, not query
          file_id: selectedFile.id,
          filename: selectedFile.name,  // ✅ backend expects filename
          mime_type: selectedFile.mimeType,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Summarization failed");
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to summarize file");
    } finally {
      setLoadingSummary(false);
    }
  }

  /* ---------------- UI ---------------- */

  return (
    <>
      <div className="file-list-container">
        {loadingFiles && <div className="hint">Loading files…</div>}

        {!loadingFiles &&
          files.map((file) => (
            <div
              key={file.id}
              className={`file-item ${
                selectedFile?.id === file.id ? "selected" : ""
              }`}
              onClick={() => {
                setSelectedFile(file);
                setSummary("");
              }}
            >
              <div className="file-name">{file.name}</div>
              <div className="file-type">{file.mimeType}</div>
            </div>
          ))}
      </div>

      <div className="action-bar">
        <button
          className="primary-btn"
          disabled={!selectedFile || loadingSummary}
          onClick={summarizeSelectedFile}
        >
          {loadingSummary ? "Summarizing…" : "Summarize Selected File"}
        </button>
      </div>

      {summary && (
        <div className="summary-box">
          <h3>Summary</h3>
          <p>{summary}</p>
        </div>
      )}
    </>
  );
}
