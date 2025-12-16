import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import type { DriveFile } from "../types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const API_BASE = "http://localhost:8000";
const FOLDER_MIME = "application/vnd.google-apps.folder";

/* ---------------- ICONS ---------------- */

const FolderIcon = () => <span style={{ color: "#facc15" }}>📁</span>;
const PdfIcon = () => <span style={{ color: "#ef4444" }}>📄</span>;
const DocIcon = () => <span style={{ color: "#3b82f6" }}>📝</span>;
const TextIcon = () => <span style={{ color: "#22c55e" }}>📃</span>;

function getFileIcon(mime: string) {
  if (mime === FOLDER_MIME) return <FolderIcon />;
  if (mime.includes("pdf")) return <PdfIcon />;
  if (mime.includes("word") || mime.includes("google-apps.document"))
    return <DocIcon />;
  return <TextIcon />;
}

/* ---------------- TYPES ---------------- */

interface CachedSummary {
  fileId: string;
  summary: string;
  cachedAt: number;
}

interface FolderStackItem {
  id: string | null;
  name: string;
}

/* ---------------- COMPONENT ---------------- */

export default function FileList({ sessionId }: { sessionId: string }) {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [folderStack, setFolderStack] = useState<FolderStackItem[]>([
    { id: null, name: "My Drive" },
  ]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [summary, setSummary] = useState("");
  const [search, setSearch] = useState("");
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [cache, setCache] = useState<CachedSummary[]>([]);

  const currentFolderId = folderStack[folderStack.length - 1].id;

  /* ---------------- FETCH FILES ---------------- */

  useEffect(() => {
    fetchFiles();
  }, [currentFolderId]);

  async function fetchFiles() {
    setLoadingFiles(true);
    setSelectedIndex(-1);
    setSummary("");

    try {
      const res = await axios.post(
        `${API_BASE}/drive/files`,
        null,
        {
          params: {
            session_id: sessionId,
            ...(currentFolderId ? { folder_id: currentFolderId } : {}),
          },
        }
      );
      setFiles(res.data);
    } catch {
      alert("Failed to load Drive files");
    } finally {
      setLoadingFiles(false);
    }
  }

  /* ---------------- SEARCH ---------------- */

  const filteredFiles = useMemo(() => {
    return files.filter((f) =>
      f.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [files, search]);

  const selectedItem =
    selectedIndex >= 0 ? filteredFiles[selectedIndex] : null;

  const isFileSelected =
    selectedItem && selectedItem.mimeType !== FOLDER_MIME;

  /* ---------------- CACHE ---------------- */

  function getCached(fileId: string) {
    return cache.find((c) => c.fileId === fileId);
  }

  function saveToCache(fileId: string, summary: string) {
    setCache((prev) => {
      const filtered = prev.filter((c) => c.fileId !== fileId);
      return [...filtered, { fileId, summary, cachedAt: Date.now() }].slice(-10);
    });
  }

  /* ---------------- ACTIONS ---------------- */

  async function summarizeSelectedFile() {
    if (!selectedItem || selectedItem.mimeType === FOLDER_MIME) return;

    const cached = getCached(selectedItem.id);
    if (cached) {
      setSummary(cached.summary);
      return;
    }

    setLoadingSummary(true);
    setSummary("");

    try {
      const response = await fetch(`${API_BASE}/drive/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          file_id: selectedItem.id,
          filename: selectedItem.name,
          mime_type: selectedItem.mimeType,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Summarization failed");
      }

      const data = await response.json();
      setSummary(data.summary);
      saveToCache(selectedItem.id, data.summary);
    } catch (err: any) {
      alert(err.message || "Failed to summarize file");
    } finally {
      setLoadingSummary(false);
    }
  }

  function openFolder(folder: DriveFile) {
    setFolderStack((prev) => [...prev, { id: folder.id, name: folder.name }]);
    setSearch("");
  }

  function goBack() {
    setFolderStack((prev) => prev.slice(0, -1));
  }

  /* ---------------- KEYBOARD NAV ---------------- */

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (!filteredFiles.length) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) =>
          Math.min(i + 1, filteredFiles.length - 1)
        );
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      }

      if (e.key === "Enter" && isFileSelected) {
        summarizeSelectedFile();
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [filteredFiles, selectedIndex, isFileSelected]);

  /* ---------------- UI ---------------- */

  return (
    <>
      <div className="drive-header-row">
        {/* LEFT: DRIVE TITLE */}
        <div className="drive-title">
          <span className="drive-icon">📁</span>
          <span className="drive-text">
            {folderStack[folderStack.length - 1].name}
          </span>

          {folderStack.length > 1 && (
            <button className="back-btn" onClick={goBack}>
              ← Back
            </button>
          )}
        </div>

        {/* RIGHT: SEARCH */}
        <div className="search-wrapper horizontal">
          <label className="search-label" htmlFor="drive-search">
            Search files
          </label>
          <input
            id="drive-search"
            className="search-input"
            placeholder="Type to filter…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(-1);
            }}
          />
        </div>
      </div>

      {/* FILE LIST */}
      <div className="file-list-container">
        {loadingFiles && <div className="hint">Loading…</div>}

        {!loadingFiles &&
          filteredFiles.map((item, index) => {
            const isSelected = index === selectedIndex;
            const isCached =
              item.mimeType !== FOLDER_MIME && getCached(item.id);

            return (
              <div
                key={item.id}
                className={`file-item ${isSelected ? "selected" : ""}`}
                onClick={() => {
                  setSelectedIndex(index);
                  setSummary("");

                  if (item.mimeType === FOLDER_MIME) {
                    openFolder(item);
                  }
                }}
              >
                <div className="file-left">
                  <div className="file-icon">
                    {getFileIcon(item.mimeType)}
                  </div>
                  <div>
                    <div className="file-name">{item.name}</div>
                    <div className="file-type">{item.mimeType}</div>
                  </div>
                </div>

                {isCached && <span className="cached-badge">Cached</span>}
              </div>
            );
          })}
      </div>

      {/* ACTION BAR */}
      <div className="action-bar">
        <button
          className="primary-btn"
          disabled={!isFileSelected || loadingSummary}
          onClick={summarizeSelectedFile}
        >
          {!selectedItem
            ? "Select a file"
            : selectedItem.mimeType === FOLDER_MIME
            ? "Open folder"
            : loadingSummary
            ? "Summarizing…"
            : "Summarize (Enter)"}
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
