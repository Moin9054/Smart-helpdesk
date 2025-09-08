import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Login from "./pages/login.jsx";            // ← fix casing
import Register from "./pages/Register.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AgentDashboard from "./pages/AgentDashboard.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import Tickets from "./pages/Tickets.jsx";
import TicketDetail from "./pages/TicketDetail.jsx";
import Config from "./pages/Config.jsx";
import KBList from "./pages/KBList.jsx";
import KBArticle from "./pages/KBArticle.jsx";   // ← you'll use this below

import { getRole, isAuthed } from "/src/auth.js"; // keep if your Vite alias is set; else use "./auth.js"

function Landing() {
  if (isAuthed()) {
    const role = getRole() || "user";
    return <Navigate to={`/${role}`} replace />;
  }
  return <Login />;
}

function NoAuthOnly({ children }) {
  if (isAuthed()) {
    const role = getRole() || "user";
    return <Navigate to={`/${role}`} replace />;
  }
  return children;
}

function NotFound() {
  return <div style={{ padding: 24 }}>404 — Page not found</div>;
}

export default function App() {
  return (
    <Router>
      <Navbar />
      <div className="p-6">
        <Routes>
          {/* public */}
          <Route path="/" element={<Landing />} />
          <Route
            path="/login"
            element={
              <NoAuthOnly>
                <Login />
              </NoAuthOnly>
            }
          />
          <Route
            path="/register"
            element={
              <NoAuthOnly>
                <Register />
              </NoAuthOnly>
            }
          />

          {/* protected */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent"
            element={
              <ProtectedRoute>
                <AgentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets"
            element={
              <ProtectedRoute>
                <Tickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/:id"
            element={
              <ProtectedRoute>
                <TicketDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/config"
            element={
              <ProtectedRoute>
                <Config />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kb"
            element={
              <ProtectedRoute>
                <KBList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kb/:id"
            element={
              <ProtectedRoute>
                <KBArticle />   {/* ← fix component name */}
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}
