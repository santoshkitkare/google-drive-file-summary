import { useEffect, useState } from "react";
import axios from "axios";
import type { DriveFile } from "../types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const API_BASE = "http://localhost:8000";

/* ---------------- FILE ICONS ---------------- */

const PdfIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#ef4444">
    <path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
  </svg>
);

const DocIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#3b82f6">
    <path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
  </svg>
);

const TextIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#22c55e">
    <path d="M4 4h16v2H4zm0 6h16v2H4zm0 6h10v2H4z" />
  </svg>
);

function getFileIcon(mime: string) {
  if (mime.includes("pdf")) return <PdfIcon />;
  if (mime.includes("word")) return <DocIcon />;
  if (mime.includes("google-apps.document")) return <DocIcon />;
  return <TextIcon />;
}

/* ---------------- COMPONENT ---------------- */

export default function FileList({ sessionId }: { sessionId: string }) {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
  const [summary, setSummary] = useState("");
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  /* ---------------- FETCH FILES ---------------- */

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
    } catch {
      alert("Failed to load Drive files");
    } finally {
      setLoadingFiles(false);
    }
  }

  /* ---------------- SUMMARIZE ---------------- */

  async function summarizeSelectedFile() {
    if (!selectedFile) return;

    setLoadingSummary(true);
    setSummary("");

    try {
      const response = await fetch(`${API_BASE}/drive/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          file_id: selectedFile.id,
          filename: selectedFile.name,
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
      alert(err.message || "Failed to summarize file");
    } finally {
      setLoadingSummary(false);
    }
  }

  /* ---------------- UI ---------------- */

  return (
    <>
      {/* FILE LIST */}
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
              <div className="file-left">
                <div className="file-icon">
                  {getFileIcon(file.mimeType)}
                </div>
                <div>
                  <div className="file-name">{file.name}</div>
                  <div className="file-type">{file.mimeType}</div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* ACTION BAR */}
      <div className="action-bar">
        <button
          className="primary-btn"
          disabled={!selectedFile || loadingSummary}
          onClick={summarizeSelectedFile}
        >
          {!selectedFile
            ? "Select a file to summarize"
            : loadingSummary
            ? "Summarizing…"
            : "Summarize Selected File"}
        </button>
      </div>

      {/* SUMMARY */}
      {summary && (
        <div className="summary-box">
          <h3>Summary</h3>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {summary}
          </ReactMarkdown>
        </div>
      )}
    </>
  );
}
