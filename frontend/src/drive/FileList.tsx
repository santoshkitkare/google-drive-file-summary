import { useEffect, useRef, useState } from "react";
import axios from "axios";

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
};

type Props = {
  authCode: string;
};

export default function FileList({ authCode }: Props) {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 🔒 Prevent duplicate API calls (React StrictMode)
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!authCode) return;
    if (hasFetched.current) return;

    hasFetched.current = true;
    fetchFiles();
  }, [authCode]);

  async function fetchFiles() {
    try {
      setLoadingFiles(true);

      const res = await axios.post(
        "http://localhost:8000/drive/files",
        null,
        { params: { auth_code: authCode } }
      );

      console.log("Drive files:", res.data);
      setFiles(res.data); // backend returns array
    } catch (err) {
      console.error(err);
      setError("Failed to load files");
    } finally {
      setLoadingFiles(false);
    }
  }

  async function handleSummarize() {
    if (!selectedFile) return;

    setSummarizing(true);
    setSummary(null);
    setError(null);

    try {
      const res = await axios.post(
        "http://localhost:8000/drive/summarize",
        {
          file_id: selectedFile.id,
          file_name: selectedFile.name,
          mime_type: selectedFile.mimeType,
        },
        {
          params: { auth_code: authCode },
        }
      );

      console.log("Summary response:", res.data);
      setSummary(res.data.summary);
    } catch (err) {
      console.error(err);
      setError("Failed to summarize file");
    } finally {
      setSummarizing(false);
    }
  }

  if (loadingFiles) return <p>📂 Loading files…</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ marginTop: 24 }}>
      <h3>Your Google Drive Files</h3>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {files.map((file) => (
          <li
            key={file.id}
            onClick={() => setSelectedFile(file)}
            style={{
              padding: "8px 12px",
              marginBottom: 6,
              cursor: "pointer",
              borderRadius: 6,
              background:
                selectedFile?.id === file.id ? "#e6f0ff" : "#f7f7f7",
              border:
                selectedFile?.id === file.id
                  ? "1px solid #4a90e2"
                  : "1px solid #ddd",
            }}
          >
            📄 {file.name}
            <div style={{ fontSize: 12, color: "#666" }}>
              {file.mimeType}
            </div>
          </li>
        ))}
      </ul>

      <button
        onClick={handleSummarize}
        disabled={!selectedFile || summarizing}
        style={{
          marginTop: 16,
          padding: "10px 16px",
          cursor: selectedFile ? "pointer" : "not-allowed",
        }}
      >
        🧠 {summarizing ? "Summarizing…" : "Summarize Selected File"}
      </button>

      {summary && (
        <div style={{ marginTop: 24 }}>
          <h3>Summary</h3>
          <p style={{ whiteSpace: "pre-wrap" }}>{summary}</p>
        </div>
      )}
    </div>
  );
}
