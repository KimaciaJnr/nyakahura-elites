import { useState } from "react";
import {
  UserCog,
  LayoutDashboard,
  Ticket,
  CalendarCheck2,
  GraduationCap,
  CalendarDays,
  MapPin,
} from "lucide-react";
import {
  getMember,
  getEvents,
  getMeetings,
} from "../../lib/store";
import { useNavigate } from "react-router-dom";
import useTabNavigation from "../../lib/useTabNavigation";
import BackToLogin from "../BackToLogin";
import ThemeToggle from "../ThemeToggle";
import RoleMandate from "../RoleMandate";
import MeetingsTab from "../secretary/MeetingsTab";
import EventsTab from "./EventsTab";
import MentorshipTab from "./MentorshipTab";

const TABS = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "events", label: "Events & drives", icon: Ticket },
  { key: "meetings", label: "Meetings & agenda", icon: CalendarCheck2 },
  { key: "mentorship", label: "Mentorship", icon: GraduationCap },
];

function fmtDate(d) {
  if (!d) return "—";
  const date = new Date(d + "T00:00:00");
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

export default function OrganisingConsole({ session, onLogout }) {
  const navigate = useNavigate();
  const { tab, goTab, tabBack } = useTabNavigation("overview", {
    onBackAtRoot: () => {
      onLogout();
      navigate("/organising", { replace: true });
    },
  });
  const [refresh, setRefresh] = useState(0);

  const events = getEvents();
  const meetings = getMeetings();

  const today = new Date().toISOString().slice(0, 10);
  const upcomingEvents = events.filter(
    (e) => e.status !== "completed" && e.status !== "cancelled" && e.date >= today,
  );
  const completedEvents = events.filter((e) => e.status === "completed");
  const upcomingMeetings = meetings.filter((m) => m.date >= today);
  const nextMeeting = upcomingMeetings[upcomingMeetings.length - 1] || null;

  const holder = session.relatedMemberId ? getMember(session.relatedMemberId) : null;

  return (
    <div className="min-h-screen bg-navy">
      <header className="border-b border-white/10 bg-navy/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-3 lg:gap-6">
            <BackToLogin
              to="/organising"
              onLogout={onLogout}
              onTabBack={tabBack}
              signOutAtRoot
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Back
            </BackToLogin>
            <div className="flex items-center gap-3">
              <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-green/20 text-green sm:inline-flex">
                <UserCog className="h-5 w-5" />
              </div>
              <div>
                <p className="font-serif text-lg font-bold text-white">
                  Organising Secretary Portal
                </p>
                <p className="hidden text-xs text-white/50 sm:block">
                  Events, venues, mobilisation & mentorship · Nyakahura Elites
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

      <div className="mt-6 flex gap-2 overflow-x-auto px-6 lg:px-10">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => goTab(t.key)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-green text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                <p className="text-sm text-white/60">Upcoming events</p>
                <p className="mt-2 font-serif text-3xl font-bold text-gold">
                  {upcomingEvents.length}
                </p>
              </div>
              <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                <p className="text-sm text-white/60">Events completed</p>
                <p className="mt-2 font-serif text-3xl font-bold text-white">
                  {completedEvents.length}
                </p>
              </div>
              <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                <p className="text-sm text-white/60">Upcoming meetings</p>
                <p className="mt-2 font-serif text-3xl font-bold text-white">
                  {upcomingMeetings.length}
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <section className="rounded-3xl bg-white p-6 shadow-xl lg:col-span-2">
                <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-navy">
                  <CalendarDays className="h-5 w-5 text-gold-dark" />
                  Up next
                </h2>
                <ul className="mt-4 space-y-3">
                  {upcomingEvents.length === 0 && upcomingMeetings.length === 0 && (
                    <li className="rounded-2xl bg-sand px-5 py-6 text-center text-sm text-navy/50">
                      Nothing scheduled — plan an event or schedule a meeting.
                    </li>
                  )}
                  {upcomingMeetings.map((m) => (
                    <li
                      key={m.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-sand p-4 ring-1 ring-navy/5"
                    >
                      <div>
                        <p className="font-serif text-base font-bold text-navy">{m.title}</p>
                        <p className="mt-0.5 text-xs text-navy/50">
                          <CalendarDays className="mr-1 inline h-3.5 w-3.5" />
                          {fmtDate(m.date)} at {m.time} · {m.venue}
                        </p>
                      </div>
                      <span className="rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-gold-dark">
                        Meeting
                      </span>
                    </li>
                  ))}
                  {upcomingEvents.map((e) => (
                    <li
                      key={e.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-sand p-4 ring-1 ring-navy/5"
                    >
                      <div>
                        <p className="font-serif text-base font-bold text-navy">{e.title}</p>
                        <p className="mt-0.5 text-xs text-navy/50">
                          <CalendarDays className="mr-1 inline h-3.5 w-3.5" />
                          {fmtDate(e.date)}
                          {e.time ? ` at ${e.time}` : ""}
                          {e.venue && (
                            <>
                              {" "}· <MapPin className="mr-0.5 inline h-3.5 w-3.5 text-navy/40" />
                              {e.venue}
                            </>
                          )}
                        </p>
                      </div>
                      <span className="rounded-full bg-green/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-green">
                        {e.type}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <div className="space-y-6">
                <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                  <p className="text-sm text-white/60">Next meeting</p>
                  <p className="mt-2 font-serif text-2xl font-bold text-white">
                    {nextMeeting ? fmtDate(nextMeeting.date) : "—"}
                  </p>
                  {nextMeeting && (
                    <p className="mt-1 text-xs text-white/50">
                      {nextMeeting.title} · {nextMeeting.time}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <RoleMandate roleKey="organising" holder={holder} />
          </div>
        )}
        {tab === "events" && <EventsTab onChanged={() => setRefresh((n) => n + 1)} />}
        {tab === "meetings" && <MeetingsTab onChanged={() => setRefresh((n) => n + 1)} />}
        {tab === "mentorship" && <MentorshipTab onChanged={() => setRefresh((n) => n + 1)} />}
      </main>
    </div>
  );
}