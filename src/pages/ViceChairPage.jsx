import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import AuthPage from "./AuthPage";
import ViceChairConsole from "../components/deputy/ViceChairConsole";

const ROLE_HOME = {
  member: "/account",
  admin: "/admin",
  treasurer: "/treasurer",
  secretary: "/secretary",
  chairperson: "/chairperson",
  vicechairperson: "/vice-chair",
  organising: "/organising",
};

export default function ViceChairPage() {
  const { session, logout } = useAuth();

  if (!session) {
    return <AuthPage initialMode="vicechairperson" />;
  }

  if (session.role in ROLE_HOME && session.role !== "vicechairperson") {
    return <Navigate to={ROLE_HOME[session.role]} replace />;
  }

  if (session.role === "vicechairperson") {
    return <ViceChairConsole session={session} onLogout={logout} />;
  }

  return <Navigate to={ROLE_HOME.member} replace />;
}
