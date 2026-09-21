import { useState } from "react";
import {
  UserCog,
  LayoutDashboard,
  ListTree,
  BookUser,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import {
  getMember,
  getActiveMembers,
  getSubCommittees,
  addSubCommittee,
  updateSubCommittee,
  deleteSubCommittee,
} from "../../lib/store";
import BackToLogin from "../BackToLogin";
import ThemeToggle from "../ThemeToggle";
import RoleMandate from "../RoleMandate";
import DirectoryTab from "../secretary/DirectoryTab";

const STATUS_STYLE = {
  active: "bg-green/10 text-green",
  paused: "bg-gold/15 text-gold-dark",
  dissolved: "bg-navy/10 text-navy/70",
};

const TABS = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "committees", label: "Sub-committees", icon: ListTree },
  { key: "directory", label: "Directory", icon: BookUser },
];

export default function ViceChairConsole({ session, onLogout }) {
  const [tab, setTab] = useState("overview");
  const [refresh, setRefresh] = useState(0);

  const members = getActiveMembers();
  const committees = getSubCommittees();
  const active = committees.filter((s) => s.status === "active").length;
  const holder = session.relatedMemberId ? getMember(session.relatedMemberId) : null;

  return (
    <div className="min-h-screen bg-sand">
      <header className="border-b border-black/5 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-3 lg:gap-6">
            <BackToLogin
              to="/vice-chair"
              onLogout={onLogout}
              className="inline-flex items-center gap-2 rounded-full bg-navy/5 px-3.5 py-2 text-sm font-semibold text-navy transition-colors hover:bg-navy/10"
            >
              Back
            </BackToLogin>
            <div className="flex items-center gap-3">
              <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-green/15 text-green sm:inline-flex">
                <UserCog className="h-5 w-5" />
              </div>
              <div>
                <p className="font-serif text-lg font-bold text-navy">
                  Vice Chairperson Portal
                </p>
                <p className="hidden text-xs text-navy/50 sm:block">
                  Deputy leadership & sub-committee oversight · Nyakahura Elites
                </p>
              </div>
            </div>
          </div>
          <ThemeToggle className="text-navy hover:bg-navy/10" />
          <button
            onClick={onLogout}
            className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-light"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <RoleMandate roleKey="vicechairperson" holder={holder} />

        <nav className="mt-8 flex flex-wrap gap-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-green text-white"
                    : "bg-navy/5 text-navy/70 hover:bg-navy/10 hover:text-navy"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-6">
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <Stat label="Active members" value={members.length} />
                <Stat label="Sub-committees" value={committees.length} />
                <Stat label="Active task forces" value={active} tone="green" />
              </div>
              <section className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-navy/5 sm:p-8">
                <h2 className="font-serif text-xl font-bold text-navy">
                  Sub-committee oversight
                </h2>
                {committees.length === 0 ? (
                  <p className="mt-3 text-sm text-navy/60">
                    No sub-committees or task forces yet. Create one to track a
                    special mandate.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {committees.map((s) => (
                      <div
                        key={s.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-sand px-4 py-3"
                      >
                        <div>
                          <p className="flex items-center gap-2 font-semibold text-navy">
                            {s.name}
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                                STATUS_STYLE[s.status] || STATUS_STYLE.active
                              }`}
                            >
                              {s.status}
                            </span>
                          </p>
                          <p className="mt-0.5 text-xs text-navy/60">
                            {s.focus}
                            {s.lead ? ` · led by ${s.lead}` : ""}
                          </p>
                        </div>
                        <button
                          onClick={() => setTab("committees")}
                          className="text-xs font-semibold text-navy/70 hover:text-navy"
                        >
                          Manage
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {tab === "committees" && (
            <CommitteesTab
              committees={committees}
              onChange={() => setRefresh((n) => n + 1)}
            />
          )}

          {tab === "directory" && <DirectoryTab />}
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value, tone = "navy" }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-navy/5">
      <p className="text-sm text-navy/60">{label}</p>
      <p
        className={`mt-2 font-serif text-3xl font-bold ${
          tone === "green" ? "text-green" : "text-navy"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function CommitteesTab({ committees, onChange }) {
  const [form, setForm] = useState({
    name: "",
    focus: "",
    lead: "",
    members: "",
    status: "active",
  });

  function submit(e) {
    e.preventDefault();
    addSubCommittee(form);
    setForm({ name: "", focus: "", lead: "", members: "", status: "active" });
    onChange();
  }

  function toggleStatus(committee) {
    updateSubCommittee(committee.id, {
      status: committee.status === "active" ? "paused" : "active",
    });
    onChange();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-navy/5 sm:p-8">
        <h2 className="font-serif text-xl font-bold text-navy">
          New sub-committee / task force
        </h2>
        <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Community outreach committee"
              className="input"
            />
          </Field>
          <Field label="Lead">
            <input
              value={form.lead}
              onChange={(e) => setForm({ ...form, lead: e.target.value })}
              placeholder="e.g. Esther Mucho"
              className="input"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Focus / mandate">
              <input
                value={form.focus}
                onChange={(e) => setForm({ ...form, focus: e.target.value })}
                placeholder="e.g. Fetes, charity drives and welfare"
                className="input"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Members (comma separated)">
              <input
                value={form.members}
                onChange={(e) => setForm({ ...form, members: e.target.value })}
                placeholder="e.g. Marvin Karanja, Susan Wambui"
                className="input"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-green px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-dark"
            >
              <Plus className="h-4 w-4" />
              Create committee
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-navy/5 sm:p-8">
        <h2 className="font-serif text-xl font-bold text-navy">
          Tracked committees ({committees.length})
        </h2>
        {committees.length === 0 && (
          <p className="mt-3 text-sm text-navy/60">
            Nothing tracked yet — create your first committee above.
          </p>
        )}
        <div className="mt-4 space-y-3">
          {committees.map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-sand px-5 py-4"
            >
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 font-semibold text-navy">
                  {s.name}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      STATUS_STYLE[s.status] || STATUS_STYLE.active
                    }`}
                  >
                    {s.status}
                  </span>
                </p>
                {s.focus && (
                  <p className="mt-0.5 text-sm text-navy/70">{s.focus}</p>
                )}
                <p className="mt-1 text-xs text-navy/50">
                  {s.lead && (
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {s.lead}
                      {s.members ? " ·" : ""}
                    </span>
                  )}
                  {s.members && ` ${s.members}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleStatus(s)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                    s.status === "active"
                      ? "bg-gold/15 text-gold-dark hover:bg-gold/25"
                      : "bg-green/10 text-green hover:bg-green/20"
                  }`}
                >
                  {s.status === "active" ? "Pause" : "Re-activate"}
                </button>
                <button
                  onClick={() => {
                    deleteSubCommittee(s.id);
                    onChange();
                  }}
                  className="rounded-full bg-navy/5 p-2 text-navy/60 transition-colors hover:bg-red-50 hover:text-red-600"
                  aria-label={`Delete ${s.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-navy">{label}</span>
      {children}
    </label>
  );
}