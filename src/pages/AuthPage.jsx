import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Lock,
  Mail,
  LogIn,
  ArrowLeft,
  Shield,
  Users,
  Wallet,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import BackLink from "../components/BackLink";

const MODES = {
  member: {
    key: "member",
    label: "Member sign in",
    heading: "Member login",
    blurb: "Sign in to view your savings, fees, and group investments.",
    cta: "Sign in to my account",
    icon: Users,
    accent: "bg-navy",
    accentHover: "hover:bg-navy-light",
    demoLabel: "Member demo",
    demo: "david.muhia@example.com / password1",
    card: "light",
  },
  admin: {
    key: "admin",
    label: "Admin console",
    heading: "Administrator login",
    blurb: "Manage members, contributions, fees, and member accounts.",
    cta: "Access the console",
    icon: Shield,
    accent: "bg-gold-dark",
    accentHover: "hover:bg-gold",
    demoLabel: "Admin demo",
    demo: "admin@nyakahura.com / admin12345",
    card: "dark",
  },
};

const inputLight =
  "w-full rounded-xl border border-navy/10 py-3 pl-10 pr-4 text-sm text-navy outline-none placeholder:text-navy/40 focus:border-navy focus:ring-2 focus:ring-navy/10";
const inputDark =
  "w-full rounded-xl border border-white/15 bg-white/5 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/40 focus:border-gold focus:ring-2 focus:ring-gold/20";

export default function AuthPage({ initialMode = "member" }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const cfg = MODES[mode];

  function switchMode(next) {
    setMode(next);
    setEmail("");
    setPassword("");
    setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const session = login(email, password);
      if (session.role !== mode) {
        throw new Error(
          mode === "admin"
            ? "That account doesn't have admin access."
            : "That account isn't a member account — try the admin sign in.",
        );
      }
      onAuthed(session);
      navigate(session.role === "admin" ? "/admin" : "/account", {
        replace: true,
      });
    } catch (err) {
      setError(err.message);
    }
  }

  const isDark = cfg.card === "dark";

  return (
    <div className="flex min-h-screen flex-col bg-sand">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-3 lg:gap-6">
            <BackLink
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-navy/5 px-3.5 py-2 text-sm font-semibold text-navy transition-colors hover:bg-navy/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </BackLink>
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="Nyakahura Elites"
                className="h-10 w-10 rounded-full object-contain"
              />
              <span className="hidden font-serif text-lg font-bold text-navy sm:inline">
                Nyakahura Elites
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-14">
        <div className="w-full max-w-md">
          <div className="rounded-[28px] bg-white/60 p-2.5 ring-1 ring-navy/5 backdrop-blur">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => switchMode("member")}
                aria-pressed={mode === "member"}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                  mode === "member"
                    ? "bg-navy text-white shadow-sm"
                    : "text-navy/60 hover:text-navy"
                }`}
              >
                <Users className="h-4 w-4" />
                Member
              </button>
              <button
                type="button"
                onClick={() => switchMode("admin")}
                aria-pressed={mode === "admin"}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                  mode === "admin"
                    ? "bg-gold-dark text-white shadow-sm"
                    : "text-navy/60 hover:text-navy"
                }`}
              >
                <Shield className="h-4 w-4" />
                Admin
              </button>
            </div>
          </div>

          <div
            className={`mt-5 rounded-3xl p-8 ring-1 sm:p-10 ${
              isDark
                ? "bg-navy text-white ring-white/10 shadow-xl shadow-navy/30"
                : "bg-white text-navy ring-navy/5 shadow-sm"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${
                  isDark
                    ? "bg-gold/20 text-gold"
                    : "bg-gold/15 text-gold-dark"
                }`}
              >
                <cfg.icon className="h-6 w-6" />
              </div>
              <div>
                <p
                  className={`text-xs font-bold uppercase tracking-[0.2em] ${
                    isDark ? "text-gold" : "text-gold-dark"
                  }`}
                >
                  {cfg.key === "admin" ? "Admin Console" : "Member Portal"}
                </p>
                <h1 className="mt-1 font-serif text-2xl font-bold sm:text-3xl">
                  {cfg.heading}
                </h1>
              </div>
            </div>

            <p
              className={`mt-4 text-sm leading-relaxed ${
                isDark ? "text-white/70" : "text-navy/70"
              }`}
            >
              {cfg.blurb}
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label
                  className={`block text-sm font-semibold ${isDark ? "text-white" : "text-navy"}`}
                  htmlFor="auth-email"
                >
                  Email address
                </label>
                <div className="relative mt-2">
                  <Mail
                    className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${
                      isDark ? "text-white/40" : "text-navy/40"
                    }`}
                  />
                  <input
                    id="auth-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={isDark ? inputDark : inputLight}
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-semibold ${isDark ? "text-white" : "text-navy"}`}
                  htmlFor="auth-password"
                >
                  Password
                </label>
                <div className="relative mt-2">
                  <Lock
                    className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${
                      isDark ? "text-white/40" : "text-navy/40"
                    }`}
                  />
                  <input
                    id="auth-password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={isDark ? inputDark : inputLight}
                  />
                </div>
              </div>

              {error && (
                <p
                  className={`rounded-xl px-4 py-3 text-sm font-medium ring-1 ${
                    isDark
                      ? "bg-red-500/15 text-red-200 ring-red-400/30"
                      : "bg-red-50 text-red-700 ring-red-200"
                  }`}
                  role="alert"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white transition-colors ${cfg.accent} ${cfg.accentHover}`}
              >
                {cfg.cta}
                <LogIn className="h-4 w-4" />
              </button>
            </form>
          </div>

          <div
            className={`mt-5 rounded-2xl p-5 ring-1 ${
              isDark ? "bg-navy ring-white/10" : "bg-white/70 ring-navy/5"
            }`}
          >
            <p
              className={`text-xs font-bold uppercase tracking-wider ${
                isDark ? "text-gold" : "text-navy/50"
              }`}
            >
              {cfg.demoLabel}
            </p>
            <p
              className={`mt-1.5 text-xs ${
                isDark ? "text-white/80" : "text-navy/70"
              }`}
            >
              <span className="font-semibold">{cfg.demo.split(" / ")[0]}</span>
              {" / "}
              {cfg.demo.split(" / ")[1]}
            </p>
          </div>

          <p
            className={`mt-6 text-center text-xs leading-relaxed ${
              isDark ? "text-navy/60" : "text-navy/50"
            }`}
          >
            Membership is by invitation only. Need help? Contact the group
            leadership.
          </p>
        </div>
      </main>

      <footer className="border-t border-black/5 bg-white/70 px-6 py-6 text-center text-xs text-navy/50">
        Nyakahura Elites — growing together, giving back.
      </footer>
    </div>
  );
}