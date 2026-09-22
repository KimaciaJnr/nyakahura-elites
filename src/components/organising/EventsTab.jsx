import { useMemo, useState } from "react";
import {
  Ticket,
  Plus,
  X,
  Save,
  PenLine,
  Trash2,
  MapPin,
  CalendarDays,
  Clock,
  HandHeart,
  CheckCircle2,
  Ban,
} from "lucide-react";
import {
  getEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  KES,
} from "../../lib/store";
import { MENTORSHIP_SCHOOLS } from "../../data/seed";
import {
  EVENT_STATUS_LABEL,
  EVENT_STATUS_STYLE,
} from "./status";

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

const inputCls =
  "w-full rounded-xl border border-navy/10 bg-white px-3.5 py-2.5 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10";

const emptyEvent = {
  title: "",
  type: "Fun Day",
  date: "",
  time: "",
  venue: "",
  school: "",
  goal: "",
  details: "",
  contact: "",
  program: [],
  budget: [],
  recurring: "",
  status: "planned",
};

export default function EventsTab({ onChanged }) {
  const [refresh, setRefresh] = useState(0);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const events = useMemo(() => getEvents(), [refresh, onChanged]);
  const editing = editingId ? getEvents().find((e) => e.id === editingId) : null;

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter(
    (e) => e.status !== "completed" && e.status !== "cancelled" && e.date >= today,
  );
  const planned = events.filter((e) => e.status === "planned");
  const completed = events.filter((e) => e.status === "completed");

  const budgetTotal = (e) => (e.budget || []).reduce((sum, b) => sum + Number(b.est || 0), 0);

  const step = (e, status) => {
    updateEvent(e.id, { status });
    setRefresh((n) => n + 1);
    onChanged?.();
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
          <p className="text-sm text-white/60">Upcoming events</p>
          <p className="mt-2 font-serif text-3xl font-bold text-gold">{upcoming.length}</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
          <p className="text-sm text-white/60">Events planned</p>
          <p className="mt-2 font-serif text-3xl font-bold text-gold">{planned.length}</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
          <p className="text-sm text-white/60">Completed</p>
          <p className="mt-2 font-serif text-3xl font-bold text-white">{completed.length}</p>
        </div>
      </div>

      <section className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-navy">
              <Ticket className="h-5 w-5 text-gold-dark" />
              Events, functions & drives
            </h2>
            <p className="mt-1 text-sm text-navy/60">
              Plan venues, quotes and the programme. The Secretary publishes the
              official notices to members.
            </p>
          </div>
          <button
            onClick={() => {
              setCreating((c) => !c);
              setEditingId(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-gold-dark px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold"
          >
            <Plus className="h-4 w-4" />
            {creating ? "Close form" : "Plan new event"}
          </button>
        </div>

        {(creating || editing) && (
          <div className="mt-6 rounded-2xl bg-sand p-5">
            <EventForm
              key={editing ? editing.id : "new"}
              initial={editing || null}
              onCancel={() => {
                setCreating(false);
                setEditingId(null);
              }}
              onSaved={() => {
                setCreating(false);
                setEditingId(null);
                setRefresh((n) => n + 1);
                onChanged?.();
              }}
            />
          </div>
        )}

        {events.length === 0 ? (
          <p className="mt-6 rounded-2xl bg-sand px-5 py-8 text-center text-sm text-navy/50">
            No events yet. Click "Plan new event" to start planning.
          </p>
        ) : (
          <ul className="mt-6 space-y-3">
            {events.map((e) => (
              <EventRow
                key={e.id}
                event={e}
                budgetTotal={budgetTotal(e)}
                onStep={step}
                onEdit={() => {
                  setEditingId(e.id);
                  setCreating(false);
                }}
                onDelete={() => {
                  if (window.confirm(`Delete "${e.title}"? This cannot be undone.`)) {
                    deleteEvent(e.id);
                    setRefresh((n) => n + 1);
                    onChanged?.();
                  }
                }}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function EventRow({ event: e, budgetTotal, onStep, onEdit, onDelete }) {
  const today = new Date().toISOString().slice(0, 10);
  const isUpcoming = e.date >= today;

  return (
    <li className="rounded-2xl bg-sand p-5 ring-1 ring-navy/5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-navy/5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-navy/60">
              {e.type}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                EVENT_STATUS_STYLE[e.status] || EVENT_STATUS_STYLE.planned
              }`}
            >
              {EVENT_STATUS_LABEL[e.status] || "Planned"}
            </span>
            {isUpcoming && e.status !== "completed" && e.status !== "cancelled" && (
              <span className="rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-gold-dark">
                Upcoming
              </span>
            )}
          </div>
          {e.school && (
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-navy/40">
              {e.school}
            </p>
          )}
          <p className="mt-1 font-serif text-lg font-bold text-navy">{e.title}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-navy/50">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {fmtDate(e.date)}
            </span>
            {e.time && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {e.time}
              </span>
            )}
            {e.venue && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {e.venue}
              </span>
            )}
            {e.budget?.length > 0 && (
              <span className="font-semibold text-navy/70">{KES(budgetTotal)} budgeted</span>
            )}
          </p>
          {e.goal && (
            <p className="mt-2 text-sm leading-relaxed text-navy/70">{e.goal}</p>
          )}
          {e.program?.length > 0 && (
            <details className="mt-3">
              <summary className="cursor-pointer text-xs font-bold uppercase tracking-wider text-navy/40">
                Programme ({e.program.length})
              </summary>
              <ol className="mt-2 list-decimal space-y-0.5 pl-5 text-xs text-navy/60 marker:text-navy/40">
                {e.program.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </details>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {e.status === "planned" && (
            <>
              <WorkflowButton
                onClick={() => onStep(e, "completed")}
                cls="inline-flex items-center gap-1.5 rounded-full bg-green px-4 py-2 text-xs font-semibold text-white hover:bg-green-dark"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Mark completed
              </WorkflowButton>
              <WorkflowButton
                onClick={() => {
                  if (window.confirm(`Cancel "${e.title}"?`)) onStep(e, "cancelled");
                }}
                cls="inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-4 py-2 text-xs font-semibold text-navy hover:bg-navy/10"
              >
                <Ban className="h-3.5 w-3.5" />
                Mark cancelled
              </WorkflowButton>
            </>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-4 py-2 text-xs font-semibold text-navy hover:bg-navy/10"
            >
              <PenLine className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              onClick={onDelete}
              className="rounded-full p-2 text-navy/40 hover:bg-red-50 hover:text-red-500"
              aria-label="Delete event"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

// Thin wrapper so the workflow buttons above read cleanly.
function WorkflowButton({ onClick, cls, children }) {
  return (
    <button onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export function EventForm({ initial, onCancel, onSaved }) {
  const [form, setForm] = useState(
    initial
      ? {
          ...emptyEvent,
          ...initial,
          program: initial.program || [],
          budget: initial.budget || [],
        }
      : emptyEvent,
  );
  const [msg, setMsg] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setProgram = (i, v) =>
    setForm((f) => ({ ...f, program: f.program.map((a, j) => (j === i ? v : a)) }));
  const setBudget = (i, v) =>
    setForm((f) => ({ ...f, budget: f.budget.map((b, j) => (j === i ? b : v)) }));

  const save = () => {
    if (!form.title.trim() || !form.date) {
      setMsg("Title and date are required.");
      return;
    }
    const payload = {
      ...form,
      title: form.title.trim(),
      program: form.program.filter((s) => s.trim()),
      budget: form.budget.filter((b) => b.label.trim()),
    };
    if (initial) updateEvent(initial.id, payload);
    else addEvent(payload);
    setMsg(initial ? "Event updated." : "Event planned.");
    onSaved?.();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-xs font-bold uppercase tracking-wider text-navy/50">Event title</span>
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Elites Fun Day 2026"
            className={`${inputCls} mt-1.5`}
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-navy/50">Type</span>
          <select value={form.type} onChange={(e) => set("type", e.target.value)} className={`${inputCls} mt-1.5`}>
            {["Fun Day", "Mentorship", "Fundraiser", "Outreach", "AGM & function", "Other"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        {form.type === "Mentorship" && (
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-navy/50">School</span>
            <select value={form.school} onChange={(e) => set("school", e.target.value)} className={`${inputCls} mt-1.5`}>
              <option value="">— select school —</option>
              {MENTORSHIP_SCHOOLS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-navy/50">Date</span>
          <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className={`${inputCls} mt-1.5`} />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-navy/50">Time</span>
          <input type="time" value={form.time} onChange={(e) => set("time", e.target.value)} className={`${inputCls} mt-1.5`} />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-bold uppercase tracking-wider text-navy/50">Venue</span>
          <input
            value={form.venue}
            onChange={(e) => set("venue", e.target.value)}
            placeholder="e.g. Rolfs Place, Ngong Road"
            className={`${inputCls} mt-1.5`}
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-navy/50">Goal</span>
          <input
            value={form.goal}
            onChange={(e) => set("goal", e.target.value)}
            placeholder="Why are we holding this?"
            className={`${inputCls} mt-1.5`}
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-navy/50">Co-ordination contact</span>
          <input
            value={form.contact}
            onChange={(e) => set("contact", e.target.value)}
            placeholder="Who do suppliers contact?"
            className={`${inputCls} mt-1.5`}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-bold uppercase tracking-wider text-navy/50">Details / plan notes</span>
          <textarea
            rows={3}
            value={form.details}
            onChange={(e) => set("details", e.target.value)}
            placeholder="Quotes, logistics, approvals, notes…"
            className={`${inputCls} mt-1.5`}
          />
        </label>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-navy/50">Programme / agenda</p>
        <div className="mt-2 space-y-2">
          {form.program.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-6 text-center text-xs font-bold text-navy/40">{i + 1}.</span>
              <input
                value={item}
                onChange={(e) => setProgram(i, e.target.value)}
                placeholder="e.g. Group games & tug of war"
                className={inputCls}
              />
              <button
                onClick={() => setForm((f) => ({ ...f, program: f.program.filter((_, j) => j !== i) }))}
                className="rounded-full p-1.5 text-navy/40 hover:bg-red-50 hover:text-red-500"
                aria-label="Remove programme item"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => setForm((f) => ({ ...f, program: [...f.program, ""] }))}
          className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-3 py-2 text-xs font-semibold text-navy hover:bg-navy/10"
        >
          <Plus className="h-3.5 w-3.5" />
          Add programme item
        </button>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-navy/50">Budget & quotes (KES)</p>
        <div className="mt-2 space-y-2">
          {form.budget.map((b, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={b.label}
                onChange={(e) => setBudget(i, { ...b, label: e.target.value })}
                placeholder="Item (e.g. Tents)"
                className={`${inputCls} flex-1`}
              />
              <input
                type="number"
                value={b.est}
                onChange={(e) => setBudget(i, { ...b, est: Number(e.target.value) })}
                placeholder="0"
                className={`${inputCls} w-32`}
              />
              <button
                onClick={() => setForm((f) => ({ ...f, budget: f.budget.filter((_, j) => j !== i) }))}
                className="rounded-full p-1.5 text-navy/40 hover:bg-red-50 hover:text-red-500"
                aria-label="Remove budget line"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => setForm((f) => ({ ...f, budget: [...f.budget, { label: "", est: 0 }] }))}
          className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-3 py-2 text-xs font-semibold text-navy hover:bg-navy/10"
        >
          <Plus className="h-3.5 w-3.5" />
          Add budget line
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={save}
          className="inline-flex items-center gap-2 rounded-full bg-gold-dark px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gold"
        >
          <Save className="h-4 w-4" />
          {initial ? "Save changes" : "Plan event"}
        </button>
        <button
          onClick={onCancel}
          className="rounded-full bg-navy/5 px-5 py-3 text-sm font-semibold text-navy hover:bg-navy/10"
        >
          Cancel
        </button>
        {msg && <p className="text-xs font-medium text-navy/60">{msg}</p>}
      </div>

      <p className="flex items-center gap-2 text-xs text-navy/50">
        <HandHeart className="h-4 w-4" />
        Mentorship events you plan here appear under the "Mentorship" tab grouped by school.
      </p>
    </div>
  );
}