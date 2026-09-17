import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Shield, UserPlus, ArrowLeft, Check } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import AuthPage from "./AuthPage";
import MemberForm from "../components/admin/MemberForm";

function BackToConsole() {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate("/admin")}
      className="inline-flex items-center gap-2 rounded-full border border-white/25 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </button>
  );
}

function AddMemberView({ onLogout }) {
  const navigate = useNavigate();
  const [addedName, setAddedName] = useState("");

  return (
    <div className="min-h-screen bg-navy">
      <header className="border-b border-white/10 bg-navy/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-3 lg:gap-6">
            <BackToConsole />
            <div className="flex items-center gap-3">
              <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-gold/20 text-gold sm:inline-flex">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="font-serif text-lg font-bold text-white">
                  Add a member
                </p>
                <p className="hidden text-xs text-white/50 sm:block">
                  Nyakahura Elites backend
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 lg:px-10">
        <div className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
          <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-navy">
            <UserPlus className="h-5 w-5 text-green" />
            New member
          </h2>
          <p className="mt-1 text-sm text-navy/60">
            Membership is closed — new accounts are created here only. The
            member can sign in with the email and password you set here.
          </p>

          <div className="mt-6">
            {addedName ? (
              <div className="flex flex-col items-center rounded-2xl bg-sand p-8 text-center ring-1 ring-navy/5">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-green/10 text-green">
                  <Check className="h-7 w-7" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-navy">
                  {addedName} added
                </h3>
                <p className="mt-2 max-w-sm text-sm text-navy/70">
                  They can now sign in to the member portal with the email and
                  password you created.
                </p>
                <button
                  onClick={() => navigate("/admin")}
                  className="mt-6 rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-light"
                >
                  Back to console
                </button>
              </div>
            ) : (
              <MemberForm
                onAdded={(member) => setAddedName(member.name)}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AddMemberPage() {
  const { session, logout } = useAuth();

  if (!session) {
    return <AuthPage initialMode="admin" />;
  }

  if (session.role === "member") {
    return <Navigate to="/account" replace />;
  }

  return <AddMemberView onLogout={logout} />;
}