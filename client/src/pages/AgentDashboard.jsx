import { useEffect, useState } from "react";
import api from "../api";

export default function AgentDashboard() {
  const [tickets, setTickets] = useState([]);
  const [reply, setReply] = useState("");

  useEffect(() => {
    api.get("/tickets").then(res => setTickets(res.data || [])).catch(() => setTickets([]));
  }, []);

  const sendReply = async (id) => {
    if (!reply.trim()) return;
    await api.put(`/tickets/${id}/reply`, { reply });
    setReply("");
    alert("Reply sent!");
  };

  const closeTicket = async (id) => {
    await api.put(`/tickets/${id}/close`);
    setTickets(tickets.map(t => (t._id === id ? { ...t, status: "closed" } : t)));
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Agent Dashboard ✅</h2>
      {tickets.map(t => (
        <div key={t._id} style={{ border: "1px solid #ccc", margin: "10px 0", padding: 10 }}>
          <b>{t.title}</b> — {t.status}
          <div>{t.description}</div>
          <input
            placeholder="Reply..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            style={{ marginRight: 8 }}
          />
          <button onClick={() => sendReply(t._id)}>Send Reply</button>
          {t.status !== "closed" && <button onClick={() => closeTicket(t._id)} style={{ marginLeft: 8 }}>Close</button>}
        </div>
      ))}
    </div>
  );
}
