import { useMemo, useState } from "react";
import {
  GraduationCap,
  Plus,
  X,
  CalendarDays,
  CheckCircle2,
  Ban,
} from "lucide-react";
import {
  getEvents,
  addEvent,
  updateEvent,
  KES,
} from "../../lib/store";
import { MENTORSHIP_SCHOOLS } from "../../data/seed";
import { EVENT_STATUS_LABEL, EVENT_STATUS_STYLE } from "./status";

function fmtDate(d) {
  if (!d) return "—";
  const date = new Date(d + "T00:00:00");
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const DEFAULT_PROGRAM = [
  "Arrival & introductions",
  "Career talks & role models",
  "Lives of the group & saving culture",
  "Q&A with the learners",
  "Token handover & photos",
];

const inputCls =
  "w-full rounded-xl border border-navy/10 bg-white px-3.5 py-2.5 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10";

export default function MentorshipTab({ onChanged }) {
  const [refresh, setRefresh] = useState(0);
  const [planningSchool, setPlanningSchool] = useState("");

  const events = useMemo(() => getEvents(), [refresh, onChanged]);
  const mentor = events.filter((e) => e.type === "Mentorship");
  const year = new Date().getFullYear();

  const bySchool = MENTORSHIP_SCHOOLS.map((school) => {
    const list = mentor
      .filter((e) => e.school === school)
      .sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    const current = list.filter(
      (e) => e.date?.startsWith(String(year)) && e.status !== "completed" && e.status !== "cancelled",
    )[0] || null;
    const history = list.filter((e) => e.status === "completed");
    const planned = list.filter((e) => e.status !== "completed" && e.status !== "cancelled");
    return { school, current, history, planned };
  });

  const plannedCount = bySchool.reduce((n, s) => n + s.planned.length, 0);
  const completedCount = bySchool.reduce((n, s) => n + s.history.length, 0);

  const step = (e, status) => {
    updateEvent(e.id, { status });
    setRefresh((n) => n + 1);
    onChanged?.();
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
          <p className="text-sm text-white/60">Partner schools</p>
          <p className="mt-2 font-serif text-3xl font-bold text-gold">{MENTORSHIP_SCHOOLS.length}</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
          <p className="text-sm text-white/60">Planned for {year}</p>
          <p className="mt-2 font-serif text-3xl font-bold text-white">{plannedCount}</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
          <p className="text-sm text-white/60">Visits completed</p>
          <p className="mt-2 font-serif text-3xl font-bold text-white">{completedCount}</p>
        </div>
      </div>

      <p className="rounded-2xl bg-white/5 p-4 text-sm text-white/70 ring-1 ring-white/10">
        The group runs an annual mentorship outreach to three neighbourhood schools.
        Plan one visit per school each year and mark it completed once the visit is done.
      </p>

      <div className="grid gap-6 lg:grid-cols-3">
        {bySchool.map(({ school, current, history, planned }) => (
          <section key={school} className="rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green/15 text-green">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-serif text-lg font-bold leading-tight text-navy">{school}</p>
                  <p className="mt-1 text-xs text-navy/50">
                    Annual visit · {year}
                  </p>
                </div>
              </div>
              {!current && (
                <button
                  onClick={() => setPlanningSchool(planningSchool === school ? "" : school)}
                  className="inline-flex items-center gap-1 rounded-full bg-green px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-dark"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {planningSchool === school ? "Close" : "Plan visit"}
                </button>
              )}
            </div>

            {planningSchool === school && (
              <div className="mt-5 rounded-2xl bg-sand p-4">
                <PlanVisitForm
                  school={school}
                  year={year}
                  onCancel={() => setPlanningSchool("")}
                  onDone={() => {
                    setPlanningSchool("");
                    setRefresh((n) => n + 1);
                    onChanged?.();
                  }}
                />
              </div>
            )}

            <div className="mt-5">
              {current ? (
                <div className="rounded-2xl bg-sand p-4 ring-1 ring-navy/5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                        EVENT_STATUS_STYLE[current.status] || EVENT_STATUS_STYLE.planned
                      }`}
                    >
                      {EVENT_STATUS_LABEL[current.status] || "Planned"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-navy/50">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {fmtDate(current.date)}
                    </span>
                  </div>
                  <p className="mt-2 font-serif text-base font-bold text-navy">{current.title}</p>
                  {current.budget?.length > 0 && (
                    <p className="text-xs text-navy/50">
                      {KES(current.budget.reduce((s, b) => s + Number(b.est || 0), 0))} budgeted
                    </p>
                  )}
                  <div className="mt-3 space-y-1.5">
                    {current.status === "planned" && (
                      <>
                        <ActionBtn onClick={() => step(current, "completed")} cls="bg-green text-white hover:bg-green-dark">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Mark visit completed
                        </ActionBtn>
                        <ActionBtn
                          onClick={() => {
                            if (window.confirm(`Cancel "${current.title}"?`)) step(current, "cancelled");
                          }}
                          cls="bg-navy/5 text-navy hover:bg-navy/10"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          Mark cancelled
                        </ActionBtn>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <p className="rounded-2xl bg-sand px-4 py-6 text-center text-sm text-navy/50">
                  No visit planned for {year} yet. Use "Plan visit" to schedule it.
                </p>
              )}
            </div>

            {history.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-navy/40">Past visits</p>
                <ul className="mt-2 space-y-1.5">
                  {[...history].reverse().map((h) => (
                    <li key={h.id} className="flex items-center justify-between rounded-xl bg-sand px-3 py-2 text-xs text-navy/70">
                      <span>{h.date?.slice(0, 4)} · {h.title.replace(/^Mentorship Day \d{4} — /, "")}</span>
                      <span className="text-green">Completed</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {planned.length > 0 && history.length === 0 && current === null && (
              <p className="mt-4 text-xs text-navy/40">No visits recorded yet.</p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

function ActionBtn({ onClick, cls, children }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${cls}`}
    >
      {children}
    </button>
  );
}

function PlanVisitForm({ school, year, onCancel, onDone }) {
  const [form, setForm] = useState({
    type: "Mentorship",
    school,
    title: "",
    date: "",
    time: "09:00",
    venue: school,
    goal: "Annual mentorship visit — career talks and group savings culture.",
    details: "",
    contact: "Simon Kamau",
    program: DEFAULT_PROGRAM,
    budget: [{ label: "Tokens & refreshments", est: 10000 }],
    recurring: "annual",
    status: "planned",
  });
  const [msg, setMsg] = useState("");

  const save = () => {
    if (!form.date) {
      setMsg("Pick a date for the visit.");
      return;
    }
    addEvent({
      ...form,
      title: form.title.trim() || `Mentorship Day ${year} — ${school}`,
    });
    setMsg("Visit planned for this school.");
    onDone();
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-wider text-navy/50">
        Plan {year} visit — {school}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-navy/50">Date</span>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className={`${inputCls} mt-1`}
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-navy/50">Time</span>
          <input
            type="time"
            value={form.time}
            onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
            className={`${inputCls} mt-1`}
          />
        </label>
      </div>
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wider text-navy/50">Plan notes</span>
        <textarea
          rows={2}
          value={form.details}
          onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
          placeholder="Timing with the school head, tokens, transport…"
          className={`${inputCls} mt-1`}
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={save}
          className="inline-flex items-center gap-2 rounded-full bg-gold-dark px-5 py-2.5 text-sm font-semibold text-white hover:bg-gold"
        >
          <CheckCircle2 className="h-4 w-4" />
          Save visit plan
        </button>
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-full bg-navy/5 px-4 py-2.5 text-sm font-semibold text-navy hover:bg-navy/10"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
        {msg && <p className="text-xs font-medium text-navy/60">{msg}</p>}
      </div>
      <p className="text-[11px] text-navy/40">
        The full programme defaults to the standard mentorship itinerary; adjust any
        visit later from the "Events & drives" tab.
      </p>
    </div>
  );
}