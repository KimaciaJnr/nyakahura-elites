import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import AuthPage from "./AuthPage";
import AdminConsole from "../components/admin/AdminConsole";

export default function AdminPage() {
  const { session, logout } = useAuth();

  if (!session) {
    return <AuthPage initialMode="admin" />;
  }

  if (session.role === "member") {
    return <Navigate to="/account" replace />;
  }

  return <AdminConsole onLogout={logout} />;
}