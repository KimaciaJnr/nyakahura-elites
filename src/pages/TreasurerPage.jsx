import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import AuthPage from "./AuthPage";
import TreasurerConsole from "../components/treasurer/TreasurerConsole";

const ROLE_HOME = {
  member: "/account",
  admin: "/admin",
  treasurer: "/treasurer",
  secretary: "/secretary",
  chairperson: "/chairperson",
  vicechairperson: "/vice-chair",
  organising: "/organising",
};

export default function TreasurerPage() {
  const { session, logout } = useAuth();

  if (!session) {
    return <AuthPage initialMode="treasurer" />;
  }

  if (session.role in ROLE_HOME && session.role !== "treasurer") {
    return <Navigate to={ROLE_HOME[session.role]} replace />;
  }

  return <TreasurerConsole session={session} onLogout={logout} />;
}