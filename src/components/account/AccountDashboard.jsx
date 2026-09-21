import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  CalendarCheck,
  AlertCircle,
  TrendingUp,
  LogOut,
  Landmark,
  Briefcase,
  HandHeart,
  ArrowRight,
  User,
  Mail,
  BadgeCheck,
  CalendarDays,
  Phone,
  Pencil,
  Save,
  Check,
  Info,
  Lock,
  Printer,
  Megaphone,
  FileText,
  CalendarClock,
  X,
  Clock,
  MapPin,
} from "lucide-react";
import BackLink from "../BackLink";
import BackToLogin from "../BackToLogin";
import ThemeToggle from "../ThemeToggle";
import MemberStatement from "../treasurer/MemberStatement";
import {
  getMember,
  getAccount,
  getHistory,
  getFees,
  getInvestments,
  getMemberYearlySavings,
  getMemberSavings,
  updateMember,
  getNextMeeting,
  getAnnouncements,
  getMinutes,
  getContributionForMonth,
  getPoolStats,
  KES,
} from "../../lib/store";

const CATEGORY_ICONS = {
  land: Landmark,
  business: Briefcase,
  loan: HandHeart,
};

export default function AccountDashboard({ session, onLogout }) {
  const [refresh, setRefresh] = useState(0);
  const [statementOpen, setStatementOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [phone, setPhone] = useState("");
  const [occupation, setOccupation] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [openMinuteId, setOpenMinuteId] = useState(null);

  const member = getMember(session.memberId);
  const account = getAccount(session.memberId);
  const history = getHistory(session.memberId).slice(0, 12);
  const fees = getFees(session.memberId);
  const investments = getInvestments();
  const nextMeeting = getNextMeeting();
  const announcements = getAnnouncements().filter((a) => a.published);
  const approvedMinutes = getMinutes().filter((m) => m.status === "approved");
  const contributionNow = getContributionForMonth("2026-09");
  const contributionNext = getContributionForMonth("2027-01");

  const feeTotal = fees.reduce((sum, fee) => sum + fee.amount, 0);
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const yearly = getMemberYearlySavings(session.memberId);
  const record = getMemberSavings(session.memberId);
  const pool = getPoolStats();

  if (!account) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-sand px-6 text-center">
        <p className="font-serif text-2xl font-bold text-navy">
          This account has no member portal yet.
        </p>
        <p className="mt-2 text-sm text-navy/70">
          {member ? `${member.name}, please contact the group leadership.` : "Please contact the group leadership."}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <BackLink
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-light"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to site
          </BackLink>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-full bg-navy/5 px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-navy/10"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand">
<header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-3 lg:gap-6">
            <BackToLogin
              to="/account"
              onLogout={onLogout}
              className="inline-flex items-center gap-2 rounded-full bg-navy/5 px-3.5 py-2 text-sm font-semibold text-navy transition-colors hover:bg-navy/10"
            >
              Back
            </BackToLogin>
            <Link to="/" className="hidden items-center gap-2 sm:flex">
              <img
                src="/logo.png"
                alt="Nyakahura Elites"
                className="h-10 w-10 rounded-full object-cover ring-1 ring-navy/10"
              />
              <span className="font-serif text-lg font-bold text-navy">
                Nyakahura Elites
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-navy">{member.name}</p>
              <p className="text-xs text-navy/50">{member.memberNo}</p>
            </div>
            <ThemeToggle className="text-navy hover:bg-navy/10" />
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-full bg-navy/5 px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-navy/10"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-dark">
              Member Portal
            </p>
            <h1 className="mt-2 font-serif text-3xl font-bold text-navy sm:text-4xl">
              Karibu, {member.name.split(" ")[0]}
            </h1>
            <p className="mt-1 text-sm text-navy/60">
              Membership since {account.memberSince}
            </p>
          </div>
          {member.occupation && (
            <p className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-navy ring-1 ring-navy/10">
              {member.occupation}
            </p>
          )}
        </div>

        {member.status === "frozen" && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
            <Info className="h-5 w-5 shrink-0 text-amber-600" />
            <p>
              Your membership is currently <strong>frozen</strong> following
              arrears above a full year of contributions. Your savings balance
              and history are retained — no further monthly contributions are
              expected. To be reactivated, speak to the elected executive.
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          <div className="rounded-3xl bg-navy p-7 text-white shadow-lg shadow-navy/10">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gold/20 text-gold">
                <Wallet className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-white/70">
                Current Savings Balance
              </p>
            </div>
            <p className="mt-5 font-serif text-3xl font-bold">
              {KES(account.balance)}
            </p>
            <p className="mt-1 text-xs text-white/60">
              {member.status === "frozen"
                ? "Membership frozen — no monthly contribution required"
                : `Monthly contribution: ${KES(contributionNow)} · growing to ${KES(contributionNext)} from Jan 2027 · as per savings record (09/06/2026)`}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-navy/5">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-green/10 text-green">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-navy/70">
                Contributions Made
              </p>
            </div>
            <p className="mt-5 font-serif text-3xl font-bold text-navy">
              {account.contributionsMade}
            </p>
            <p className="mt-1 text-xs text-navy/50">
              Last: {account.lastContribution || "—"}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-navy/5">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-navy/70">Unpaid Fees</p>
            </div>
            <p className="mt-5 font-serif text-3xl font-bold text-navy">
              {fees.length > 0 ? `${fees.length} · ${KES(feeTotal)}` : "None"}
            </p>
            <p className="mt-1 text-xs text-navy/50">
              {fees.length > 0 ? "Due — please settle soon" : "All settled, asante"}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy/5 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-navy/5 text-navy">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-navy">
                    Your details
                  </h2>
                  <p className="text-xs text-navy/50">
                    As listed in the group's savings record
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (editingProfile) return;
                  setPhone(member.phone || "");
                  setOccupation(member.occupation || "");
                  setEditingProfile(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-4 py-2 text-xs font-semibold text-navy transition-colors hover:bg-navy/10"
              >
                <Pencil className="h-3.5 w-3.5" />
                {editingProfile ? "Editing…" : "Edit"}
              </button>
            </div>

            {editingProfile ? (
              <div className="mt-6 space-y-4 rounded-2xl bg-sand p-5">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-navy/50">Phone number</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0712 345 678"
                    className="mt-1.5 w-full rounded-xl border border-navy/10 bg-white px-3.5 py-2.5 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-navy/50">Occupation</span>
                  <input
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="e.g. Teacher"
                    className="mt-1.5 w-full rounded-xl border border-navy/10 bg-white px-3.5 py-2.5 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
                  />
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      updateMember(session.memberId, {
                        phone: phone.trim(),
                        occupation: occupation.trim(),
                      });
                      setEditingProfile(false);
                      setProfileMsg("Details updated.");
                      setRefresh((n) => n + 1);
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-green px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-dark"
                  >
                    <Save className="h-4 w-4" />
                    Save details
                  </button>
                  <button
                    onClick={() => setEditingProfile(false)}
                    className="rounded-full bg-navy/5 px-5 py-2.5 text-sm font-semibold text-navy hover:bg-navy/10"
                  >
                    Cancel
                  </button>
                </div>
                {profileMsg && (
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-green">
                    <Check className="h-3.5 w-3.5" />
                    {profileMsg}
                  </p>
                )}
              </div>
            ) : (
              <dl className="mt-6 space-y-4">
                <div className="flex items-start justify-between gap-4 border-b border-navy/5 pb-4">
                  <dt className="flex items-center gap-2 text-sm text-navy/60">
                    <BadgeCheck className="h-4 w-4 text-green" />
                    Full name
                  </dt>
                  <dd className="text-right text-sm font-semibold text-navy">
                    {member.name}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-navy/5 pb-4">
                  <dt className="flex items-center gap-2 text-sm text-navy/60">
                    <User className="h-4 w-4 text-green" />
                    Member number
                  </dt>
                  <dd className="text-right text-sm font-semibold text-navy">
                    {member.memberNo}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-navy/5 pb-4">
                  <dt className="flex items-center gap-2 text-sm text-navy/60">
                    <Mail className="h-4 w-4 text-green" />
                    Email
                  </dt>
                  <dd className="text-right text-sm font-medium text-navy">
                    {member.email}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-navy/5 pb-4">
                  <dt className="flex items-center gap-2 text-sm text-navy/60">
                    <Phone className="h-4 w-4 text-green" />
                    Phone
                  </dt>
                  <dd className="text-right text-sm font-medium text-navy">
                    {member.phone || "—"}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-navy/5 pb-4">
                  <dt className="flex items-center gap-2 text-sm text-navy/60">
                    <Briefcase className="h-4 w-4 text-green" />
                    Occupation
                  </dt>
                  <dd className="text-right text-sm font-medium text-navy">
                    {member.occupation || "—"}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-navy/5 pb-4">
                  <dt className="flex items-center gap-2 text-sm text-navy/60">
                    <CalendarDays className="h-4 w-4 text-green" />
                    Member since
                  </dt>
                  <dd className="text-right text-sm font-medium text-navy">
                    {account.memberSince}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="flex items-center gap-2 text-sm text-navy/60">
                    <Wallet className="h-4 w-4 text-green" />
                    Monthly contribution
                  </dt>
                  <dd className="text-right text-sm font-medium text-navy">
                    {KES(contributionNow)}{" "}
                    <span className="text-xs text-navy/40">
                      (→ {KES(contributionNext)} from Jan 2027)
                    </span>
                  </dd>
                </div>
              </dl>
            )}
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy/5 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold-dark">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-navy">
                  Your savings record
                </h2>
                <p className="text-xs text-navy/50">
                  Annual totals, matching the group's savings record
                </p>
              </div>
            </div>

            <table className="mt-6 w-full text-sm">
              <thead>
                <tr className="border-b-2 border-navy/10 text-[11px] uppercase tracking-wide text-navy/50">
                  <th className="py-2 pr-3 text-left font-semibold">Year</th>
                  <th className="py-2 text-right font-semibold">Amount saved</th>
                </tr>
              </thead>
              <tbody>
                {yearly.map((y) => (
                  <tr key={y.year} className="border-b border-navy/5">
                    <td className="py-3 pr-3 font-semibold text-navy">{y.year}</td>
                    <td
                      className={`py-3 text-right font-serif font-bold ${
                        y.total < 0 ? "text-red-500" : "text-green"
                      }`}
                    >
                      {KES(y.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {yearly.length === 0 && (
              <p className="mt-6 rounded-2xl bg-sand px-5 py-6 text-center text-sm text-navy/50">
                No savings recorded yet for this account.
              </p>
            )}

            <div className="mt-6 rounded-2xl bg-sand p-5 ring-1 ring-navy/5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-navy">
                  Savings record status
                </p>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${
                    record
                      ? record.arrears > 0
                        ? "bg-red-100 text-red-600"
                        : record.arrears < 0
                          ? "bg-green/10 text-green"
                          : "bg-navy/5 text-navy/70"
                      : "bg-navy/5 text-navy/70"
                  }`}
                >
                  {record
                    ? record.arrears > 0
                      ? `Arrears ${KES(record.arrears)}`
                      : record.arrears < 0
                        ? `Ahead ${KES(-record.arrears)}`
                        : "Up to date"
                    : "No record yet"}
                </span>
              </div>
              <p className="mt-2 text-xs text-navy/60">
                Grand total savings:{" "}
                <span className="font-bold text-green">{KES(account.balance)}</span>{" "}
                · Monthly contribution is {KES(500)} and savings grow gradually
                each month. Arrears clear once contributions are up to date.
              </p>
              <button
                onClick={() => setStatementOpen(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-light"
              >
                <Printer className="h-4 w-4" />
                View statement (print / PDF)
              </button>
            </div>
          </section>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy/5 sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-navy">
                Outstanding Fees
              </h2>
              <span className="text-xs font-semibold text-navy/50">
                {fees.length} pending
              </span>
            </div>

            {fees.length === 0 ? (
              <p className="mt-6 rounded-2xl bg-green/5 px-5 py-6 text-sm font-medium text-green ring-1 ring-green/10">
                You have no unpaid fees. Save on!
              </p>
            ) : (
              <ul className="mt-5 space-y-3">
                {fees.map((fee) => (
                  <li
                    key={fee.id}
                    className="flex items-center justify-between rounded-2xl bg-sand px-5 py-4 ring-1 ring-navy/5"
                  >
                    <div>
                      <p className="text-sm font-semibold text-navy">
                        {fee.label}
                      </p>
                      <p className="mt-0.5 text-xs text-navy/50">
                        Due {fee.dueDate}
                        {fee.type === "fine" ? " · Fine" : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-600">
                        {KES(fee.amount)}
                      </p>
                      <span className="mt-1 inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-red-600">
                        Unpaid
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy/5 sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-navy">
                Contribution History
              </h2>
              <span className="text-xs font-semibold text-navy/50">
                Recent 12
              </span>
            </div>

            <ul className="mt-5 divide-y divide-navy/5">
              {history.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between py-3.5"
                >
                  <div>
                    <p className="text-sm font-medium text-navy">
                      {entry.note}
                    </p>
                    <p className="mt-0.5 text-xs text-navy/45">{entry.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green">
                      {entry.type === "dividend" ? "+" : ""}
                      {KES(entry.amount)}
                    </p>
                    {entry.type === "dividend" && (
                      <span className="mt-1 inline-flex rounded-full bg-green/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-green">
                        Dividend
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy/5 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-dark">
                Group Investments
              </p>
              <h2 className="mt-2 font-serif text-2xl font-bold text-navy">
                Where the group's money works
              </h2>
            </div>
            <p className="text-sm text-navy/60">
              Total invested:{" "}
              <span className="font-bold text-navy">{KES(totalInvested)}</span>{" "}
              · Current value:{" "}
              <span className="font-bold text-green">{KES(totalValue)}</span>
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {investments.map((inv) => {
              const Icon = CATEGORY_ICONS[inv.category] || TrendingUp;
              const gain = inv.currentValue - inv.amount;
              const gainPct = ((gain / inv.amount) * 100).toFixed(1);
              const isUp = gain >= 0;
              return (
                <article
                  key={inv.id}
                  className="rounded-2xl bg-sand p-6 ring-1 ring-navy/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-navy/5 text-navy">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-navy">{inv.title}</p>
                      <p className="text-xs capitalize text-navy/50">
                        {inv.category} · {inv.date}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <p className="text-xs text-navy/50">Invested</p>
                      <p className="font-serif text-xl font-bold text-navy">
                        {KES(inv.amount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-navy/50">Now worth</p>
                      <p className="font-serif text-xl font-bold text-green">
                        {KES(inv.currentValue)}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
                      isUp ? "bg-green/10 text-green" : "bg-red-100 text-red-600"
                    }`}
                  >
                    <TrendingUp className="h-3.5 w-3.5" />
                    {isUp ? "+" : ""}
                    {gainPct}%
                  </div>
                  <p className="mt-4 text-xs leading-relaxed text-navy/60">
                    {inv.notes}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy/5 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green/10 text-green">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-navy">
                  Group savings account
                </h2>
                <p className="text-xs text-navy/50">
                  All contributions are pooled in the joint group account
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-sand p-5 sm:p-6">
              <p className="text-sm text-navy/60">
                Your savings sit together with everyone's in the group's KCB
                account and investments — nobody withdraws directly from their
                own balance.
              </p>
              <dl className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-navy/50">
                    Total savings pool
                  </dt>
                  <dd className="mt-1 font-serif text-2xl font-bold text-navy">
                    {KES(pool.savingsPool)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-navy/50">
                    Invested
                  </dt>
                  <dd className="mt-1 font-serif text-2xl font-bold text-navy">
                    {KES(pool.invested)}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-navy/5 px-4 py-3 text-xs leading-relaxed text-navy/70">
              <Lock className="h-4 w-4 shrink-0 text-navy" />
              <p>
                Only the elected executive can authorise a transfer or payout
                from the group account — as a member you don't withdraw
                directly. Contact the treasurer if you need a payout.
              </p>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy/5 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold-dark">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-navy">
                  Upcoming meeting
                </h2>
                <p className="text-xs text-navy/50">
                  The group meets every 2nd Tuesday of the month
                </p>
              </div>
            </div>

            {nextMeeting ? (
              <div className="mt-5 rounded-2xl bg-navy p-6 text-white">
                <p className="font-serif text-2xl font-bold">{nextMeeting.title}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/70">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-gold" />
                    {new Date(nextMeeting.date + "T00:00:00").toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-gold" />
                    {nextMeeting.time}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-gold" />
                    {nextMeeting.venue}
                  </span>
                </div>
                <p className="mt-4 text-xs font-bold uppercase tracking-wider text-gold">
                  Agenda
                </p>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-white/80">
                  {nextMeeting.agenda.slice(0, 5).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ol>
              </div>
            ) : (
              <p className="mt-5 rounded-2xl bg-sand px-5 py-6 text-center text-sm text-navy/50">
                No upcoming meeting scheduled.
              </p>
            )}

            <div className="mt-6 border-t border-navy/10 pt-5">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy/50">
                <Megaphone className="h-4 w-4 text-gold-dark" />
                Announcements
              </p>
              <ul className="mt-3 space-y-3">
                {announcements.slice(0, 4).map((a) => (
                  <li key={a.id} className="rounded-2xl bg-sand px-4 py-3">
                    <p className="text-sm font-semibold text-navy">{a.title}</p>
                    {a.body && (
                      <p className="mt-0.5 text-xs leading-relaxed text-navy/60">{a.body}</p>
                    )}
                    <p className="mt-1 text-[11px] text-navy/40">{a.date}</p>
                  </li>
                ))}
                {announcements.length === 0 && (
                  <li className="text-sm text-navy/40">No announcements yet.</li>
                )}
              </ul>
            </div>

            <div className="mt-6 border-t border-navy/10 pt-5">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy/50">
                <FileText className="h-4 w-4 text-gold-dark" />
                Latest approved minutes
              </p>
              <ul className="mt-3 space-y-2">
                {approvedMinutes.slice(0, 3).map((m) => (
                  <li key={m.id} className="rounded-2xl bg-sand px-4 py-3">
                    <button
                      onClick={() => setOpenMinuteId(openMinuteId === m.id ? null : m.id)}
                      className="flex w-full items-center justify-between gap-2 text-left"
                    >
                      <span className="text-sm font-semibold text-navy">{m.title}</span>
                      <span className="text-xs text-navy/40">
                        {m.resolutions.length} resolution{m.resolutions.length === 1 ? "" : "s"}
                      </span>
                    </button>
                    {openMinuteId === m.id && (
                      <div className="mt-3 space-y-3 border-t border-navy/10 pt-3">
                        <p className="text-xs text-navy/60">
                          {new Date(m.meetingDate + "T00:00:00").toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}{" "}
                          · {m.venue}
                        </p>
                        {m.resolutions.map((r) => (
                          <div key={r.ref || r.title}>
                            <p className="text-xs font-bold text-gold-dark">{r.ref}</p>
                            <p className="text-sm font-semibold text-navy">{r.title}</p>
                            <p className="mt-1 text-xs leading-relaxed text-navy/70">{r.body}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
                {approvedMinutes.length === 0 && (
                  <li className="text-sm text-navy/40">No approved minutes yet.</li>
                )}
              </ul>
            </div>
          </section>
        </div>

        <p className="mt-8 text-center text-xs text-navy/50">
          Need a change or a question about your account? Reach the group
          leadership through the contact section on the main site.
          <Link
            to="/#get-involved"
            className="ml-1 inline-flex items-center gap-1 font-semibold text-navy hover:text-gold-dark"
          >
            Contact us <ArrowRight className="h-3 w-3" />
          </Link>
        </p>
      </main>

      {statementOpen && (
        <MemberStatement
          memberId={session.memberId}
          onClose={() => setStatementOpen(false)}
        />
      )}
    </div>
  );
}