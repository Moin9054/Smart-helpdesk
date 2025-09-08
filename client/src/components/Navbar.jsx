// client/src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { getRole, logout } from "/src/auth.js";

export default function Navbar() {
  const navigate = useNavigate();
  const role = getRole(); // "admin" | "agent" | "user" | null

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  const bar = {
    padding: 12,
    borderBottom: "1px solid #ddd",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };
  const right = { display: "flex", gap: 12 };

  return (
    <nav style={bar}>
      <Link to="/" style={{ fontWeight: "bold", textDecoration: "none" }}>
        Smart Helpdesk
      </Link>

      <div style={right}>
        {!role && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/kb">KB</Link>
          </>
        )}

        {role === "user" && (
          <>
            <Link to="/user">My Tickets</Link>
            <button onClick={onLogout}>Logout</button>
          </>
        )}

        {role === "agent" && (
          <>
            <Link to="/agent">Assigned Tickets</Link>
            <button onClick={onLogout}>Logout</button>
          </>
        )}

        {role === "admin" && (
          <>
            <Link to="/admin">Dashboard</Link>
            <Link to="/kb">KB</Link>
            <Link to="/config">Config</Link>
            <button onClick={onLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
