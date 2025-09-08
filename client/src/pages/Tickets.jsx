import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Removed Link import
import api from "../api";

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [refreshCount, setRefreshCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get("/tickets")
      .then(res => setTickets(res.data || []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, [refreshCount]);

  const refreshTickets = () => {
    setRefreshCount(prev => prev + 1);
  };

  const handleTicketClick = (ticketId) => {
    navigate(`/tickets/${ticketId}`);
  };

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Tickets</h2>
        <p>Loading tickets...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2>Tickets</h2>
        <button 
          onClick={refreshTickets}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          🔄 Refresh
        </button>
      </div>
      
      {tickets.length === 0 ? (
        <p>No tickets found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {tickets.map(t => (
            <li 
              key={t._id} 
              style={{ 
                margin: "8px 0", 
                padding: "12px", 
                border: "1px solid #ddd", 
                borderRadius: "4px",
                cursor: "pointer",
                backgroundColor: "#f9f9f9",
                transition: "background-color 0.2s ease"
              }}
              onClick={() => handleTicketClick(t._id)}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#e9e9e9"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "#f9f9f9"}
            >
              {/* ✅ REMOVED Link component - using onClick instead */}
              <div style={{ fontWeight: "bold", fontSize: "16px", color: "#007bff" }}>
                {t.title}
              </div> 
              <div style={{ marginTop: "4px" }}>
                <span style={{
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  backgroundColor: 
                    t.status === "resolved" ? "#d4edda" :
                    t.status === "closed" ? "#d6d8db" :
                    t.status === "waiting_human" ? "#fff3cd" :
                    "#d1ecf1",
                  color: 
                    t.status === "resolved" ? "#155724" :
                    t.status === "closed" ? "#383d41" :
                    t.status === "waiting_human" ? "#856404" :
                    "#0c5460"
                }}>
                  {t.status}
                </span>
                
                {t.agentSuggestionId && (
                  <span style={{ marginLeft: "8px", fontSize: "12px", color: "#28a745" }}>
                    🤖 AI Suggested
                  </span>
                )}
              </div>
              <div style={{ color: "#666", fontSize: "12px", marginTop: "4px" }}>
                Click to view details
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}