import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import AuthPage from "./AuthPage";
import OrganisingConsole from "../components/organising/OrganisingConsole";

const ROLE_HOME = {
  member: "/account",
  admin: "/admin",
  treasurer: "/treasurer",
  secretary: "/secretary",
  chairperson: "/chairperson",
  vicechairperson: "/vice-chair",
  organising: "/organising",
};

export default function OrganisingPage() {
  const { session, logout } = useAuth();

  if (!session) {
    return <AuthPage initialMode="organising" />;
  }

  if (session.role in ROLE_HOME && session.role !== "organising") {
    return <Navigate to={ROLE_HOME[session.role]} replace />;
  }

  if (session.role === "organising") {
    return <OrganisingConsole session={session} onLogout={logout} />;
  }

  return <Navigate to={ROLE_HOME.member} replace />;
}
