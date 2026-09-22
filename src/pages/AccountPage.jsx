import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import AuthPage from "./AuthPage";
import AccountDashboard from "../components/account/AccountDashboard";

const ROLE_HOME = {
  member: "/account",
  admin: "/admin",
  treasurer: "/treasurer",
  secretary: "/secretary",
  chairperson: "/chairperson",
  vicechairperson: "/vice-chair",
  organising: "/organising",
};

export default function AccountPage() {
  const { session, logout } = useAuth();

  if (!session) {
    return <AuthPage initialMode="member" />;
  }

  if (session.role in ROLE_HOME && session.role !== "member") {
    return <Navigate to={ROLE_HOME[session.role]} replace />;
  }

  return <AccountDashboard session={session} onLogout={logout} />;
}