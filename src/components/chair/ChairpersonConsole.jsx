import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Crown,
  LayoutDashboard,
  Stamp,
  CalendarDays,
  Megaphone,
  Wallet,
  MapPin,
  Clock,
  CheckCircle2,
} from "lucide-react";
import {
  getMember,
  getActiveMembers,
  getPoolStats,
  getCashPosition,
  getMeetings,
  getNextMeeting,
  getMinutes,
  updateMinutes,
} from "../../lib/store";
import BackToLogin from "../BackToLogin";
import ThemeToggle from "../ThemeToggle";
import RoleMandate from "../RoleMandate";
import useTabNavigation from "../../lib/useTabNavigation";
import AnnouncementsTab from "../secretary/AnnouncementsTab";
import FinancesMembers from "./FinancesMembers";

function fmtDate(d) {
  const date = new Date(d + "T00:00:00");
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function KES(n) {
  return "KES " + Number(n || 0).toLocaleString("en-KE");
}

const TABS = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "finances", label: "Finances & members", icon: Wallet },
  { key: "minutes", label: "Minutes & approvals", icon: Stamp },
  { key: "meetings", label: "Meetings", icon: CalendarDays },
  { key: "announcements", label: "Announcements", icon: Megaphone },
];

export default function ChairpersonConsole({ session, onLogout }) {
  const navigate = useNavigate();
  const { tab, goTab, tabBack } = useTabNavigation("overview", {
    onBackAtRoot: () => {
      onLogout();
      navigate("/chairperson", { replace: true });
    },
  });
  const [refresh, setRefresh] = useState(0);

  const members = getActiveMembers();
  const pool = getPoolStats();
  const cash = getCashPosition();
  const meetings = getMeetings();
  const next = getNextMeeting();
  const minutes = getMinutes();
  const awaiting = minutes.filter((m) => m.status === "draft");
  const holder = session.relatedMemberId ? getMember(session.relatedMemberId) : null;

  return (
    <div className="min-h-screen bg-navy">
      <header className="border-b border-white/10 bg-navy/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-3 lg:gap-6">
            <BackToLogin
              to="/chairperson"
              onLogout={onLogout}
              onTabBack={tabBack}
              signOutAtRoot
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Back
            </BackToLogin>
            <div className="flex items-center gap-3">
              <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-gold/20 text-gold sm:inline-flex">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <p className="font-serif text-lg font-bold text-white">
                  Chairperson Portal
                </p>
                <p className="hidden text-xs text-white/50 sm:block">
                  Leadership & official representation · Nyakahura Elites
                </p>
              </div>
            </div>
          </div>
          <ThemeToggle className="text-white hover:bg-white/10" />
          <button
            onClick={onLogout}
            className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
          >
            Sign out
          </button>
        </div>
      </header>

      <nav className="mx-auto mt-8 max-w-7xl px-6 lg:px-10">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => goTab(t.key)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? `bg-gold-dark text-white ${" "}`
                    : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Active members" value={members.length} />
              <Stat label="Savings pool" value={KES(pool.savingsPool)} />
              <Stat label="Liquid (bank + MMF)" value={KES(cash.liquid)} />
              <Stat
                label={awaiting.length ? "Minutes to approve" : "Minutes approved"}
                value={awaiting.length || minutes.filter((m) => m.status === "approved").length}
                tone={awaiting.length ? "gold" : "green"}
              />
            </div>

            {next ? (
              <section className="rounded-3xl bg-white p-6 text-navy shadow-xl sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-dark">
                      Next meeting
                    </p>
                    <h2 className="mt-1 font-serif text-xl font-bold">
                      {next.title}
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-navy/70">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4 text-navy/40" />
                        {fmtDate(next.date)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-navy/40" />
                        {next.time}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-navy/40" />
                        {next.venue}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => goTab("meetings")}
                    className="inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-light"
                  >
                    View meetings
                  </button>
                </div>
              </section>
            ) : (
              <section className="rounded-3xl bg-white/5 p-6 text-center text-white/60 ring-1 ring-white/10">
                No upcoming meetings scheduled.
              </section>
            )}
            <div className="pt-4">
              <RoleMandate roleKey="chairperson" holder={holder} />
            </div>
          </div>
        )}

        {tab === "finances" && (
          <FinancesMembers onChanged={() => setRefresh((n) => n + 1)} />
        )}

        {tab === "minutes" && (
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-white">
              Minutes & approvals
            </h2>
            {minutes.length === 0 && (
              <p className="rounded-2xl bg-white/5 p-6 text-sm text-white/60 ring-1 ring-white/10">
                No minutes recorded yet.
              </p>
            )}
            {minutes.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-serif font-bold text-white">{m.title}</p>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          m.status === "approved"
                            ? "bg-green/15 text-green"
                            : "bg-gold/15 text-gold"
                        }`}
                      >
                        {m.status === "approved" ? "Approved" : "Draft"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-white/60">{fmtDate(m.date)}</p>
                  </div>
                  {m.status === "draft" && (
                    <button
                      onClick={() => {
                        updateMinutes(m.id, { status: "approved" });
                        setRefresh((n) => n + 1);
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-green px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-dark"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Approve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "meetings" && (
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-white">
              Meetings
            </h2>
            {meetings.length === 0 && (
              <p className="rounded-2xl bg-white/5 p-6 text-sm text-white/60 ring-1 ring-white/10">
                No meetings recorded yet.
              </p>
            )}
            {meetings.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10"
              >
                <p className="font-serif font-bold text-white">{m.title}</p>
                <p className="mt-1 text-sm text-white/60">{fmtDate(m.date)}</p>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-white/50">
                  <MapPin className="h-3.5 w-3.5" />
                  {m.venue}
                  <span className="ml-1 inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {m.time}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}

        {tab === "announcements" && (
          <AnnouncementsTab onChanged={() => setRefresh((n) => n + 1)} />
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, tone = "white" }) {
  return (
    <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
      <p className="text-sm text-white/60">{label}</p>
      <p
        className={`mt-2 font-serif text-3xl font-bold ${
          tone === "gold" ? "text-gold" : tone === "green" ? "text-green" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}