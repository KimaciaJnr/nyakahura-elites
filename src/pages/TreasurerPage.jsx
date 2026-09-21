import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import AuthPage from "./AuthPage";
import TreasurerConsole from "../components/treasurer/TreasurerConsole";

export default function TreasurerPage() {
  const { session, logout } = useAuth();

  if (!session) {
    return <AuthPage initialMode="treasurer" />;
  }

  if (session.role === "admin") {
    return <Navigate to="/admin" replace />;
  }
  if (session.role === "member") {
    return <Navigate to="/account" replace />;
  }
  if (session.role === "secretary") {
    return <Navigate to="/secretary" replace />;
  }

  return <TreasurerConsole session={session} onLogout={logout} />;
}