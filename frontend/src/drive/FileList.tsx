import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import type { DriveFile } from "../types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const API_BASE = import.meta.env.VITE_BACKEND_URL;
const FOLDER_MIME = "application/vnd.google-apps.folder";

const SUPPORTED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.google-apps.document",
  "text/plain",
]);

/* ---------------- ICONS ---------------- */

const FolderIcon = () => <span>📁</span>;
const PdfIcon = () => <span>📄</span>;
const DocIcon = () => <span>📝</span>;
const TextIcon = () => <span>📃</span>;

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
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [cache, setCache] = useState<CachedSummary[]>([]);

  const currentFolderId = folderStack[folderStack.length - 1].id;

  /* ---------------- HELPERS ---------------- */

  function isSupportedFile(mimeType: string) {
    return SUPPORTED_MIME_TYPES.has(mimeType);
  }

  /* ---------------- FETCH FILES ---------------- */

  useEffect(() => {
    fetchFiles();
  }, [currentFolderId]);

  async function fetchFiles() {
    setLoadingFiles(true);
    setSelectedIndex(-1);
    setSummary("");
    setError(null);

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

  const filteredFiles = useMemo(
    () =>
      files.filter((f) =>
        f.name.toLowerCase().includes(search.toLowerCase())
      ),
    [files, search]
  );

  const selectedItem =
    selectedIndex >= 0 ? filteredFiles[selectedIndex] : null;

  const isSummarizeDisabled =
    loadingSummary ||
    !selectedItem ||
    selectedItem.mimeType === FOLDER_MIME ||
    !isSupportedFile(selectedItem.mimeType);

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
    if (isSummarizeDisabled || !selectedItem) return;

    setLoadingSummary(true);
    setSummary("");
    setError(null);

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to summarize file");
      }

      setSummary(data.summary);
      saveToCache(selectedItem.id, data.summary);
    } catch (err: any) {
      setError(err.message);
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

  /* ---------------- UI ---------------- */

  return (
    <>
      <div className="drive-header-row">
        <div className="drive-title">
          <span>📁</span>
          <span>{folderStack[folderStack.length - 1].name}</span>
          {folderStack.length > 1 && (
            <button className="back-btn" onClick={goBack}>
              ← Back
            </button>
          )}
        </div>

        <div className="search-wrapper">
          <label>Search files</label>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(-1);
            }}
          />
        </div>
      </div>

      <div className="file-list-container">
        {loadingFiles && <div className="hint">Loading…</div>}

        {!loadingFiles &&
          filteredFiles.map((item, index) => {
            const isCached =
              item.mimeType !== FOLDER_MIME && getCached(item.id);

            return (
              <div
                key={item.id}
                className={`file-item ${
                  index === selectedIndex ? "selected" : ""
                }`}
                onClick={() => {
                  setSelectedIndex(index);
                  setSummary("");
                  setError(null);

                  if (item.mimeType === FOLDER_MIME) {
                    openFolder(item);
                  }
                }}
              >
                <div className="file-left">
                  {getFileIcon(item.mimeType)}
                  <span className="file-name">
                    {item.name}
                    {!isSupportedFile(item.mimeType) &&
                      item.mimeType !== FOLDER_MIME && (
                        <span className="unsupported-tag">
                          {" "}
                          (unsupported)
                        </span>
                      )}
                  </span>
                </div>

                {isCached && <span className="cached-badge">Cached</span>}
              </div>
            );
          })}
      </div>

      <button
        className={`summarize-btn ${
          isSummarizeDisabled ? "disabled" : ""
        }`}
        disabled={isSummarizeDisabled}
        onClick={summarizeSelectedFile}
        title={
          loadingSummary
            ? "Summarization in progress"
            : selectedItem &&
              selectedItem.mimeType !== FOLDER_MIME &&
              !isSupportedFile(selectedItem.mimeType)
            ? "This file type is not supported for summarization"
            : "Select a supported file to summarize"
        }
      >
        {loadingSummary ? "Summarizing…" : "Summarize"}
      </button>

      {error && (
        <div className="summary-box error">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      )}

      {summary && !error && (
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
