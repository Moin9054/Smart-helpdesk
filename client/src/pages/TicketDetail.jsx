// client/src/pages/TicketDetail.jsx
import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";  // ← one line
import api from "../api";

export default function TicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [kb, setKb] = useState([]);
  const [reply, setReply] = useState("");
  const [audits, setAudits] = useState([]);

  const pollRef = useRef(null);
  const stopRef = useRef(null);

  const extractIds = (s) => {
    if (!s) return [];
    if (Array.isArray(s.kbCitations)) return s.kbCitations.map(x => (typeof x === "string" ? x : x.id)).filter(Boolean);
    if (Array.isArray(s.articleIds))   return s.articleIds.filter(Boolean);
    return [];
  };

  async function hydrateKB(sug, tkt) {
    const ids = extractIds(sug);
    if (ids.length) {
      try {
        const r = await api.get("/kb/batch", { params: { ids: ids.join(",") } });
        if (Array.isArray(r.data) && r.data.length) { setKb(r.data); return; }
      } catch {}
    }
    // fallback search
    try {
      const q = [tkt?.title, tkt?.description].filter(Boolean).join(" ");
      if (!q) return setKb([]);
      const r = await api.get("/kb", { params: { query: q } });
      setKb((r.data || []).slice(0, 3));
    } catch { setKb([]); }
  }

  async function fetchAll() {
    const t = await api.get(`/tickets/${id}`);
    setTicket(t.data);

    try {
      const s = await api.get(`/agent/suggestion/${id}`);
      setSuggestion(s.data || null);
      await hydrateKB(s.data, t.data);
    } catch {
      setSuggestion(null);
      await hydrateKB(null, t.data);
    }

    try {
      const a = await api.get(`/tickets/${id}/audit`);
      setAudits(Array.isArray(a.data) ? a.data : []);
    } catch { setAudits([]); }
  }

  useEffect(() => {
    (async () => {
      await fetchAll();
      // short polling for 60s so classification→KB→draft→decision appears live
      pollRef.current = setInterval(fetchAll, 2500);
      stopRef.current = setTimeout(() => pollRef.current && clearInterval(pollRef.current), 60000);
    })();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (stopRef.current) clearTimeout(stopRef.current);
    };
  }, [id]);

  if (!ticket) return <div className="p-4">Loading…</div>;

  const sendReply = async (e) => {
    e.preventDefault();
    await api.post(`/tickets/${id}/messages`, { text: reply }).catch(async () => {
      await api.put(`/tickets/${id}/reply`, { reply });
    });
    setReply(""); await fetchAll();
  };

  const closeTicket = async () => {
    await api.post(`/tickets/${id}/close`).catch(async () => { await api.put(`/tickets/${id}/close`); });
    await fetchAll();
  };

  return (
    <div className="p-4 space-y-6" style={{ maxWidth: 960 }}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{ticket.title}</h1>
        <span className="text-sm px-2 py-1 rounded bg-gray-100">{ticket.status}</span>
      </div>
      <p className="text-gray-700">{ticket.description}</p>

      {suggestion && (
        <div className="border rounded p-3">
          <div className="font-semibold">Agent Suggestion</div>
          <div className="text-sm text-gray-600">
            Category: <b>{suggestion.predictedCategory}</b> • Confidence:{" "}
            <b>{Number(suggestion.confidence ?? 0).toFixed(2)}</b>
          </div>
          {suggestion.draftReply && <div className="mt-2 whitespace-pre-wrap">{suggestion.draftReply}</div>}
        </div>
      )}

      {(kb.length > 0) && (
        <div className="border rounded p-3">
          <div className="font-semibold mb-2">Similar Articles</div>
          <ul className="space-y-2">
            {kb.map(a => (
              <li key={a.id} className="border rounded p-2">
                {/* use Link instead of <a href> */}
                <Link to={`/kb/${a.id}`} style={{ fontWeight: 600, textDecoration: "none" }}>
                  {a.title}
                </Link>
                {a.snippet && <div className="text-sm text-gray-600">{a.snippet}…</div>}
                {Array.isArray(a.tags) && a.tags.length > 0 && (
                  <div className="text-xs text-gray-500">Tags: {a.tags.join(", ")}</div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <div className="font-semibold mb-2">Conversation</div>
        <form onSubmit={sendReply} className="mt-2 flex gap-2">
          <input className="border p-2 flex-1" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type reply…" />
          <button type="submit" className="bg-black text-white px-3 py-2 rounded">Send</button>
          {ticket.status !== "resolved" && (
            <button type="button" onClick={closeTicket} className="bg-gray-800 text-white px-3 py-2 rounded">Close</button>
          )}
        </form>
      </div>

      <div>
        <div className="font-semibold mb-2">Audit Timeline</div>
        <div className="space-y-2">
          {audits.map((a, i) => (
            <div key={i} className="border rounded p-2">
              <div className="text-xs text-gray-500">
                {a.actor} • {a.action} • {a.timestamp ? new Date(a.timestamp).toLocaleString() : ""}
              </div>
              {a.traceId && <div className="text-xs text-gray-400">trace: {a.traceId}</div>}
              {a.meta && <pre className="bg-gray-50 p-2 text-xs mt-1 rounded">{JSON.stringify(a.meta, null, 2)}</pre>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
