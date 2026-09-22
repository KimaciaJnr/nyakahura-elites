import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Lock,
  Mail,
  LogIn,
  ArrowLeft,
  Shield,
  Users,
  Wallet,
  FileText,
  Crown,
  UserCog,
  Megaphone,
  Landmark,
  UserRound,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import BackLink from "../components/BackLink";
import ThemeToggle from "../components/ThemeToggle";
import { MEMBER_ROLE, OFFICIAL_ROLES, getRoleHome } from "../data/roles";

const ICONS = {
  member: Users,
  chairperson: Crown,
  vicechairperson: UserCog,
  organising: Megaphone,
  secretary: FileText,
  treasurer: Wallet,
  admin: Shield,
};

const accentFor = (card) =>
  card === "dark"
    ? {
        cardCls: "bg-navy text-white ring-white/10 shadow shadow-navy/30",
        label: "text-gold",
        sub: "text-white/70",
      }
    : {
        cardCls: "bg-white text-navy ring-navy/5 shadow-sm",
        label: "text-gold-dark",
        sub: "text-navy/70",
      };

const inputLight =
  "w-full rounded-xl border border-navy/10 py-3 pl-10 pr-4 text-sm text-navy outline-none placeholder:text-navy/40 focus:border-navy focus:ring-2 focus:ring-navy/10";
const inputDark =
  "w-full rounded-xl border border-white/15 bg-white/5 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/40 focus:border-gold focus:ring-2 focus:ring-gold/20";

export default function AuthPage({ initialMode = "member" }) {
  const isOfficerInit = OFFICIAL_ROLES.some((r) => r.key === initialMode);
  const [section, setSection] = useState(isOfficerInit ? "officials" : "member");
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const officer = OFFICIAL_ROLES.some((r) => r.key === initialMode);
    setSection(officer ? "officials" : "member");
    setMode(initialMode);
    setEmail("");
    setPassword("");
    setError("");
  }, [initialMode]);

  const isOfficials = section === "officials";
  const activeRole = OFFICIAL_ROLES.find((r) => r.key === mode) || null;

  function selectOfficer(key) {
    setMode(key);
    setError("");
    const role = OFFICIAL_ROLES.find((r) => r.key === key);
    const [demoEmail, demoPassword] = (role?.demo || " / ").split(" / ");
    setEmail(demoEmail || "");
    setPassword(demoPassword || "");
  }

  function switchSection(next) {
    setSection(next);
    setError("");
    if (next === "member") {
      setMode("member");
      setEmail("");
      setPassword("");
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const session = login(email, password);
      const expected = isOfficials ? activeRole.key : "member";

      if (session.role !== expected) {
        throw new Error(
          `That account doesn't have ${expected} access — use the matching sign-in above.`,
        );
      }

      navigate(getRoleHome(session.role), { replace: true });
    } catch (err) {
      setError(err.message || "Unable to sign in with those credentials.");
    }
  }

  const jane = activeRole && activeRole.card === "dark" ? "dark" : "light";
  const tones = accentFor(jane);

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
                className="h-10 w-10 rounded-full object-cover ring-1 ring-navy/10"
              />
              <span className="hidden font-serif text-lg font-bold text-navy sm:inline">
                Nyakahura Elites
              </span>
            </Link>
          </div>
          <ThemeToggle className="text-navy hover:bg-navy/10" />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-14">
        <div className="w-full max-w-xl">
          <div className="rounded-[28px] bg-white/60 p-2.5 ring-1 ring-navy/5 backdrop-blur">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => switchSection("member")}
                aria-pressed={!isOfficials}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                  !isOfficials
                    ? "bg-navy text-white shadow-sm"
                    : "text-navy/60 hover:text-navy"
                }`}
              >
                <UserRound className="h-4 w-4" />
                Member login
              </button>
              <button
                type="button"
                onClick={() => {
                  if (section !== "officials") {
                    setSection("officials");
                    if (mode === "member") selectOfficer("chairperson");
                  }
                }}
                aria-pressed={isOfficials}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                  isOfficials
                    ? "bg-gold-dark text-white shadow-sm"
                    : "text-navy/60 hover:text-navy"
                }`}
              >
                <Landmark className="h-4 w-4" />
                Elected officials
              </button>
            </div>
          </div>

          {isOfficials && (
            <>
              <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {OFFICIAL_ROLES.map((role) => {
                  const Icon = ICONS[role.key];
                  const active = mode === role.key;
                  return (
                    <button
                      key={role.key}
                      type="button"
                      onClick={() => selectOfficer(role.key)}
                      aria-pressed={active}
                      className={`flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-colors ${
                        active
                          ? `${role.accent} border-transparent text-white shadow-sm`
                          : "border-navy/10 bg-white text-navy hover:bg-sand"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-sm font-semibold leading-tight">
                        {role.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 px-1 text-xs text-navy/50">
                Each office has its own portal for the office-holder. When a role
                is handed over, the same portal continues under the next elected
                official.
              </p>
            </>
          )}

          <div
            className={`mt-5 rounded-3xl p-8 ring-1 sm:p-10 ${tones.cardCls}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${
                  isOfficials
                    ? activeRole?.card === "dark"
                      ? "bg-gold/20 text-gold"
                      : "bg-gold/15 text-gold-dark"
                    : "bg-gold/15 text-gold-dark"
                }`}
              >
                {(() => {
                  const Icon = ICONS[
                    isOfficials ? activeRole.key : "member"
                  ];
                  return <Icon className="h-6 w-6" />;
                })()}
              </div>
              <div>
                <p className={`text-xs font-bold uppercase tracking-[0.2em] ${tones.label}`}>
                  {isOfficials ? activeRole.portalLabel : MEMBER_ROLE.portalLabel}
                </p>
                <h1 className="mt-1 font-serif text-2xl font-bold sm:text-3xl">
                  {isOfficials ? activeRole.heading : MEMBER_ROLE.heading}
                </h1>
              </div>
            </div>

            <p className={`mt-4 text-sm leading-relaxed ${tones.sub}`}>
              {isOfficials
                ? activeRole.blurb
                : "Members sign in with their own account to follow savings, fees, loans and announcements. A member who holds an office signs in under Elected officials instead."}
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label
                  className={`block text-sm font-semibold ${isOfficials && activeRole.card === "dark" ? "text-white" : "text-navy"}`}
                  htmlFor="auth-email"
                >
                  Email address or NE ID
                </label>
                <div className="relative mt-2">
                  <Mail
                    className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${
                      isOfficials && activeRole.card === "dark" ? "text-white/40" : "text-navy/40"
                    }`}
                  />
                  <input
                    id="auth-email"
                    type="text"
                    required
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com or NE-001"
                    className={isOfficials && activeRole.card === "dark" ? inputDark : inputLight}
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-semibold ${isOfficials && activeRole.card === "dark" ? "text-white" : "text-navy"}`}
                  htmlFor="auth-password"
                >
                  Password
                </label>
                <div className="relative mt-2">
                  <Lock
                    className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${
                      isOfficials && activeRole.card === "dark" ? "text-white/40" : "text-navy/40"
                    }`}
                  />
                  <input
                    id="auth-password"
                    type="password"
                    required
                    autoComplete="off"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={isOfficials && activeRole.card === "dark" ? inputDark : inputLight}
                  />
                </div>
              </div>

              {error && (
                <p
                  className={`rounded-xl px-4 py-3 text-sm font-medium ring-1 ${
                    isOfficials && activeRole.card === "dark"
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
                className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white transition-colors ${
                  isOfficials
                    ? `${activeRole.accent} ${activeRole.accentHover}`
                    : "bg-navy hover:bg-navy-light"
                }`}
              >
                {isOfficials ? activeRole.heading.replace(" login", "") : "Sign in"}
                <LogIn className="h-4 w-4" />
              </button>
            </form>
          </div>

          <div
            className={`mt-5 rounded-2xl p-5 ring-1 ${
              isOfficials && activeRole.card === "dark"
                ? "bg-navy ring-white/10"
                : "bg-white/70 ring-navy/5"
            }`}
          >
            <p
              className={`text-xs font-bold uppercase tracking-wider ${
                isOfficials && activeRole.card === "dark" ? "text-gold" : "text-navy/50"
              }`}
            >
              {isOfficials ? "Demo account" : "Member demo"}
            </p>
            <p
              className={`mt-1.5 text-xs ${
                isOfficials && activeRole.card === "dark" ? "text-white/80" : "text-navy/70"
              }`}
            >
              {isOfficials ? (
                activeRole.demo
              ) : (
                <>
                  <span className="font-semibold">david.muhia@example.com</span>{" "}
                  / password1 — any member account also works
                </>
              )}
            </p>
          </div>

          <p className="mt-6 text-center text-xs leading-relaxed text-navy/50">
            Need help? Contact the group leadership.
          </p>
        </div>
      </main>

      <footer className="border-t border-black/5 bg-white/70 px-6 py-6 text-center text-xs text-navy/50">
        Nyakahura Elites — growing together, giving back.
      </footer>
    </div>
  );
}