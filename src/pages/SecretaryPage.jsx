import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import AuthPage from "./AuthPage";
import SecretaryConsole from "../components/secretary/SecretaryConsole";

export default function SecretaryPage() {
  const { session, logout } = useAuth();

  if (!session) {
    return <AuthPage initialMode="secretary" />;
  }

  if (session.role === "admin") {
    return <Navigate to="/admin" replace />;
  }
  if (session.role === "member") {
    return <Navigate to="/account" replace />;
  }
  if (session.role === "treasurer") {
    return <Navigate to="/treasurer" replace />;
  }

  return <SecretaryConsole session={session} onLogout={logout} />;
}