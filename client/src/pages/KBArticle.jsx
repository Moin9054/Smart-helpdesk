// client/src/pages/KBArticle.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";

export default function KBArticle() {
  const { id } = useParams();
  const [art, setArt] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get(`/kb/${id}`);
        setArt(r.data);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load article");
      }
    })();
  }, [id]);

  if (err) return <div className="p-4 text-red-600">{err}</div>;
  if (!art) return <div className="p-4">Loading…</div>;

  return (
    <div className="p-4" style={{ maxWidth: 900 }}>
      <Link to="/user" style={{ textDecoration: "none" }}>← Back</Link>
      <h1 className="text-2xl font-semibold mt-2">{art.title}</h1>
      {Array.isArray(art.tags) && art.tags.length > 0 && (
        <div className="text-sm text-gray-600 mb-3">Tags: {art.tags.join(", ")}</div>
      )}
      <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{art.body}</div>
    </div>
  );
}
