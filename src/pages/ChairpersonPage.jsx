import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import AuthPage from "./AuthPage";
import ChairpersonConsole from "../components/chair/ChairpersonConsole";

const ROLE_HOME = {
  member: "/account",
  admin: "/admin",
  treasurer: "/treasurer",
  secretary: "/secretary",
  chairperson: "/chairperson",
  vicechairperson: "/vice-chair",
  organising: "/organising",
};

export default function ChairpersonPage() {
  const { session, logout } = useAuth();

  if (!session) {
    return <AuthPage initialMode="chairperson" />;
  }

  if (session.role in ROLE_HOME && session.role !== "chairperson") {
    return <Navigate to={ROLE_HOME[session.role]} replace />;
  }

  if (session.role === "chairperson") {
    return <ChairpersonConsole session={session} onLogout={logout} />;
  }

  return <Navigate to={ROLE_HOME.member} replace />;
}
