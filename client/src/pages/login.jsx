// client/src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api.js"; // relative to /src/pages

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!email.trim() || !password.trim()) {
      setErr("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/login", { email, password });
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
      const msg = e?.response?.data?.message || "Invalid credentials.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  const card = {
    padding: 24,
    maxWidth: 420,
    margin: "0 auto",
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  };
  const input = { padding: 10, border: "1px solid #d1d5db", borderRadius: 6, width: "100%" };
  const row = { display: "grid", gap: 10, marginTop: 12 };
  const btn = (primary) => ({
    padding: "10px 12px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    background: primary ? "#2563eb" : "#6b7280",
    color: "white",
    opacity: loading ? 0.7 : 1,
  });

  return (
    <div style={{ padding: 24 }}>
      <div style={card}>
        <h2 style={{ marginBottom: 8 }}>Welcome back</h2>
        <p style={{ marginTop: 0, color: "#6b7280" }}>Sign in to your account</p>

        {err && (
          <div style={{ marginTop: 12, color: "white", background: "#ef4444", padding: 8, borderRadius: 6 }}>
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} style={row}>
          <div>
            <label style={{ display: "block", marginBottom: 6, color: "#374151" }}>Email</label>
            <input
              style={input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6, color: "#374151" }}>Password</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                style={{ ...input, flex: 1 }}
                type={showPwd ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                style={btn(false)}
                title={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={btn(true)}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p style={{ marginTop: 12 }}>
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
