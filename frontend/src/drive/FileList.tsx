import { useEffect, useState } from "react";
import axios from "axios";

/* ---------------- TYPES ---------------- */

interface FileMeta {
  id: string;
  name: string;
  mimeType: string;
}

interface CachedSummary {
  file_id: string;
  file_name: string;
  summary: string;
  cachedAt: number;
}

/* ---------------- SVG ICONS ---------------- */

const PdfIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#e74c3c">
    <path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
  </svg>
);

const DocIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#3498db">
    <path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
  </svg>
);

const TextIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#2ecc71">
    <path d="M4 4h16v2H4zm0 6h16v2H4zm0 6h10v2H4z" />
  </svg>
);

const getFileIcon = (mime: string) => {
  if (mime.includes("pdf")) return <PdfIcon />;
  if (mime.includes("word")) return <DocIcon />;
  if (mime.includes("google-apps.document")) return <DocIcon />;
  return <TextIcon />;
};

/* ---------------- COMPONENT ---------------- */

export default function FileList({ authCode }: { authCode: string }) {
  const [files, setFiles] = useState<FileMeta[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileMeta | null>(null);
  const [summary, setSummary] = useState("");
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // 🔹 Frontend cache (max 10)
  const [summaryCache, setSummaryCache] = useState<CachedSummary[]>([]);

  /* -------- Fetch Drive Files -------- */

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoadingFiles(true);
    setSelectedFile(null);
    setSummary("");

    try {
      const res = await axios.post(
        "http://localhost:8000/drive/files",
        null,
        { params: { auth_code: authCode } }
      );
      setFiles(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load Drive files");
    } finally {
      setLoadingFiles(false);
    }
  };

  /* -------- Cache Helpers -------- */

  const getCachedSummary = (fileId: string) => {
    return summaryCache.find((c) => c.file_id === fileId);
  };

  const saveToCache = (file_id: string, file_name: string, summary: string) => {
    setSummaryCache((prev) => {
      const filtered = prev.filter((c) => c.file_id !== file_id);

      const updated = [
        ...filtered,
        {
          file_id,
          file_name,
          summary,
          cachedAt: Date.now(),
        },
      ];

      // keep only latest 10
      return updated.slice(-10);
    });
  };

  /* -------- Summarize Selected File -------- */

  const handleSummarize = async () => {
    if (!selectedFile) return;

    // ✅ CACHE HIT
    const cached = getCachedSummary(selectedFile.id);
    if (cached) {
      setSummary(cached.summary);
      return;
    }

    // ❌ CACHE MISS → backend call
    setLoadingSummary(true);
    setSummary("");

    try {
      const res = await fetch(
        `http://localhost:8000/drive/summarize?auth_code=${authCode}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file_id: selectedFile.id,
            file_name: selectedFile.name,
            mime_type: selectedFile.mimeType,
          }),
        }
      );

      if (!res.ok) throw new Error("Summarization failed");

      const data = await res.json();
      setSummary(data.summary);

      // 🔹 save to cache
      saveToCache(selectedFile.id, selectedFile.name, data.summary);
    } catch (err) {
      console.error(err);
      alert("Failed to summarize file");
    } finally {
      setLoadingSummary(false);
    }
  };

  /* ---------------- UI ---------------- */

  const isCached =
    selectedFile && getCachedSummary(selectedFile.id) !== undefined;

  return (
    <>
      {/* FILE LIST */}
      <div className="file-list-container">
        {loadingFiles && <div className="hint">Loading files…</div>}

        {!loadingFiles && files.length === 0 && (
          <div className="hint">No files found</div>
        )}

        {files.map((file) => (
          <div
            key={file.id}
            className={`file-item ${
              selectedFile?.id === file.id ? "selected" : ""
            }`}
            onClick={() => {
              setSelectedFile(file);
              const cached = getCachedSummary(file.id);
              setSummary(cached ? cached.summary : "");
            }}
          >
            <div className="file-left">
              <div className="file-icon">{getFileIcon(file.mimeType)}</div>
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
          onClick={handleSummarize}
        >
          {loadingSummary
            ? "Summarizing…"
            : isCached
            ? "Loaded from Cache"
            : "Summarize Selected File"}
        </button>
      </div>

      {/* SUMMARY */}
      {summary && (
        <div className="summary-box">
          <h3>Summary</h3>
          <p>{summary}</p>
        </div>
      )}
    </>
  );
}

