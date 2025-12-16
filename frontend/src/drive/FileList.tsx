// import { useEffect, useRef, useState } from "react";
// import { api } from "../api/backend";
// import type { DriveFile } from "../types";

// type Props = {
//   authCode: string;
// };

// export default function FileList({ authCode }: Props) {
//   const [files, setFiles] = useState<DriveFile[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);


//   // 🔐 GUARD: prevents auth_code reuse
//   const hasFetched = useRef(false);

//   useEffect(() => {
//     if (!authCode) return;

//     // 🚨 This is the IMPORTANT PART
//     if (hasFetched.current) return;
//     hasFetched.current = true;

//     const fetchFiles = async () => {
//       try {
//         setLoading(true);
//         const res = await api.post(
//           "/drive/files",
//           null,
//           { params: { auth_code: authCode } }
//         );
//         setFiles(res.data.files || []);
//       } catch (err) {
//         setError("Failed to load files");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchFiles();
//   }, [authCode]);

//   if (loading) return <p>Loading Drive files…</p>;
//   if (error) return <p style={{ color: "red" }}>{error}</p>;

//   return (
//     <div>
//       <h3>Your Google Drive Files</h3>
//       <ul>
//         {files.map((f) => (
//           <li key={f.id}>
//             <strong>{f.name}</strong>
//             <span style={{ marginLeft: 8, color: "#666" }}>
//               ({f.mimeType})
//             </span>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }


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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔥 prevents double-call in React StrictMode
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!authCode) return;
    if (hasFetched.current) return;

    hasFetched.current = true;
    fetchFiles();
  }, [authCode]);

  async function fetchFiles() {
    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:8000/drive/files",
        null,
        { params: { auth_code: authCode } }
      );

      console.log("Drive files response:", res.data);

      // 👇 THIS is critical
      setFiles(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load files");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p>Loading files…</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h3>Your Google Drive Files</h3>

      {files.length === 0 && <p>No files found.</p>}

      <ul>
        {files.map((f) => (
          <li key={f.id}>
            📄 {f.name}
            <small style={{ marginLeft: 8, color: "#666" }}>
              ({f.mimeType})
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
}
