import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  TrendingUp,
  BarChart3,
  Users,
  AlertTriangle,
  Target,
  CalendarRange,
  Search,
  Table as TableIcon,
  FileText,
  FileUp,
  Download,
  Trash2,
  X,
  ClipboardCheck,
  HandCoins,
  ArrowUpRight,
  Printer,
  Settings,
} from "lucide-react";
import {
  getMembers,
  getFinanceDocuments,
  addFinanceDocument,
  deleteFinanceDocument,
  getMember,
  getAccount,
  getSavingsRecord,
  getMemberSavings,
  getPoolYearlyTotals,
  getUnpaidTotals,
  getPoolStats,
  getContributionTotalsByMonth,
  getTreasuryAuditLog,
  getCashPosition,
  KES,
} from "../../lib/store";
import BackToLogin from "../BackToLogin";
import ThemeToggle from "../ThemeToggle";
import RoleMandate from "../RoleMandate";
import useTabNavigation from "../../lib/useTabNavigation";
import RegisterTab from "./RegisterTab";
import FinesLoansTab from "./FinesLoansTab";
import WithdrawalsTab from "./WithdrawalsTab";
import SettingsPanel from "../admin/SettingsPanel";
import CashPosition from "./CashPosition";
import MemberStatement from "./MemberStatement";

const CATEGORIES = [
  { key: "savings", label: "Savings & Contributions" },
  { key: "arrears", label: "Arrears Statement" },
  { key: "investments", label: "Investments" },
  { key: "expenses", label: "Expenses" },
  { key: "statement", label: "Bank Statement" },
  { key: "other", label: "Other" },
];

const CATEGORY_STYLES = {
  savings: "bg-green/10 text-green",
  arrears: "bg-red-100 text-red-600",
  investments: "bg-gold/15 text-gold-dark",
  expenses: "bg-navy/5 text-navy",
  statement: "bg-blue-100 text-blue-700",
  other: "bg-navy/5 text-navy/70",
};

const MAX_FILE_SIZE = 2_500_000;
const YEAR_COLUMNS = ["2023", "2024", "2025", "2026"];

function Stat({ label, value, accent }) {
  return (
    <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
      <p className="text-sm text-white/60">{label}</p>
      <p className={`mt-2 font-serif text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}

function Card({ icon: Icon, title, subtitle, children, iconClass }) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-xl sm:p-7">
      <div className="flex items-start gap-3">
        <div
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass || "bg-green/10 text-green"}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-serif text-lg font-bold text-navy">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-navy/60">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function BarChart({ data, numberClass }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-3 sm:gap-5">
      {data.map((d, i) => {
        const height = Math.max((d.value / max) * 160, d.value > 0 ? 10 : 4);
        return (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
            <p
              className={`text-[11px] font-bold ${numberClass || "text-navy"}`}
              title={String(d.value).slice(0, 30)}
            >
              {d.value ? d.display || KES(d.value) : "—"}
            </p>
            <div
              className={`w-full rounded-t-lg ${d.highlight ? "bg-green" : "bg-green/30"}`}
              style={{ height }}
            />
            <p className="text-xs font-semibold text-navy/70">{d.label}</p>
          </div>
        );
      })}
    </div>
  );
}

export default function TreasurerConsole({ session, onLogout }) {
  const navigate = useNavigate();
  const { tab, goTab, tabBack } = useTabNavigation("overview", {
    onBackAtRoot: () => {
      onLogout();
      navigate("/treasurer", { replace: true });
    },
  });
  const [refresh, setRefresh] = useState(0);
  const [statementMember, setStatementMember] = useState(null);
  const docs = useMemo(() => getFinanceDocuments(), [refresh]);
  const stats = useMemo(() => getPoolStats(), [refresh]);
  const unpaid = useMemo(() => getUnpaidTotals(), [refresh]);
  const poolYearly = useMemo(() => getPoolYearlyTotals(), [refresh]);

  const ownMember = session.relatedMemberId
    ? getMember(session.relatedMemberId)
    : null;
  const ownAccount = session.relatedMemberId
    ? getAccount(session.relatedMemberId)
    : null;

  const tabs = [
    { key: "overview", label: "Overview", icon: TrendingUp },
    { key: "register", label: "Check-off register", icon: ClipboardCheck },
    { key: "ledger", label: "Savings ledger", icon: TableIcon },
    { key: "finesloans", label: "Fines & loans", icon: HandCoins },
    { key: "withdrawals", label: "Withdrawals", icon: ArrowUpRight },
    { key: "reconcile", label: "Reconciliation", icon: FileText },
    { key: "settings", label: "Group settings", icon: Settings },
    { key: "documents", label: "Documents", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-navy">
      <header className="border-b border-white/10 bg-navy/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-3 lg:gap-6">
            <BackToLogin
              to="/treasurer"
              onLogout={onLogout}
              onTabBack={tabBack}
              signOutAtRoot
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Back
            </BackToLogin>
            <div className="flex items-center gap-3">
              <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-green/20 text-green sm:inline-flex">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <p className="font-serif text-lg font-bold text-white">
                  Treasurer Portal
                </p>
                <p className="hidden text-xs text-white/50 sm:block">
                  Savings, financial reports & documents · Nyakahura Elites
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
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Active members" value={stats.memberCount} accent="text-white" />
          <Stat label="Savings pool" value={KES(stats.savingsPool)} accent="text-green" />
          <Stat label="Arrears outstanding" value={KES(unpaid.amount)} accent="text-red-400" />
          <Stat label="Invested" value={KES(stats.invested)} accent="text-gold" />
        </div>

        {ownMember && ownAccount && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-xl">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-dark">
                Your member account
              </p>
              <p className="mt-1 font-serif text-2xl font-bold text-navy">
                {ownMember.name}
              </p>
              <p className="text-sm text-navy/60">
                {ownMember.memberNo} · {KES(ownAccount.monthlyContribution)}{" "}
                monthly contribution
              </p>
            </div>
            <div className="text-right">
              <p className="font-serif text-3xl font-bold text-green">
                {KES(ownAccount.balance)}
              </p>
              <p className="text-xs text-navy/50">Your savings balance</p>
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-2 overflow-x-auto">
          {tabs.map((t) => {
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

        {tab === "overview" && (
          <>
            <div className="mt-8">
              <CashPosition onChanged={() => setRefresh((n) => n + 1)} />
            </div>
            <Overview poolYearly={poolYearly} />
            <TreasuryAudit onChanged={refresh} />
            <div className="mt-10">
              <RoleMandate roleKey="treasurer" holder={ownMember} />
            </div>
          </>
        )}
        {tab === "register" && (
          <RegisterTab onChanged={() => setRefresh((n) => n + 1)} />
        )}
        {tab === "ledger" && <Ledger onStatement={setStatementMember} />}
        {tab === "finesloans" && (
          <FinesLoansTab onChanged={() => setRefresh((n) => n + 1)} />
        )}
        {tab === "withdrawals" && (
          <WithdrawalsTab
            session={session}
            onChanged={() => setRefresh((n) => n + 1)}
          />
        )}
        {tab === "reconcile" && <ReconciliationReport />}
        {tab === "settings" && (
          <div className="mt-8">
            <SettingsPanel
              onChanged={() => setRefresh((n) => n + 1)}
              allowReset={false}
            />
          </div>
        )}
        {tab === "documents" && (
          <>
            <UploadCard onDone={() => setRefresh((n) => n + 1)} />
            <DocumentsList docs={docs} onChanged={() => setRefresh((n) => n + 1)} />
          </>
        )}
      </main>

      {statementMember && (
        <MemberStatement
          memberId={statementMember}
          onClose={() => setStatementMember(null)}
        />
      )}
    </div>
  );
}

function Overview({ poolYearly }) {
  const yearValues = poolYearly.map((y) => y.year);
  const monthValues = useMemo(() => getContributionTotalsByMonth(), []);
  const defaultA = yearValues[Math.max(0, yearValues.length - 2)] || yearValues[0];
  const defaultB = yearValues[yearValues.length - 1] || yearValues[0];
  const defaultMonthA = monthValues[Math.max(0, monthValues.length - 2)]?.month || monthValues[0]?.month || "";
  const defaultMonthB = monthValues[monthValues.length - 1]?.month || monthValues[0]?.month || "";
  const [periodMode, setPeriodMode] = useState("year");
  const [yearA, setYearA] = useState(defaultA);
  const [yearB, setYearB] = useState(defaultB);
  const [monthA, setMonthA] = useState(defaultMonthA);
  const [monthB, setMonthB] = useState(defaultMonthB);

  const monthlyPickA = monthValues.find((m) => m.month === monthA) || { month: monthA, total: 0 };
  const monthlyPickB = monthValues.find((m) => m.month === monthB) || { month: monthB, total: 0 };
  const pickA = poolYearly.find((y) => y.year === yearA) || { year: yearA, total: 0 };
  const pickB = poolYearly.find((y) => y.year === yearB) || { year: yearB, total: 0 };
  const activeA = periodMode === "year" ? pickA : monthlyPickA;
  const activeB = periodMode === "year" ? pickB : monthlyPickB;
  const delta = activeB.total - activeA.total;
  const pctChange = activeA.total ? Math.round((delta / activeA.total) * 100) : 0;

  const record = useMemo(() => getSavingsRecord(), []);
  const statusRows = useMemo(
    () =>
      record
        .map((r) => ({
          name: r.name,
          memberNo: r.memberNo,
          grand: r.grandTotal,
          arrears: r.arrears,
        }))
        .sort((a, b) => b.arrears - a.arrears),
    [record],
  );

  return (
    <div className="mt-8 space-y-6">
      <Card
        icon={BarChart3}
        title="Savings trends"
        subtitle="Total group savings collected per year, from the savings record"
      >
        <div className="hidden sm:block">
          <BarChart
            data={poolYearly.map((y, i) => ({
              label: String(y.year),
              value: y.total,
              highlight: i === poolYearly.length - 1,
            }))}
          />
        </div>
        <div className="sm:hidden">
          {poolYearly.map((y) => (
            <div key={y.year} className="mb-3 flex items-center gap-3">
              <span className="w-12 text-sm font-semibold text-navy">{y.year}</span>
              <div className="flex-1">
                <div
                  className="h-6 rounded-full bg-green"
                  style={{
                    width: `${Math.max((y.total / Math.max(...poolYearly.map((p) => p.total), 1)) * 100, 4)}%`,
                  }}
                />
              </div>
              <span className="w-24 text-right text-xs font-bold text-navy">
                {KES(y.total)}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card
        icon={CalendarRange}
        title="Compare periods"
        subtitle="Choose two financial years to compare"
      >
        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => setPeriodMode("year")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              periodMode === "year" ? "bg-navy text-white" : "bg-navy/5 text-navy"
            }`}
          >
            Compare years
          </button>
          <button
            type="button"
            onClick={() => setPeriodMode("month")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              periodMode === "month" ? "bg-navy text-white" : "bg-navy/5 text-navy"
            }`}
          >
            Compare months
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-navy" htmlFor="cmp-a">
              Period A
            </label>
            {periodMode === "year" ? (
              <select
                id="cmp-a"
                value={yearA}
                onChange={(e) => setYearA(Number(e.target.value))}
                className="mt-2 w-full rounded-xl border border-navy/10 px-4 py-3 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
              >
                {yearValues.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            ) : (
              <select
                id="cmp-a"
                value={monthA}
                onChange={(e) => setMonthA(e.target.value)}
                className="mt-2 w-full rounded-xl border border-navy/10 px-4 py-3 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
              >
                {monthValues.map((m) => (
                  <option key={m.month} value={m.month}>
                    {m.month}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy" htmlFor="cmp-b">
              Period B
            </label>
            {periodMode === "year" ? (
              <select
                id="cmp-b"
                value={yearB}
                onChange={(e) => setYearB(Number(e.target.value))}
                className="mt-2 w-full rounded-xl border border-navy/10 px-4 py-3 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
              >
                {yearValues.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            ) : (
              <select
                id="cmp-b"
                value={monthB}
                onChange={(e) => setMonthB(e.target.value)}
                className="mt-2 w-full rounded-xl border border-navy/10 px-4 py-3 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
              >
                {monthValues.map((m) => (
                  <option key={m.month} value={m.month}>
                    {m.month}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-end gap-3 sm:gap-5">
          {[activeA, activeB].map((item, i) => {
            const max = Math.max(activeA.total, activeB.total, 1);
            const barHeight = Math.max((item.total / max) * 140, item.total > 0 ? 10 : 4);
            const label = periodMode === "year" ? String(item.year || item.month) : String(item.month || item.year || "Period");
            return (
              <div key={`${label}-${i}`} className="flex flex-1 flex-col items-center gap-2">
                <p className="text-[11px] font-bold text-green">{KES(item.total)}</p>
                <div
                  className={`w-full rounded-t-lg ${i === 1 ? "bg-green" : "bg-navy/20"}`}
                  style={{ height: barHeight }}
                />
                <p className="text-xs font-semibold text-navy">{label}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-navy/10 pt-5">
          <div>
            <p className="text-xs text-navy/50">{periodMode === "year" ? `${yearA} total` : `${monthA} total`}</p>
            <p className="font-serif text-lg font-bold text-navy">{KES(activeA.total)}</p>
          </div>
          <div>
            <p className="text-xs text-navy/50">{periodMode === "year" ? `${yearB} total` : `${monthB} total`}</p>
            <p className="font-serif text-lg font-bold text-green">{KES(activeB.total)}</p>
          </div>
          <div>
            <p className="text-xs text-navy/50">Change</p>
            <p
              className={`font-serif text-lg font-bold ${
                delta >= 0 ? "text-green" : "text-red-500"
              }`}
            >
              {delta >= 0 ? "+" : ""}
              {KES(Math.abs(delta))}{" "}
              <span className="text-xs">({delta >= 0 ? "+" : ""}{pctChange}%)</span>
            </p>
          </div>
        </div>
      </Card>

      <Card
        icon={Target}
        title="Member savings & arrears report"
        subtitle="Grand savings and arrears per member, straight from the savings record — most in arrears first"
      >
        <div className="space-y-3">
          {statusRows.map((p) => (
            <div key={p.memberNo} className="flex items-center gap-3">
              <div className="w-44 min-w-0 sm:w-52">
                <p className="truncate text-sm font-semibold text-navy">{p.name}</p>
                <p className="text-[11px] text-navy/50">{p.memberNo}</p>
              </div>
              <div className="flex-1">
                <div className="h-3 overflow-hidden rounded-full bg-navy/10">
                  <div
                    className={`h-full rounded-full ${p.arrears <= 0 ? "bg-green" : p.arrears <= 1000 ? "bg-gold" : "bg-red-400"}`}
                    style={{
                      width: `${Math.max((p.grand / Math.max(...statusRows.map((r) => r.grand), 1)) * 100, 4)}%`,
                    }}
                  />
                </div>
              </div>
              <span className="w-20 text-right text-xs font-bold text-navy">
                {KES(p.grand)}
              </span>
              <span
                className={`w-28 shrink-0 rounded-full px-2 py-1 text-center text-[11px] font-semibold ${
                  p.arrears > 0
                    ? "bg-red-100 text-red-600"
                    : p.arrears < 0
                      ? "bg-green/10 text-green"
                      : "bg-navy/5 text-navy/70"
                }`}
              >
                {p.arrears > 0
                  ? `In arrears ${KES(p.arrears)}`
                  : p.arrears < 0
                    ? `Ahead ${KES(-p.arrears)}`
                    : "Up to date"}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function TreasuryAudit({ onChanged }) {
  const entries = useMemo(() => getTreasuryAuditLog(), [onChanged]);

  return (
    <Card
      icon={FileText}
      title="Treasury reconciliation trail"
      subtitle="Latest financial movements, approvals, statements and member account changes"
    >
      <div className="space-y-3">
        {entries.length === 0 ? (
          <p className="rounded-2xl bg-sand px-5 py-8 text-center text-sm text-navy/50">
            No treasury activity recorded yet.
          </p>
        ) : (
          entries.slice(0, 8).map((entry) => (
            <div key={entry.id} className="flex flex-col gap-2 rounded-2xl bg-sand p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-navy">{entry.title}</p>
                <p className="mt-1 text-xs text-navy/60">{entry.detail || "No additional details"}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-right">
                {entry.amount ? (
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-navy">
                    {KES(entry.amount)}
                  </span>
                ) : null}
                <span className="text-[11px] text-navy/45">{entry.date}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

function ReconciliationReport() {
  const entries = useMemo(() => getTreasuryAuditLog(), []);
  const cash = useMemo(() => getCashPosition(), []);
  const [range, setRange] = useState("all");

  const filtered = useMemo(() => {
    if (range === "all") return entries;
    const days = Number(range) || 7;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return entries.filter((entry) => new Date(entry.createdAt || entry.date) >= cutoff);
  }, [entries, range]);

  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((entry) => {
      const dateKey = entry.date || entry.createdAt?.slice(0, 10) || "Unknown";
      const arr = map.get(dateKey) || [];
      arr.push(entry);
      map.set(dateKey, arr);
    });
    return Array.from(map.entries()).sort((a, b) => String(b[0]).localeCompare(String(a[0])));
  }, [filtered]);

  const totals = useMemo(() => {
    const summary = { bank: 0, mmf: 0, other: 0 };
    filtered.forEach((entry) => {
      if (!entry.amount) return;
      if (entry.type === "bank") summary.bank += Number(entry.amount || 0);
      else if (entry.type === "mmf") summary.mmf += Number(entry.amount || 0);
      else summary.other += Number(entry.amount || 0);
    });
    return summary;
  }, [filtered]);

  function exportCsv() {
    const rows = [
      ["Date", "Type", "Title", "Detail", "Amount", "Account", "Co-signers", "Receipt", "Role"],
      ...filtered.map((entry) => [
        entry.date || entry.createdAt?.slice(0, 10) || "",
        entry.type || "",
        entry.title || "",
        entry.detail || "",
        Number(entry.amount || 0),
        entry.account || "",
        (entry.coSigners || []).join("; "),
        entry.receiptName || "",
        entry.role || "",
      ]),
    ];

    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `treasury-reconciliation-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="mt-8 rounded-3xl bg-white p-6 shadow-xl sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-navy">Treasury reconciliation report</h2>
          <p className="mt-1 text-sm text-navy/60">
            Cash and transaction movements by date, with a summary of the latest treasury trail.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="rounded-xl border border-navy/10 bg-sand px-3 py-2 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
          >
            <option value="all">All time</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
          </select>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-light"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-sand p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-navy/50">Bank movements</p>
          <p className="mt-1.5 font-serif text-2xl font-bold text-blue-700">{KES(totals.bank)}</p>
        </div>
        <div className="rounded-2xl bg-sand p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-navy/50">MMF movements</p>
          <p className="mt-1.5 font-serif text-2xl font-bold text-green">{KES(totals.mmf)}</p>
        </div>
        <div className="rounded-2xl bg-sand p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-navy/50">Other activity</p>
          <p className="mt-1.5 font-serif text-2xl font-bold text-navy">{KES(totals.other)}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-sand p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-navy/50">Current position</p>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between"><span>Bank</span><strong>{KES(cash.bank)}</strong></div>
            <div className="flex items-center justify-between"><span>MMF</span><strong>{KES(cash.mmf)}</strong></div>
            <div className="flex items-center justify-between"><span>Liquid</span><strong>{KES(cash.liquid)}</strong></div>
            <div className="flex items-center justify-between"><span>Invested</span><strong>{KES(cash.invested)}</strong></div>
          </div>
        </div>
        <div className="rounded-2xl bg-sand p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-navy/50">Activity snapshot</p>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between"><span>Entries</span><strong>{filtered.length}</strong></div>
            <div className="flex items-center justify-between"><span>Dates covered</span><strong>{grouped.length}</strong></div>
            <div className="flex items-center justify-between"><span>Latest date</span><strong>{filtered[0]?.date || "—"}</strong></div>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {grouped.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-navy/20 px-5 py-10 text-center text-sm text-navy/50">
            No reconciliation entries for the selected period.
          </p>
        ) : (
          grouped.map(([dateKey, dayEntries]) => (
            <div key={dateKey} className="rounded-2xl border border-navy/10 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="font-serif text-lg font-bold text-navy">{dateKey}</p>
                <span className="rounded-full bg-navy/5 px-2.5 py-1 text-[11px] font-semibold text-navy">
                  {dayEntries.length} events
                </span>
              </div>

              <div className="space-y-2">
                {dayEntries.map((entry) => (
                  <div key={entry.id} className="flex flex-col gap-2 rounded-xl bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-navy">{entry.title}</p>
                      <p className="text-xs text-navy/60">{entry.detail || "No additional details"}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-right">
                      {entry.amount ? (
                        <span className="rounded-full bg-sand px-2.5 py-1 text-[11px] font-semibold text-navy">
                          {KES(entry.amount)}
                        </span>
                      ) : null}
                      <span className="text-[11px] font-medium text-navy/50">{entry.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function fmtAmount(value) {
  return Number(value).toLocaleString("en-KE");
}

function amountCell(value) {
  if (value == null) return <span className="text-navy/40">—</span>;
  return (
    <span className={value < 0 ? "text-red-500" : "text-navy/70"}>
      {fmtAmount(value)}
    </span>
  );
}

function exportLedgerCsv(rows, totals) {
  const header = ["No.", "Name", ...YEAR_COLUMNS, "Grand total", "Arrears"];
  const lines = rows.map((r) => [
    r.memberNo,
    `"${r.name}"`,
    ...YEAR_COLUMNS.map((y) => r.years[y] ?? ""),
    r.grand,
    r.arrears,
  ]);
  const totalLine = [
    "Total",
    `${rows.length}`,
    ...YEAR_COLUMNS.map((y) => totals.byYear[y] || 0),
    totals.grand,
    totals.arrears,
  ];
  const csv = [header, ...lines, totalLine]
    .map((row) => row.join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `neig-savings-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function Ledger({ onStatement }) {
  const [query, setQuery] = useState("");
  const docUrl = `${import.meta.env.BASE_URL}Photos/NEIG  2023 SAVINGS RECORD - Arrears -2.pdf`;
  const members = useMemo(() => getMembers().filter((m) => m.role === "member"), []);
  const record = useMemo(() => getSavingsRecord(), []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members
      .map((m) => {
        const rec = record.find((r) => r.memberId === m.id);
        return {
          id: m.id,
          memberNo: rec ? rec.memberNo : m.memberNo,
          name: m.name,
          years: rec ? rec.years : { 2023: null, 2024: null, 2025: null, 2026: null },
          grand: rec ? rec.grandTotal : 0,
          arrears: rec ? rec.arrears : 0,
          hasRecord: Boolean(rec),
        };
      })
      .filter(
        (r) =>
          !q ||
          String(r.name || "").toLowerCase().includes(q) ||
          String(r.memberNo || "").toLowerCase().includes(q),
      )
      .sort((a, b) => String(a.memberNo || "").localeCompare(String(b.memberNo || "")));
  }, [members, record, query]);

  const totals = useMemo(() => {
    const byYear = {};
    let grand = 0;
    let arrears = 0;
    for (const r of rows) {
      grand += r.grand;
      arrears += r.arrears;
      for (const y of YEAR_COLUMNS) {
        byYear[y] = (byYear[y] || 0) + (r.years[y] || 0);
      }
    }
    return { byYear, grand, arrears };
  }, [rows]);

  return (
    <section className="mt-8 rounded-3xl bg-white p-6 shadow-xl sm:p-8">
      <div>
        <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-navy">
          <TableIcon className="h-5 w-5 text-green" />
          Member savings ledger
        </h2>
        <p className="mt-1 text-sm text-navy/60">
          Annual savings per member — exact figures from the group's savings
          record (prepared 09/06/2026). Monthly contribution: {KES(500)}.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => {
              if (rows.length === 0) return;
              exportLedgerCsv(rows, totals);
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-4 py-2 text-xs font-semibold text-navy transition-colors hover:bg-navy/10"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
          <a
            href={docUrl}
            download="NEIG  2023 SAVINGS RECORD - Arrears -2.pdf"
            className="inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-4 py-2 text-xs font-semibold text-navy transition-colors hover:bg-navy/10"
          >
            <Download className="h-3.5 w-3.5" />
            Savings record file
          </a>
        </div>
      </div>

      <div className="relative mt-5">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or member number…"
          className="w-full rounded-xl border border-navy/10 py-3 pl-11 pr-4 text-sm text-navy outline-none placeholder:text-navy/40 focus:border-navy focus:ring-2 focus:ring-navy/10"
        />
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b-2 border-navy/10 text-[11px] uppercase tracking-wide text-navy/50">
              <th className="py-3 pr-3 font-semibold">No.</th>
              <th className="py-3 pr-3 font-semibold">Name</th>
              {YEAR_COLUMNS.map((y) => (
                <th key={y} className="py-3 pr-3 text-right font-semibold">
                  {y}
                </th>
              ))}
              <th className="py-3 pr-3 text-right font-semibold">Grand</th>
              <th className="py-3 pr-3 text-right font-semibold">Arrears</th>
              <th className="py-3 text-right font-semibold">Statement</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="border-b border-navy/5 transition-colors hover:bg-sand/50"
              >
                <td className="py-3 pr-3 font-medium text-navy/60">{r.memberNo}</td>
                <td className="py-3 pr-3 font-semibold text-navy">{r.name}</td>
                {YEAR_COLUMNS.map((y) => (
                  <td key={y} className="py-3 pr-3 text-right">
                    {amountCell(r.years[y])}
                  </td>
                ))}
                <td className="py-3 pr-3 text-right font-serif font-bold text-green">
                  {fmtAmount(r.grand)}
                </td>
                <td className="py-3 pr-3 text-right">
                  {r.arrears > 0 ? (
                    <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-600">
                      {fmtAmount(r.arrears)}
                    </span>
                  ) : r.arrears < 0 ? (
                    <span className="inline-flex rounded-full bg-green/10 px-2.5 py-1 text-[11px] font-semibold text-green">
                      -{fmtAmount(-r.arrears)}
                    </span>
                  ) : (
                    <span className="text-navy/40">—</span>
                  )}
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => onStatement && onStatement(r.id)}
                    className="inline-flex items-center gap-1 rounded-full bg-navy/5 px-3 py-1.5 text-[11px] font-semibold text-navy transition-colors hover:bg-navy/10"
                  >
                    <Printer className="h-3 w-3" />
                    Statement
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="py-10 text-center text-sm text-navy/50">
                  No members match your search.
                </td>
              </tr>
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="bg-sand/70 font-semibold text-navy">
                <td className="py-3 pr-3">Total</td>
                <td className="py-3 pr-3">{rows.length} members</td>
                {YEAR_COLUMNS.map((y) => (
                  <td key={y} className="py-3 pr-3 text-right">
                    {fmtAmount(totals.byYear[y] || 0)}
                  </td>
                ))}
                <td className="py-3 pr-3 text-right font-serif text-green">
                  {fmtAmount(totals.grand)}
                </td>
                <td className="py-3 text-right">
                  <span className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-bold text-red-600">
                    {fmtAmount(totals.arrears)}
                  </span>
                </td>
                <td className="py-3" />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </section>
  );
}

function UploadCard({ onDone }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("savings");
  const [periodFrom, setPeriodFrom] = useState("");
  const [periodTo, setPeriodTo] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileRef = useRef(null);

  function handleFile(e) {
    const f = e.target.files?.[0] || null;
    setError("");
    if (!f) {
      setFile(null);
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setError(
        `"${f.name}" is ${(f.size / 1024 / 1024).toFixed(1)} MB — too large (max 2.5 MB in the demo).`,
      );
      setFile(null);
      return;
    }
    setFile(f);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!title.trim()) return setError("Give the document a title.");
    if (!file) return setError("Choose a file to upload.");

    let dataUrl = null;
    if (file) {
      dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    }
    try {
      addFinanceDocument({
        title: title.trim(),
        category,
        periodFrom: periodFrom || undefined,
        periodTo: periodTo || undefined,
        note: note.trim() || undefined,
        fileName: file.name,
        mime: file.type || "application/octet-stream",
        sizeBytes: file.size,
        dataUrl,
        uploadedBy: "Jane Wangari (Treasurer)",
      });
      setSuccess(`"${title.trim()}" uploaded.`);
      setTitle("");
      setCategory("savings");
      setPeriodFrom("");
      setPeriodTo("");
      setNote("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      onDone();
    } catch (err2) {
      setError(err2.message);
    }
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-navy">
            <FileUp className="h-5 w-5 text-green" />
            Upload a financial document
          </h2>
          <p className="mt-1 text-sm text-navy/60">
            Attach a savings record, bank statement, arrears or investment
            report for the group's records.
          </p>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-1.5 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-light"
        >
          {open ? (
            <>
              <X className="h-4 w-4" /> Close
            </>
          ) : (
            <>
              <FileUp className="h-4 w-4" /> Upload document
            </>
          )}
        </button>
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 border-t border-navy/10 pt-6">
          {error && (
            <p className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-xl bg-green/10 px-4 py-3 text-sm font-medium text-green ring-1 ring-green/20">
              {success}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-navy" htmlFor="doc-title">
                Document title *
              </label>
              <input
                id="doc-title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Savings Record 2026"
                className="mt-2 w-full rounded-xl border border-navy/10 px-4 py-3 text-sm text-navy outline-none placeholder:text-navy/40 focus:border-navy focus:ring-2 focus:ring-navy/10"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy" htmlFor="doc-cat">
                Category
              </label>
              <select
                id="doc-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-2 w-full rounded-xl border border-navy/10 px-4 py-3 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy" htmlFor="doc-period">
                Period covered (optional)
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input
                  type="month"
                  value={periodFrom}
                  onChange={(e) => setPeriodFrom(e.target.value)}
                  aria-label="From month"
                  className="rounded-xl border border-navy/10 px-3 py-3 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
                />
                <input
                  type="month"
                  value={periodTo}
                  onChange={(e) => setPeriodTo(e.target.value)}
                  aria-label="To month"
                  className="rounded-xl border border-navy/10 px-3 py-3 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy" htmlFor="doc-file">
              File (PDF, Excel, image…) *
            </label>
            <input
              id="doc-file"
              ref={fileRef}
              type="file"
              accept=".pdf,.xlsx,.xls,.csv,.txt,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFile}
              className="mt-2 w-full rounded-xl border border-dashed border-navy/20 bg-sand px-4 py-8 text-sm text-navy/70 file:mr-4 file:rounded-full file:border-0 file:bg-navy file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:border-navy/40"
            />
            {file && (
              <p className="mt-2 text-xs font-semibold text-green">
                {file.name} · {(file.size / 1024).toFixed(0)} KB — ready
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy" htmlFor="doc-note">
              Short description (optional)
            </label>
            <textarea
              id="doc-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What does this document cover?"
              className="mt-2 w-full rounded-xl border border-navy/10 px-4 py-3 text-sm text-navy outline-none placeholder:text-navy/40 focus:border-navy focus:ring-2 focus:ring-navy/10"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-green px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-dark"
          >
            <FileUp className="h-4 w-4" />
            Upload document
          </button>
        </form>
      )}
    </section>
  );
}

function DocumentsList({ docs, onChanged }) {
  return (
    <section className="mt-8 rounded-3xl bg-white p-6 shadow-xl sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-navy">
            <FileText className="h-5 w-5 text-green" />
            Financial documents ({docs.length})
          </h2>
          <p className="mt-1 text-sm text-navy/60">
            Statements, savings records, arrears and investment reports.
          </p>
        </div>
      </div>

      {docs.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-sand px-5 py-8 text-center text-sm text-navy/50">
          No financial documents uploaded yet.
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {docs.map((doc) => {
            const cat =
              CATEGORIES.find((c) => c.key === doc.category) ||
              CATEGORIES[CATEGORIES.length - 1];
            return (
              <li key={doc.id} className="rounded-2xl bg-sand p-5 ring-1 ring-navy/5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${CATEGORY_STYLES[doc.category] || CATEGORY_STYLES.other}`}
                      >
                        {cat.label}
                      </span>
                      {doc.recordedAmount ? (
                        <span className="inline-flex rounded-full bg-navy/5 px-2.5 py-1 text-[11px] font-semibold text-navy">
                          KES {Number(doc.recordedAmount).toLocaleString("en-KE")}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2.5 font-serif text-lg font-bold text-navy">
                      {doc.title}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-navy/50">
                      {doc.periodFrom && (
                        <span className="inline-flex items-center gap-1">
                          <CalendarRange className="h-3.5 w-3.5" />
                          {String(doc.periodFrom).replace("-", "/")}
                          {doc.periodTo ? ` — ${String(doc.periodTo).replace("-", "/")}` : ""}
                        </span>
                      )}
                      <span>
                        Uploaded {doc.createdAt} by {doc.uploadedBy}
                      </span>
                      {doc.sizeBytes ? (
                        <span>{(doc.sizeBytes / 1024).toFixed(0)} KB</span>
                      ) : null}
                    </p>
                    {doc.note && (
                      <p className="mt-2 text-sm leading-relaxed text-navy/70">
                        {doc.note}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {doc.dataUrl && (
                      <a
                        href={doc.dataUrl}
                        download={doc.fileName || "document.txt"}
                        className="inline-flex items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-navy-light"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </a>
                    )}
                    <button
                      onClick={() => {
                        if (
                          window.confirm(`Delete "${doc.title}"? This cannot be undone.`)
                        ) {
                          deleteFinanceDocument(doc.id);
                          onChanged();
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 ring-1 ring-red-200 transition-colors hover:bg-red-100"
                      aria-label={`Delete ${doc.title}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}