import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import AuthPage from "./AuthPage";
import SecretaryConsole from "../components/secretary/SecretaryConsole";

const ROLE_HOME = {
  member: "/account",
  admin: "/admin",
  treasurer: "/treasurer",
  secretary: "/secretary",
  chairperson: "/chairperson",
  vicechairperson: "/vice-chair",
  organising: "/organising",
};

export default function SecretaryPage() {
  const { session, logout } = useAuth();

  if (!session) {
    return <AuthPage initialMode="secretary" />;
  }

  if (session.role in ROLE_HOME && session.role !== "secretary") {
    return <Navigate to={ROLE_HOME[session.role]} replace />;
  }

  return <SecretaryConsole session={session} onLogout={logout} />;
}