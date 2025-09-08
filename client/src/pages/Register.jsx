// client/src/pages/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api.js";


export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // keep role optional; backend defaults to "user" if omitted
  const [role, setRole] = useState("user");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setErr("Please fill name, email, and password.");
      return;
    }

    try {
      setLoading(true);
      // If you want only user signups from UI, send {name,email,password} without role
      const res = await api.post("/auth/register", { name, email, password, role });

      const { token, user } = res.data || {};
      if (!token || !user?.role) {
        setErr("Unexpected server response.");
        setLoading(false);
        return;
      }

      // store auth
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);

      // redirect based on role
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "agent") navigate("/agent");
      else navigate("/user");
    } catch (e) {
      const msg = e?.response?.data?.message || "Registration failed.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 420 }}>
      <h2 style={{ marginBottom: 12 }}>Create your account</h2>

      {err && (
        <div style={{ marginBottom: 12, color: "white", background: "#e11d48", padding: 8, borderRadius: 4 }}>
          {err}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
        />
        <input
          placeholder="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
        />

        {/* If you want users to always be "user", you can hide this select or remove it */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
        >
          <option value="user">user</option>
          <option value="agent">agent</option>
          <option value="admin">admin</option>
        </select>

        <button
          disabled={loading}
          style={{
            padding: 10,
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>

      <p style={{ marginTop: 12 }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
