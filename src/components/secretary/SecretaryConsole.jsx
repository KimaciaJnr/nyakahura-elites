import { useState } from "react";
import {
  FileText,
  PenLine,
  Trash2,
  Users,
  ClipboardList,
  CalendarDays,
  Clock,
  MapPin,
  ChevronLeft,
  Stamp,
  CalendarCheck2,
  ListChecks,
  Megaphone,
  BookUser,
  LayoutDashboard,
} from "lucide-react";
import {
  getMinutes,
  deleteMinutes,
  updateMinutes,
  getMember,
} from "../../lib/store";
import BackToLogin from "../BackToLogin";
import ThemeToggle from "../ThemeToggle";
import RoleMandate from "../RoleMandate";
import MinutesForm from "./MinutesForm";
import MeetingsTab from "./MeetingsTab";
import ActionItemsTab from "./ActionItemsTab";
import AnnouncementsTab from "./AnnouncementsTab";
import DirectoryTab from "./DirectoryTab";

const TYPE_STYLE = {
  AGM: "bg-gold/15 text-gold-dark",
  Monthly: "bg-green/10 text-green",
  Special: "bg-blue-100 text-blue-700",
};

const STATUS_STYLE = {
  approved: "bg-green/10 text-green",
  draft: "bg-navy/10 text-navy",
};

function fmtDate(d) {
  const date = new Date(d + "T00:00:00");
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function SecretaryConsole({ session, onLogout }) {
  const [refresh, setRefresh] = useState(0);
  const [view, setView] = useState({ name: "list" });
  const [tab, setTab] = useState("overview");
  const minutes = getMinutes();

  const approvedCount = minutes.filter((m) => m.status === "approved").length;

  const tabs = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "minutes", label: "Minutes", icon: ClipboardList },
    { key: "meetings", label: "Meetings & agenda", icon: CalendarCheck2 },
    { key: "actions", label: "Action items", icon: ListChecks },
    { key: "announcements", label: "Announcements", icon: Megaphone },
    { key: "directory", label: "Directory", icon: BookUser },
  ];

  return (
    <div className="min-h-screen bg-navy">
      <header className="border-b border-white/10 bg-navy/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-3 lg:gap-6">
            <BackToLogin
              to="/secretary"
              onLogout={onLogout}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Back
            </BackToLogin>
            <div className="flex items-center gap-3">
              <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-gold/20 text-gold sm:inline-flex">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="font-serif text-lg font-bold text-white">
                  Secretary Portal
                </p>
                <p className="hidden text-xs text-white/50 sm:block">
                  Minutes, meetings & communications · Nyakahura Elites
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
        {tabs.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setView({ name: "list" });
              }}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-gold-dark text-white"
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
                <p className="text-sm text-white/60">Meetings recorded</p>
                <p className="mt-2 font-serif text-3xl font-bold text-white">{minutes.length}</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                <p className="text-sm text-white/60">Approved minutes</p>
                <p className="mt-2 font-serif text-3xl font-bold text-gold">{approvedCount}</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                <p className="text-sm text-white/60">Draft minutes</p>
                <p className="mt-2 font-serif text-3xl font-bold text-white">{minutes.length - approvedCount}</p>
              </div>
            </div>
            <RoleMandate
              roleKey="secretary"
              holder={session.relatedMemberId ? getMember(session.relatedMemberId) : null}
            />
          </div>
        )}
        {tab === "meetings" && <MeetingsTab onChanged={() => setRefresh((n) => n + 1)} />}
        {tab === "actions" && <ActionItemsTab onChanged={() => setRefresh((n) => n + 1)} />}
        {tab === "announcements" && (
          <AnnouncementsTab onChanged={() => setRefresh((n) => n + 1)} />
        )}
        {tab === "directory" && <DirectoryTab />}
        {tab === "minutes" && (
          <>
            {view.name === "form" ? (
              <MinutesForm
                minutes={view.minutes}
                onCancel={() => setView({ name: "list" })}
                onSaved={(savedId) => setView({ name: "detail", id: savedId })}
              />
            ) : view.name === "detail" ? (
              <MinutesDetail
                id={view.id}
                onBack={() => setView({ name: "list" })}
                onEdit={(m) => setView({ name: "form", minutes: m })}
                onChanged={() => setRefresh((n) => n + 1)}
              />
            ) : (
              <MinutesList
                minutes={minutes}
                approvedCount={approvedCount}
                onWrite={() => setView({ name: "form", minutes: null })}
                onRead={(id) => setView({ name: "detail", id })}
                onEdit={(m) => setView({ name: "form", minutes: m })}
                onDelete={(id) => {
                  deleteMinutes(id);
                  setRefresh((n) => n + 1);
                }}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

function MinutesList({ minutes, approvedCount, onWrite, onRead, onEdit, onDelete }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
          <p className="text-sm text-white/60">Meetings recorded</p>
          <p className="mt-2 font-serif text-3xl font-bold text-white">
            {minutes.length}
          </p>
        </div>
        <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
          <p className="text-sm text-white/60">Approved</p>
          <p className="mt-2 font-serif text-3xl font-bold text-gold">
            {approvedCount}
          </p>
        </div>
        <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
          <p className="text-sm text-white/60">In draft</p>
          <p className="mt-2 font-serif text-3xl font-bold text-white">
            {minutes.length - approvedCount}
          </p>
        </div>
      </div>

      <section className="mt-8 rounded-3xl bg-white p-6 shadow-xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-navy">
              <ClipboardList className="h-5 w-5 text-gold-dark" />
              Meeting minutes ({minutes.length})
            </h2>
            <p className="mt-1 text-sm text-navy/60">
              Record submissions after every meeting for easy tracking.
            </p>
          </div>
          <button
            onClick={onWrite}
            className="inline-flex items-center gap-1.5 rounded-full bg-gold-dark px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold"
          >
            <PenLine className="h-4 w-4" />
            Write minutes
          </button>
        </div>

        {minutes.length === 0 ? (
          <p className="mt-6 rounded-2xl bg-sand px-5 py-8 text-center text-sm text-navy/50">
            No meetings recorded yet. Click "Write minutes" to add the first one.
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {minutes.map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-sand p-5 ring-1 ring-navy/5"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <Users className="mt-1 h-5 w-5 shrink-0 text-navy/40" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                          TYPE_STYLE[m.meetingType] || TYPE_STYLE.Monthly
                        }`}
                      >
                        {m.meetingType}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                          STATUS_STYLE[m.status] || STATUS_STYLE.draft
                        }`}
                      >
                        {m.status === "approved" ? "Approved" : "Draft"}
                      </span>
                    </div>
                    <p className="mt-2 font-serif text-lg font-bold text-navy">
                      {m.title}
                    </p>
                    <p className="mt-0.5 text-xs text-navy/50">
                      {fmtDate(m.meetingDate)} · {m.startTime}–{m.endTime} ·{" "}
                      {m.resolutions.length} resolution
                      {m.resolutions.length === 1 ? "" : "s"} ·{" "}
                      {m.membersPresent.length} present
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onRead(m.id)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-navy-light"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Read
                  </button>
                  <button
                    onClick={() => onEdit(m)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-4 py-2 text-xs font-semibold text-navy transition-colors hover:bg-navy/10"
                  >
                    <PenLine className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${m.title}" minutes? This cannot be undone.`)) {
                        onDelete(m.id);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 ring-1 ring-red-200 transition-colors hover:bg-red-100"
                    aria-label={`Delete ${m.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function MinutesDetail({ id, onBack, onEdit, onChanged }) {
  const m = getMinutes().find((x) => x.id === id);
  if (!m) {
    return (
      <SectionCard>
        <p className="py-10 text-center text-sm text-navy/50">
          Meeting record not found.
        </p>
        <button
          onClick={onBack}
          className="mx-auto mt-4 flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to minutes
        </button>
      </SectionCard>
    );
  }

  const count = (list) => list.length;

  function approve() {
    updateMinutes(m.id, { status: "approved", approvedBy: m.chairperson });
    onChanged();
  }

  return (
    <SectionCard>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full bg-navy/5 px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-navy/10"
        >
          <ChevronLeft className="h-4 w-4" />
          All minutes
        </button>
        <div className="flex items-center gap-2">
          {m.status !== "approved" && (
            <button
              onClick={approve}
              className="inline-flex items-center gap-1.5 rounded-full bg-green px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-green-dark"
            >
              <Stamp className="h-3.5 w-3.5" />
              Approve minutes
            </button>
          )}
          <button
            onClick={() => onEdit(m)}
            className="inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-4 py-2 text-xs font-semibold text-navy transition-colors hover:bg-navy/10"
          >
            <PenLine className="h-3.5 w-3.5" />
            Edit
          </button>
        </div>
      </div>

      <div className="mt-8 text-center">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
            TYPE_STYLE[m.meetingType] || TYPE_STYLE.Monthly
          }`}
        >
          {m.meetingType}
        </span>
        {m.status === "approved" && (
          <span className="ml-2 inline-flex rounded-full bg-green/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-green">
            Approved
          </span>
        )}
        <h1 className="mt-4 font-serif text-3xl font-bold text-navy">
          {m.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-navy/60">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-4 w-4" />
            {fmtDate(m.meetingDate)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {m.startTime} – {m.endTime}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {m.venue}
          </span>
        </div>
      </div>

      <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-sand p-5 ring-1 ring-navy/5">
          <p className="text-xs font-bold uppercase tracking-wider text-navy/40">
            Chairperson
          </p>
          <p className="mt-1 font-semibold text-navy">{m.chairperson}</p>
        </div>
        <div className="rounded-2xl bg-sand p-5 ring-1 ring-navy/5">
          <p className="text-xs font-bold uppercase tracking-wider text-navy/40">
            Secretary
          </p>
          <p className="mt-1 font-semibold text-navy">{m.secretary}</p>
        </div>
      </div>

      <Attendance
        present={m.membersPresent}
        withApology={m.absentWithApology}
        withoutApology={m.absentWithoutApology}
        presentLabel={`Present (${count(m.membersPresent)})`}
      />

      <div className="mt-10 max-w-3xl">
        <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-navy">
          <ClipboardList className="h-5 w-5 text-gold-dark" />
          Agenda
        </h2>
        <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-navy/80 marker:text-navy/40">
          {m.agenda.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </div>

      <div className="mt-10 max-w-3xl space-y-6">
        <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-navy">
          <FileText className="h-5 w-5 text-gold-dark" />
          Resolutions
        </h2>
        {m.resolutions.map((r, i) => (
          <div key={r.ref || i} className="rounded-2xl bg-sand p-6 ring-1 ring-navy/5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-gold/15 px-3 py-1 text-[11px] font-bold text-gold-dark">
                {r.ref}
              </span>
              <h3 className="font-serif text-lg font-bold text-navy">
                {r.title}
              </h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-navy/75">{r.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-navy/10 p-5 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-navy/40">
            Minutes written by
          </p>
          <p className="mt-2 font-serif text-lg font-bold text-navy">
            {m.writtenBy}
          </p>
          <p className="text-xs text-navy/50">Secretary</p>
        </div>
        <div className="rounded-2xl border border-navy/10 p-5 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-navy/40">
            Approved by
          </p>
          <p className="mt-2 font-serif text-lg font-bold text-navy">
            {m.status === "approved" ? m.approvedBy : "Pending approval"}
          </p>
          <p className="text-xs text-navy/50">Chairperson</p>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-navy/40">
        Nyakahura Elites Investment Group · {m.title} · {fmtDate(m.meetingDate)}
      </p>
    </SectionCard>
  );
}

function Attendance({ present, withApology, withoutApology, presentLabel }) {
  const wrap = (list) =>
    list.length === 0 ? (
      <span className="text-sm text-navy/40">None</span>
    ) : (
      <div className="flex flex-wrap gap-1.5">
        {list.map((n) => (
          <span
            key={n}
            className="rounded-full bg-white px-3 py-1 text-xs font-medium text-navy ring-1 ring-navy/10"
          >
            {n}
          </span>
        ))}
      </div>
    );

  return (
    <div className="mt-10 grid max-w-3xl gap-4">
      <div className="rounded-2xl bg-navy p-6 text-white">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold">
          <Users className="h-4 w-4" /> {presentLabel}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {present.map((n) => (
            <span
              key={n}
              className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/20"
            >
              {n}
            </span>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-sand p-6 ring-1 ring-navy/5">
          <p className="text-xs font-bold uppercase tracking-wider text-navy/40">
            Absent with apology ({withApology.length})
          </p>
          <div className="mt-3">{wrap(withApology)}</div>
        </div>
        <div className="rounded-2xl bg-sand p-6 ring-1 ring-navy/5">
          <p className="text-xs font-bold uppercase tracking-wider text-navy/40">
            Absent without apology ({withoutApology.length})
          </p>
          <div className="mt-3">{wrap(withoutApology)}</div>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ children }) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
      {children}
    </section>
  );
}