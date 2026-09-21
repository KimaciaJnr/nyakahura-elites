import { useMemo, useState } from "react";
import {
  CalendarDays,
  Users,
  PenLine,
  Trash2,
  Plus,
  X,
  Save,
  AlertOctagon,
  CalendarClock,
} from "lucide-react";
import {
  getMembers,
  getMeetings,
  addMeeting,
  updateMeeting,
  deleteMeeting,
  saveMeetingAttendance,
  finesFromAttendance,
  getMinutes,
} from "../../lib/store";

function fmtDate(d) {
  const date = new Date(d + "T00:00:00");
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const inputCls =
  "w-full rounded-xl border border-navy/10 bg-white px-3.5 py-2.5 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10";

function EmptyForm({ initial, onCancel, onSaved }) {
  const [form, setForm] = useState(
    initial || {
      title: "",
      date: "",
      time: "20:30",
      venue: "Google Meet",
      agenda: ["Opening & prayer", "Confirm previous minutes", "Savings & arrears update", "Investments update", "AOB"],
      minutesId: "",
    },
  );
  const [msg, setMsg] = useState("");
  const minutesOptions = useMemo(() => getMinutes(), []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setAgenda = (i, v) =>
    setForm((f) => ({ ...f, agenda: f.agenda.map((a, j) => (j === i ? v : a)) }));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-xs font-bold uppercase tracking-wider text-navy/50">Meeting title</span>
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Monthly Meeting Nov 2026"
            className={`${inputCls} mt-1.5`}
          />
        </label>
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
          <input value={form.venue} onChange={(e) => set("venue", e.target.value)} className={`${inputCls} mt-1.5`} />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-bold uppercase tracking-wider text-navy/50">Linked minutes (optional)</span>
          <select
            value={form.minutesId || ""}
            onChange={(e) => set("minutesId", e.target.value || null)}
            className={`${inputCls} mt-1.5`}
          >
            <option value="">— none yet —</option>
            {minutesOptions.map((m) => (
              <option key={m.id} value={m.id}>
                {fmtDate(m.meetingDate)} · {m.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-navy/50">Agenda</p>
        <div className="mt-2 space-y-2">
          {form.agenda.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-6 text-center text-xs font-bold text-navy/40">{i + 1}.</span>
              <input
                value={item}
                onChange={(e) => setAgenda(i, e.target.value)}
                className={inputCls}
              />
              <button
                onClick={() => setForm((f) => ({ ...f, agenda: f.agenda.filter((_, j) => j !== i) }))}
                className="rounded-full p-1.5 text-navy/40 hover:bg-red-50 hover:text-red-500"
                aria-label="Remove agenda item"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => setForm((f) => ({ ...f, agenda: [...f.agenda, ""] }))}
          className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-3 py-2 text-xs font-semibold text-navy hover:bg-navy/10"
        >
          <Plus className="h-3.5 w-3.5" />
          Add agenda item
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (!form.title.trim() || !form.date) {
              setMsg("Title and date are required.");
              return;
            }
            if (initial) {
              updateMeeting(initial.id, { ...form, minutesId: form.minutesId || null });
            } else {
              const created = addMeeting({
                ...form,
                minutesId: form.minutesId || null,
                president: "Marvin Karanja",
                secretary: "Susan Wambui",
              });
              setForm(created);
            }
            setMsg(initial ? "Meeting updated." : "Meeting scheduled.");
            onSaved?.();
          }}
          className="inline-flex items-center gap-2 rounded-full bg-gold-dark px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gold"
        >
          <Save className="h-4 w-4" />
          {initial ? "Save changes" : "Schedule meeting"}
        </button>
        <button
          onClick={onCancel}
          className="rounded-full bg-navy/5 px-5 py-3 text-sm font-semibold text-navy hover:bg-navy/10"
        >
          Cancel
        </button>
      </div>
      {msg && <p className="text-xs font-medium text-navy/60">{msg}</p>}
    </div>
  );
}

function AttendanceRegister({ meeting, onClose, onChanged }) {
  const members = useMemo(() => getMembers().filter((m) => m.role === "member"), []);
  const byName = Object.fromEntries(members.map((m) => [m.name, m.id]));
  const initial = meeting.attendance;

  const [state, setState] = useState(() => {
    const map = {};
    members.forEach((m) => {
      if (initial?.membersPresent?.includes(m.name)) map[m.id] = "present";
      else if (initial?.absentWithApology?.includes(m.name)) map[m.id] = "apology";
      else if (initial?.absentWithoutApology?.includes(m.name)) map[m.id] = "absent";
      else map[m.id] = "absent";
    });
    return map;
  });
  const [msg, setMsg] = useState("");
  const [finesMsg, setFinesMsg] = useState("");

  const setStatus = (id, status) => setState((s) => ({ ...s, [id]: status }));

  const present = members.filter((m) => state[m.id] === "present").map((m) => m.name);
  const apology = members.filter((m) => state[m.id] === "apology").map((m) => m.name);
  const absent = members.filter((m) => state[m.id] === "absent").map((m) => m.name);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy/60 p-4 backdrop-blur-sm sm:p-8">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-navy">
              Attendance — {meeting.title}
            </h2>
            <p className="text-sm text-navy/50">
              {fmtDate(meeting.date)} · tick each member's status then save.
            </p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-navy/40 hover:bg-navy/5" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-green/10 p-3 text-center">
            <p className="text-2xl font-bold text-green">{present.length}</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-navy/50">Present</p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-3 text-center">
            <p className="text-2xl font-bold text-amber-600">{apology.length}</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-navy/50">Absent w/ apology</p>
          </div>
          <div className="rounded-2xl bg-red-50 p-3 text-center">
            <p className="text-2xl font-bold text-red-500">{absent.length}</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-navy/50">Absent (fined)</p>
          </div>
        </div>

        <div className="mt-5 max-h-96 space-y-2 overflow-y-auto">
          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-sand px-4 py-2.5"
            >
              <div>
                <p className="text-sm font-semibold text-navy">{m.name}</p>
                <p className="text-[11px] text-navy/50">{m.memberNo}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {[
                  ["present", "Present", "bg-green text-white"],
                  ["apology", "Apology", "bg-amber-400 text-white"],
                  ["absent", "Absent", "bg-red-400 text-white"],
                ].map(([value, label, cls]) => (
                  <button
                    key={value}
                    onClick={() => setStatus(m.id, value)}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                      state[m.id] === value ? cls : "bg-navy/5 text-navy/50 hover:bg-navy/10"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              saveMeetingAttendance(meeting.id, {
                presentIds: present.map((n) => byName[n]),
                apologyIds: apology.map((n) => byName[n]),
                absentIds: absent.map((n) => byName[n]),
              });
              setMsg("Attendance saved.");
              onChanged();
            }}
            className="inline-flex items-center gap-2 rounded-full bg-green px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-dark"
          >
            <Save className="h-4 w-4" />
            Save attendance
          </button>
          <button
            onClick={() => {
              if (!meeting.attendance) {
                setFinesMsg("Save attendance first.");
                return;
              }
              if (absent.length === 0) {
                setFinesMsg("No members marked absent — no fines to generate.");
                return;
              }
              if (!window.confirm(`Generate fines for ${absent.length} absent member(s)?`)) return;
              const created = finesFromAttendance(meeting.id);
              setFinesMsg(`${created} fine(s) created in the fines register.`);
              onChanged();
            }}
            className="inline-flex items-center gap-2 rounded-full bg-gold-dark px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gold"
          >
            <AlertOctagon className="h-4 w-4" />
            Generate fines from absences
          </button>
        </div>
        {msg && <p className="mt-3 text-xs font-medium text-green">{msg}</p>}
        {finesMsg && <p className="mt-3 text-xs font-medium text-navy/60">{finesMsg}</p>}
      </div>
    </div>
  );
}

export default function MeetingsTab({ onChanged }) {
  const [refresh, setRefresh] = useState(0);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [registerFor, setRegisterFor] = useState(null);

  const meetings = useMemo(() => getMeetings(), [refresh, onChanged]);
  const meantime = getMeetings();

  const today = new Date().toISOString().slice(0, 10);
  const past = meetings.filter((m) => m.date < today);
  const upcoming = meetings.filter((m) => m.date >= today);
  const next = upcoming[upcoming.length - 1] || null;

  const editing = editingId ? meantime.find((m) => m.id === editingId) : null;

  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
          <p className="text-sm text-white/60">Meetings held</p>
          <p className="mt-2 font-serif text-3xl font-bold text-white">{past.length}</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
          <p className="text-sm text-white/60">Upcoming</p>
          <p className="mt-2 font-serif text-3xl font-bold text-gold">{upcoming.length}</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
          <p className="text-sm text-white/60">Next meeting</p>
          <p className="mt-2 font-serif text-2xl font-bold text-white">
            {next ? fmtDate(next.date) : "—"}
          </p>
        </div>
      </div>

      <section className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-navy">
              <CalendarDays className="h-5 w-5 text-gold-dark" />
              Meetings & agenda
            </h2>
            <p className="mt-1 text-sm text-navy/60">
              Schedule meetings, publish the agenda and keep a monthly calendar.
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
            {creating ? "Close form" : "Schedule meeting"}
          </button>
        </div>

        {(creating || editing) && (
          <div className="mt-6 rounded-2xl bg-sand p-5">
            <EmptyForm
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

        {upcoming.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-wider text-navy/40">
              Upcoming
            </p>
            <ul className="mt-2 space-y-2">
              {upcoming.map((m) => (
                <MeetingRow
                  key={m.id}
                  meeting={m}
                  onRegister={() => setRegisterFor(m.id)}
                  onEdit={() => {
                    setEditingId(m.id);
                    setCreating(false);
                  }}
                  onDelete={() => {
                    if (window.confirm(`Delete "${m.title}"?`)) {
                      deleteMeeting(m.id);
                      setRefresh((n) => n + 1);
                    }
                  }}
                />
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-wider text-navy/40">
            Past meetings
          </p>
          <ul className="mt-2 space-y-2">
            {past.map((m) => (
              <MeetingRow
                key={m.id}
                meeting={m}
                onRegister={() => setRegisterFor(m.id)}
                onEdit={() => {
                  setEditingId(m.id);
                  setCreating(false);
                }}
                onDelete={() => {
                  if (window.confirm(`Delete "${m.title}"?`)) {
                    deleteMeeting(m.id);
                    setRefresh((n) => n + 1);
                  }
                }}
              />
            ))}
            {past.length === 0 && (
              <li className="rounded-2xl bg-sand px-5 py-6 text-center text-sm text-navy/50">
                No meetings recorded yet.
              </li>
            )}
          </ul>
        </div>
      </section>

      {registerFor && (
        <AttendanceRegister
          meeting={meantime.find((m) => m.id === registerFor)}
          onClose={() => setRegisterFor(null)}
          onChanged={() => setRefresh((n) => n + 1)}
        />
      )}

      <p className="flex items-center gap-2 text-xs text-white/50">
        <CalendarClock className="h-4 w-4" />
        Fines generated from absences appear instantly in the Treasurer's "Fines
        & loans" tab.
      </p>
    </div>
  );
}

function MeetingRow({ meeting, onRegister, onEdit, onDelete }) {
  const today = new Date().toISOString().slice(0, 10);
  const isUpcoming = meeting.date >= today;
  const count = (list) => list?.length || 0;

  return (
    <li
      className={`rounded-2xl p-5 ring-1 ${
        isUpcoming ? "border-l-4 border-l-gold bg-sand ring-navy/5" : "bg-sand ring-navy/5"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                isUpcoming ? "bg-gold/15 text-gold-dark" : "bg-navy/5 text-navy/60"
              }`}
            >
              {isUpcoming ? "Upcoming" : "Held"}
            </span>
            {meeting.minutesId && (
              <span className="rounded-full bg-green/10 px-2.5 py-1 text-[11px] font-semibold text-green">
                Minutes linked
              </span>
            )}
            {meeting.attendance && (
              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                Attendance {count(meeting.attendance.membersPresent)}
              </span>
            )}
          </div>
          <p className="mt-2 font-serif text-lg font-bold text-navy">{meeting.title}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-navy/50">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {fmtDate(meeting.date)}
            </span>
            <span>at {meeting.time}</span>
            <span>· {meeting.venue}</span>
            <span>· {meeting.agenda.length} agenda items</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRegister}
            className="inline-flex items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-navy-light"
          >
            <Users className="h-3.5 w-3.5" />
            Attendance
          </button>
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
            aria-label="Delete meeting"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </li>
  );
}