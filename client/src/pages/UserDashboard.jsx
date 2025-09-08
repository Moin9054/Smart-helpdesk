// src/pages/UserDashboard.jsx
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

// helper: normalize API id shape
const norm = (t) => ({ ...t, _id: t._id ?? t.id });

export default function UserDashboard() {
  const [tickets, setTickets] = useState([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const navigate = useNavigate();
  const pollRef = useRef(null);
  const stopRef = useRef(null);

  const fetchMine = async () => {
    try {
      const res = await api.get("/tickets/mine");
      const arr = Array.isArray(res.data) ? res.data.map(norm) : [];
      setTickets(arr);
    } catch {
      setTickets([]);
    }
  };

  useEffect(() => {
    fetchMine();

    // short polling so triage status changes appear without reload
    pollRef.current = setInterval(fetchMine, 3000);
    stopRef.current = setTimeout(() => {
      if (pollRef.current) clearInterval(pollRef.current);
    }, 45000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (stopRef.current) clearTimeout(stopRef.current);
    };
  }, []);

  const createTicket = async (e) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) return;

    const res = await api.post("/tickets", { title, description: desc });

    // robust append (handles id OR _id)
    if (res?.data) {
      const created = norm(res.data);
      setTickets((prev) => [created, ...prev]);
      // Optional: go straight to detail page
      // navigate(`/tickets/${created._id}`);

      // Or refetch to get any server-side computed fields (status, timestamps)
      await fetchMine();
    }

    setTitle("");
    setDesc("");
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>User Dashboard ✅</h2>

      <form onSubmit={createTicket} style={{ marginBottom: 16 }}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          required
          style={{ marginLeft: 8 }}
        />
        <button style={{ marginLeft: 8 }}>Create</button>
      </form>

      <h3>My Tickets</h3>
      <div style={{ display: "grid", gap: 12 }}>
        {tickets.map((t) => (
          <Link
            key={t._id}
            to={`/tickets/${t._id}`}
            style={{
              display: "block",
              border: "1px solid #ccc",
              padding: 12,
              borderRadius: 6,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div style={{ fontWeight: 700 }}>
              {t.title} — <span style={{ fontWeight: 400 }}>{t.status}</span>
            </div>
            <div>{t.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
