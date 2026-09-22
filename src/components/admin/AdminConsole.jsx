import { useState } from "react";
import { Link } from "react-router-dom";
import SettingsPanel from "./SettingsPanel";
import {
  Shield,
  Users,
  Search,
  UserPlus,
  Pencil,
  Trash2,
  Save,
  Wallet,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Check,
  KeyRound,
  Snowflake,
} from "lucide-react";
import {
  getMembers,
  getAccounts,
  getFees,
  getUnpaidTotals,
  updateMember,
  deleteMember,
  recordContribution,
  settleFee,
  resetDemo,
  KES,
} from "../../lib/store";
import BackToLogin from "../BackToLogin";
import ThemeToggle from "../ThemeToggle";
import RoleMandate from "../RoleMandate";

function MemberRow({ member, onChanged }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: member.name,
    email: member.email,
    occupation: member.occupation || "",
    contribution: "500",
  });
  const [newPass, setNewPass] = useState("");
  const [contributionDate, setContributionDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [contributionAmount, setContributionAmount] = useState("500");
  const [message, setMessage] = useState("");

  const account = getAccounts().find((a) => a.memberId === member.id);
  const fees = getFees(member.id);

  function handleSave() {
    updateMember(
      member.id,
      { name: form.name, email: form.email, occupation: form.occupation },
      form.contribution,
    );
    setEditing(false);
    setMessage("Member details updated.");
    onChanged();
  }

  function handleDelete() {
    if (window.confirm(`Delete ${member.name}? This removes their account, history and fees.`)) {
      deleteMember(member.id);
      onChanged();
    }
  }

  function handleResetPass() {
    if (!newPass.trim()) return setMessage("Enter a new password first.");
    updateMember(member.id, { password: newPass.trim() });
    setNewPass("");
    setMessage(`Password updated for ${member.name}.`);
    onChanged();
  }

  function handleContribution() {
    try {
      recordContribution(member.id, contributionDate, contributionAmount);
      setMessage(`Contribution of ${KES(contributionAmount)} recorded.`);
      setContributionAmount("500");
      onChanged();
    } catch (err) {
      setMessage(err.message);
    }
  }

  function handleSettle(feeId) {
    settleFee(feeId);
    setMessage("Fee marked as paid.");
    onChanged();
  }

  function handleToggleStatus() {
    const frozen = member.status === "frozen";
    if (
      window.confirm(
        frozen
          ? `Reactivate ${member.name}? They will rejoin the active roster for contributions.`
          : `Freeze ${member.name}? This keeps their balances and history but removes them from the monthly contribution register.`,
      )
    ) {
      updateMember(member.id, { status: frozen ? "active" : "frozen" });
      setMessage(
        frozen ? "Member reactivated." : "Member frozen — retained on record.",
      );
      onChanged();
    }
  }

  return (
    <>
      <tr className="border-b border-navy/5 last:border-0">
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/5 text-xs font-bold text-navy">
              {member.name
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div>
              <p className="text-sm font-semibold text-navy">{member.name}</p>
              <p className="text-xs text-navy/50">{member.memberNo}</p>
              {member.status === "frozen" && (
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 ring-1 ring-amber-200">
                  <Snowflake className="h-3 w-3" />
                  Frozen
                </span>
              )}
            </div>
          </div>
        </td>
        <td className="hidden px-4 py-3.5 sm:table-cell">
          <p className="text-sm text-navy/80">{member.email}</p>
          {member.occupation && (
            <p className="text-xs text-navy/50">{member.occupation}</p>
          )}
        </td>
        <td className="whitespace-nowrap px-4 py-3.5 text-sm font-bold text-navy">
          {account ? KES(account.balance) : "—"}
        </td>
        <td className="whitespace-nowrap px-4 py-3.5">
          {fees.length === 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-green/10 px-2.5 py-1 text-xs font-semibold text-green">
              <Check className="h-3 w-3" />
              Clear
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
              {fees.length} · {KES(fees.reduce((s, f) => s + f.amount, 0))}
            </span>
          )}
        </td>
        <td className="hidden whitespace-nowrap px-4 py-3.5 text-sm text-navy/60 lg:table-cell">
          {new Date(member.joined).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </td>
        <td className="px-4 py-3.5 text-right">
          <button
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-3.5 py-2 text-xs font-semibold text-navy transition-colors hover:bg-navy/10"
          >
            Manage
            {open ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </td>
      </tr>

      {open && (
        <tr>
          <td colSpan={6} className="bg-sand/60 px-4 pb-4">
            <div className="mt-3 space-y-5 rounded-2xl bg-white p-5 ring-1 ring-navy/5">
          {message && (
            <p className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-navy ring-1 ring-navy/10">
              {message}
            </p>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <section>
              <h3 className="flex items-center gap-2 text-sm font-bold text-navy">
                <Pencil className="h-4 w-4 text-gold-dark" />
                Edit details
              </h3>
              {editing ? (
                <div className="mt-3 space-y-3">
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Full name"
                    className="w-full rounded-xl border border-navy/10 px-3.5 py-2.5 text-sm text-navy outline-none placeholder:text-navy/40 focus:border-navy focus:ring-2 focus:ring-navy/10"
                  />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Email"
                    className="w-full rounded-xl border border-navy/10 px-3.5 py-2.5 text-sm text-navy outline-none placeholder:text-navy/40 focus:border-navy focus:ring-2 focus:ring-navy/10"
                  />
                  <input
                    value={form.occupation}
                    onChange={(e) =>
                      setForm({ ...form, occupation: e.target.value })
                    }
                    placeholder="Occupation"
                    className="w-full rounded-xl border border-navy/10 px-3.5 py-2.5 text-sm text-navy outline-none placeholder:text-navy/40 focus:border-navy focus:ring-2 focus:ring-navy/10"
                  />
                  <input
                    type="number"
                    min="0"
                    value={form.contribution}
                    onChange={(e) =>
                      setForm({ ...form, contribution: e.target.value })
                    }
                    placeholder="Monthly contribution"
                    className="w-full rounded-xl border border-navy/10 px-3.5 py-2.5 text-sm text-navy outline-none placeholder:text-navy/40 focus:border-navy focus:ring-2 focus:ring-navy/10"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="inline-flex items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-navy-light"
                    >
                      <Save className="h-3.5 w-3.5" />
                      Save changes
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="rounded-full bg-navy/5 px-4 py-2 text-xs font-semibold text-navy transition-colors hover:bg-navy/10"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setForm({ ...form, contribution: String(account?.monthlyContribution ?? "500") });
                    setEditing(true);
                  }}
                  className="mt-3 rounded-full bg-white px-4 py-2 text-xs font-semibold text-navy ring-1 ring-navy/10 transition-colors hover:bg-navy/5"
                >
                  Open editor
                </button>
              )}
            </section>

            <section>
              <h3 className="flex items-center gap-2 text-sm font-bold text-navy">
                <Wallet className="h-4 w-4 text-green" />
                Record contribution
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <input
                  type="date"
                  value={contributionDate}
                  onChange={(e) => setContributionDate(e.target.value)}
                  className="rounded-xl border border-navy/10 px-3.5 py-2.5 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
                />
                <input
                  type="number"
                  min="0"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  className="w-28 rounded-xl border border-navy/10 px-3.5 py-2.5 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
                />
                <button
                  onClick={handleContribution}
                  className="inline-flex items-center gap-1.5 rounded-full bg-green px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-green-dark"
                >
                  <Wallet className="h-3.5 w-3.5" />
                  Add
                </button>
              </div>
            </section>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section>
              <h3 className="flex items-center gap-2 text-sm font-bold text-navy">
                <KeyRound className="h-4 w-4 text-navy/60" />
                Reset password
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <input
                  type="text"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="New temporary password"
                  className="flex-1 rounded-xl border border-navy/10 px-3.5 py-2.5 text-sm text-navy outline-none placeholder:text-navy/40 focus:border-navy focus:ring-2 focus:ring-navy/10"
                />
                <button
                  onClick={handleResetPass}
                  className="rounded-full bg-navy/5 px-4 py-2 text-xs font-semibold text-navy transition-colors hover:bg-navy/10"
                >
                  Set password
                </button>
              </div>
            </section>

            <section>
              <h3 className="flex items-center gap-2 text-sm font-bold text-navy">
                <AlertCircle className="h-4 w-4 text-red-500" />
                Pending fees ({fees.length})
              </h3>
              {fees.length === 0 ? (
                <p className="mt-3 text-xs text-navy/50">No unpaid fees.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {fees.map((fee) => (
                    <li
                      key={fee.id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-2.5 ring-1 ring-navy/5"
                    >
                      <div>
                        <p className="text-xs font-semibold text-navy">
                          {fee.label}
                        </p>
                        <p className="text-[11px] text-navy/50">
                          Due {fee.dueDate} · {KES(fee.amount)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleSettle(fee.id)}
                        className="inline-flex items-center gap-1 rounded-full bg-green/10 px-3 py-1.5 text-[11px] font-semibold text-green transition-colors hover:bg-green/20"
                      >
                        <Check className="h-3 w-3" />
                        Mark paid
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-navy/10 pt-4">
            <button
              onClick={handleToggleStatus}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ring-1 transition-colors ${
                member.status === "frozen"
                  ? "bg-green/10 text-green ring-green/20 hover:bg-green/20"
                  : "bg-amber-50 text-amber-700 ring-amber-200 hover:bg-amber-100"
              }`}
            >
              {member.status === "frozen" ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Snowflake className="h-3.5 w-3.5" />
              )}
              {member.status === "frozen" ? "Reactivate" : "Freeze (remove from register)"}
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 ring-1 ring-red-200 transition-colors hover:bg-red-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete member
            </button>
          </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminConsole({ onLogout }) {
  const [refresh, setRefresh] = useState(0);
  const [query, setQuery] = useState("");

  const members = getMembers().filter((m) => m.role === "member");
  const accounts = getAccounts();
  const membersById = Object.fromEntries(members.map((m) => [m.id, m]));
  const activeCount = members.filter((m) => m.status !== "frozen").length;
  const frozenCount = members.length - activeCount;
  const totalSavings = accounts.reduce(
    (sum, a) => sum + (membersById[a.memberId] ? a.balance : 0),
    0,
  );
  const totalUnpaid = getUnpaidTotals().amount;

  const q = query.trim().toLowerCase();
  const filteredMembers = q
    ? members.filter((m) =>
        [m.name, m.email, m.memberNo, m.occupation || ""]
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
    : members;

  return (
    <div className="min-h-screen bg-navy">
      <header className="border-b border-white/10 bg-navy/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-3 lg:gap-6">
            <BackToLogin
              to="/admin"
              onLogout={onLogout}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Back
            </BackToLogin>
            <div className="flex items-center gap-3">
              <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-gold/20 text-gold sm:inline-flex">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="font-serif text-lg font-bold text-white">
                  Admin Console
                </p>
                <p className="hidden text-xs text-white/50 sm:block">
                  Nyakahura Elites backend
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

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
            <p className="text-sm text-white/60">Active members</p>
            <p className="mt-2 font-serif text-3xl font-bold text-white">
              {activeCount}
            </p>
            <p className="mt-1 text-xs text-white/50">
              {frozenCount} frozen · kept on record
            </p>
          </div>
          <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
            <p className="text-sm text-white/60">Total savings pool</p>
            <p className="mt-2 font-serif text-3xl font-bold text-gold">
              {KES(totalSavings)}
            </p>
          </div>
          <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
            <p className="text-sm text-white/60">Unpaid fees</p>
            <p className="mt-2 font-serif text-3xl font-bold text-red-400">
              {KES(totalUnpaid)}
            </p>
          </div>
          <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
            <p className="text-sm text-white/60">With account balance</p>
            <p className="mt-2 font-serif text-3xl font-bold text-white">
              {accounts.length}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <section className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-navy">
                  <Users className="h-5 w-5 text-gold-dark" />
                  Members ({filteredMembers.length})
                </h2>
                <p className="mt-1 text-sm text-navy/60">
                  Click Manage on a member to edit details, record
                  contributions, settle fees, reset passwords, or delete.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to="/admin/add-member"
                  className="inline-flex items-center gap-1.5 rounded-full bg-green px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-dark"
                >
                  <UserPlus className="h-4 w-4" />
                  Add member
                </Link>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 rounded-xl border border-navy/10 px-3.5 py-2.5 focus-within:border-navy focus-within:ring-2 focus-within:ring-navy/10">
              <Search className="h-4 w-4 shrink-0 text-navy/40" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email, member no, occupation…"
                className="w-full bg-transparent text-sm text-navy outline-none placeholder:text-navy/40"
              />
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="text-[11px] font-bold uppercase tracking-wider text-navy/40">
                    <th className="px-4 py-2">Member</th>
                    <th className="hidden px-4 py-2 sm:table-cell">Contact</th>
                    <th className="px-4 py-2">Balance</th>
                    <th className="px-4 py-2">Unpaid fees</th>
                    <th className="hidden px-4 py-2 lg:table-cell">Joined</th>
                    <th className="px-4 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/5">
                  {filteredMembers.map((m) => (
                    <MemberRow
                      key={m.id}
                      member={m}
                      onChanged={() => setRefresh((n) => n + 1)}
                    />
                  ))}
                </tbody>
              </table>
              {filteredMembers.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-navy/50">
                  No members match “{query.trim()}”.
                </p>
              )}
            </div>
          </section>
        </div>

        <div className="mt-8">
          <SettingsPanel onChanged={() => setRefresh((n) => n + 1)} />
        </div>
        <div className="mt-10">
          <RoleMandate roleKey="admin" />
        </div>
      </main>
    </div>
  );
}