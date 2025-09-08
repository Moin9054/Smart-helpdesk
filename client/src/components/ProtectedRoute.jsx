import { Navigate } from "react-router-dom";
import { isAuthed } from "/src/auth.js";

export default function ProtectedRoute({ children }) {
  if (!isAuthed()) return <Navigate to="/login" replace />;
  return children;
}
