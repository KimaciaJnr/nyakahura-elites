import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import AuthPage from "./AuthPage";
import AccountDashboard from "../components/account/AccountDashboard";

export default function AccountPage() {
  const { session, logout } = useAuth();

  if (!session) {
    return <AuthPage initialMode="member" />;
  }

  if (session.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return <AccountDashboard session={session} onLogout={logout} />;
}