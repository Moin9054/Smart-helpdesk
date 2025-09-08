// client/src/pages/KBList.jsx
import { useEffect, useState } from "react";
import api from "../api.js";
import { getRole } from "/src/auth.js";

export default function KBList() {
  const role = getRole(); // "admin" | "agent" | "user" | null
  const canEdit = role === "admin" || role === "agent";

  // search state
  const [q, setQ] = useState("");
  const [list, setList] = useState([]);

  // create/edit state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const normalizeArticle = (a) => ({
    _id: a._id,
    title: a.title,
    body: a.body ?? a.content ?? "", // support both "body" or "content"
    tags: a.tags || [],
    createdAt: a.createdAt,
  });

  const load = async () => {
    setErr("");
    setOk("");
    setLoading(true);
    try {
      const res = await api.get("/kb", { params: { q } });
      const items = Array.isArray(res.data) ? res.data.map(normalizeArticle) : [];
      setList(items);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load KB");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []); // initial

  const create = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");
    if (!title.trim() || !body.trim()) {
      setErr("Please fill title and body.");
      return;
    }
    try {
      // ✅ send 'content' to match your backend schema
      const payload = {
        title,
        content: body,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      };
      const res = await api.post("/kb", payload);
      if (res?.data?._id) {
        setTitle("");
        setBody("");
        setTags("");
        setOk("Article created");
        load();
      } else {
        setErr("Unexpected server response");
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "Create failed");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this article?")) return;
    setErr("");
    setOk("");
    try {
      await api.delete(`/kb/${id}`);
      setOk("Deleted");
      setList(list.filter((a) => a._id !== id));
    } catch (e) {
      setErr(e?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Knowledge Base</h2>

      {/* search */}
      <div style={{ margin: "12px 0" }}>
        <input
          placeholder="Search by title/body/tags"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6, marginRight: 8, width: 280 }}
        />
        <button onClick={load} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {err && (
        <div style={{ marginBottom: 12, background: "#ef4444", color: "#fff", padding: 8, borderRadius: 6 }}>
          {err}
        </div>
      )}
      {ok && (
        <div style={{ marginBottom: 12, background: "#10b981", color: "#fff", padding: 8, borderRadius: 6 }}>
          {ok}
        </div>
      )}

      {/* create (admin/agent only) */}
      {canEdit && (
        <form onSubmit={create} style={{ margin: "16px 0", maxWidth: 680 }}>
          <h3>Create Article</h3>
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              padding: 8,
              border: "1px solid #ccc",
              borderRadius: 6,
              display: "block",
              marginBottom: 8,
              width: "100%",
            }}
          />
          <textarea
            placeholder="Body (content)"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            style={{
              padding: 8,
              border: "1px solid #ccc",
              borderRadius: 6,
              display: "block",
              marginBottom: 8,
              width: "100%",
              height: 120,
            }}
          />
          <input
            placeholder="tags (comma-separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            style={{
              padding: 8,
              border: "1px solid #ccc",
              borderRadius: 6,
              display: "block",
              marginBottom: 8,
              width: "100%",
            }}
          />
          <button>Create</button>
        </form>
      )}

      {/* list */}
      <h3>Articles</h3>
      {list.length === 0 && <div>No articles found.</div>}
      <ul style={{ padding: 0, listStyle: "none" }}>
        {list.map((a) => (
          <li key={a._id} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 12, margin: "8px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{a.title}</div>
                <div style={{ color: "#6b7280", marginTop: 4, whiteSpace: "pre-wrap" }}>
                  {a.body.length > 220 ? a.body.slice(0, 220) + "…" : a.body}
                </div>
                {a.tags?.length > 0 && (
                  <div style={{ marginTop: 6, fontSize: 12, color: "#475569" }}>
                    tags: [{a.tags.join(", ")}]
                  </div>
                )}
              </div>
              {canEdit && (
                <div>
                  {/* you can add edit later; for now, just delete */}
                  <button
                    onClick={() => remove(a._id)}
                    style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, padding: "6px 10px" }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
