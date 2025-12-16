import { api } from "../api/backend";

export default function SummaryView({ content }: { content: string }) {
  const [summary, setSummary] = React.useState("");

  const summarize = async () => {
    const res = await api.post("/summarize", null, {
      params: { content }
    });
    setSummary(res.data.summary);
  };

  return (
    <>
      <button onClick={summarize}>Summarize</button>
      <pre>{summary}</pre>
    </>
  );
}
