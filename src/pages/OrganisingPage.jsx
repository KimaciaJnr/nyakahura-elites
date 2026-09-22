import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getMember } from "../lib/store";
import RoleMandate from "../components/RoleMandate";
import AuthPage from "./AuthPage";

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
  const holder = session?.relatedMemberId ? getMember(session.relatedMemberId) : null;

  if (!session) {
    return <AuthPage initialMode="organising" />;
  }

  if (session.role in ROLE_HOME && session.role !== "organising") {
    return <Navigate to={ROLE_HOME[session.role]} replace />;
  }

  if (session.role === "organising") {
    return (
      <div className="min-h-screen bg-navy px-6 py-10 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="font-serif text-3xl font-bold">Organising Secretary Portal</p>
              <p className="text-sm text-white/60">Events, drives, mobilisation and logistics</p>
            </div>
            <button
              onClick={logout}
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
            >
              Sign out
            </button>
          </div>

          <div className="mt-6 rounded-3xl bg-white p-6 text-navy shadow-xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-dark">
              Role status
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold">Organising Secretary console</h2>
            <p className="mt-3 text-sm text-navy/70">
              This portal is ready for event planning, member mobilisation, venue coordination,
              drives, and outreach tracking.
            </p>
          </div>
          <div className="mt-10">
            <RoleMandate roleKey="organising" holder={holder} className="mt-0" />
          </div>
        </div>
      </div>
    );
  }

  return <Navigate to={ROLE_HOME.member} replace />;
}
