// import { useState } from "react";
// import GoogleLoginBtn from "./auth/GoogleLoginBtn";
// import FileList from "./drive/FileList";

// export default function App() {
//   const [authCode, setAuthCode] = useState<string | null>(null);

//   if (!authCode) {
//     return (
//       <div style={{ padding: 40 }}>
//         <h1>Google Drive File Summarizer</h1>
//         <GoogleLoginBtn onAuthCode={setAuthCode} />
//       </div>
//     );
//   }

//   return (
//     <div style={{ padding: 40 }}>
//       <h1>Google Drive File Summarizer</h1>
//       <FileList authCode={authCode} />
//     </div>
//   );
// }


import { useState } from "react";
import GoogleLoginBtn from "./auth/GoogleLoginBtn";
import FileList from "./drive/FileList";

export default function App() {
  const [authCode, setAuthCode] = useState<string | null>(null);

  return (
    <div style={{ padding: 24 }}>
      <h2>Google Drive File Summarizer</h2>

      {!authCode && (
        <GoogleLoginBtn onAuthCode={setAuthCode} />
      )}

      {authCode && <FileList authCode={authCode} />}
    </div>
  );
}
