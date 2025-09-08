import { useEffect, useState } from "react";
import api from "../api";

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    api.get("/tickets").then(res => setTickets(res.data || [])).catch(() => setTickets([]));
  }, []);

  const closeTicket = async (id) => {
    await api.put(`/tickets/${id}/close`);
    setTickets(tickets.map(t => (t._id === id ? { ...t, status: "closed" } : t)));
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Admin Dashboard ✅</h2>
      <h3>All Tickets</h3>
      {tickets.map(t => (
        <div key={t._id} style={{ border: "1px solid #ccc", margin: "10px 0", padding: 10 }}>
          <b>{t.title}</b> — {t.status}
          <div>{t.description}</div>
          {t.status !== "closed" && <button onClick={() => closeTicket(t._id)}>Close</button>}
        </div>
      ))}
    </div>
  );
}
