import { useMemo, useState } from "react";
import { AlertOctagon, HandCoins, Plus, Check, Trash2 } from "lucide-react";
import {
  getMembers,
  getFinesLog,
  getLoans,
  loanOutstanding,
  addFine,
  settleFine,
  deleteFine,
  addLoan,
  addLoanRepayment,
  getConfig,
  KES,
} from "../../lib/store";

const inputCls =
  "w-full rounded-xl border border-navy/10 bg-white px-3.5 py-2.5 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10";

const FINE_TYPES = [
  { key: "meeting", label: "Missed meeting" },
  { key: "late", label: "Late payment" },
  { key: "other", label: "Other" },
];

function Section({ icon: Icon, title, subtitle, children, actions }) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold-dark">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-navy">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-navy/60">{subtitle}</p>}
          </div>
        </div>
        {actions}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function FinesSection({ onChanged }) {
  const [view, setView] = useState("list");
  const fines = useMemo(() => getFinesLog(), [onChanged]);
  const members = useMemo(() => getMembers().filter((m) => m.role === "member"), []);
  const cfg = getConfig();

  const [memberId, setMemberId] = useState(members[0]?.id || "");
  const [type, setType] = useState("meeting");
  const [amount, setAmount] = useState(String(cfg.fineMeeting));
  const [label, setLabel] = useState("");
  const [msg, setMsg] = useState("");

  const unpaidTotal = fines.filter((f) => f.status === "unpaid").reduce((s, f) => s + f.amount, 0);

  const byName = Object.fromEntries(members.map((m) => [m.id, m.name]));

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Section
        icon={AlertOctagon}
        title="Fines"
        subtitle={`${fines.filter((f) => f.status === "unpaid").length} unpaid · ${KES(unpaidTotal)}`}
        actions={
          <button
            onClick={() => setView((v) => (v === "list" ? "new" : "list"))}
            className="inline-flex items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-navy-light"
          >
            <Plus className="h-3.5 w-3.5" />
            {view === "list" ? "Add fine" : "View fines"}
          </button>
        }
      >
        {view === "new" ? (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className={inputCls}>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.memberNo} · {m.name}
                  </option>
                ))}
              </select>
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setAmount(
                    e.target.value === "late"
                      ? String(cfg.fineLate)
                      : e.target.value === "meeting"
                        ? String(cfg.fineMeeting)
                        : "",
                  );
                }}
                className={inputCls}
              >
                {FINE_TYPES.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Description, e.g. Missed meeting — Aug 2026"
              className={inputCls}
            />
            <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (KES)" className={inputCls} />
            <button
              onClick={() => {
                try {
                  addFine({
                    memberId,
                    type,
                    label:
                      label.trim() ||
                      `${FINE_TYPES.find((t) => t.key === type)?.label} fine`,
                    amount,
                    date: new Date().toISOString().slice(0, 10),
                  });
                  setMsg("Fine recorded.");
                  setLabel("");
                  setView("list");
                  onChanged();
                } catch (e) {
                  setMsg(e.message);
                }
              }}
              className="inline-flex items-center gap-2 rounded-full bg-green px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-dark"
            >
              <Plus className="h-4 w-4" />
              Record fine
            </button>
            {msg && <p className="text-xs font-medium text-navy/60">{msg}</p>}
          </div>
        ) : (
          <div className="space-y-2.5">
            {fines.length === 0 && (
              <p className="rounded-2xl bg-sand px-5 py-8 text-center text-sm text-navy/50">
                No fines recorded yet.
              </p>
            )}
            {fines.slice(0, 20).map((f) => (
              <div
                key={f.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-sand p-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-navy">{byName[f.memberId] || "—"}</p>
                  <p className="text-xs text-navy/50">
                    {f.date} · {f.label}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-lg font-bold text-navy">{KES(f.amount)}</span>
                  {f.status === "paid" ? (
                    <span className="inline-flex rounded-full bg-green/10 px-2.5 py-1 text-[11px] font-semibold text-green">
                      Paid
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        settleFine(f.id);
                        onChanged();
                      }}
                      className="inline-flex items-center gap-1 rounded-full bg-green px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-green-dark"
                    >
                      <Check className="h-3 w-3" /> Settle
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (window.confirm("Delete this fine?")) {
                        deleteFine(f.id);
                        onChanged();
                      }
                    }}
                    className="rounded-full p-1.5 text-navy/40 transition-colors hover:bg-red-50 hover:text-red-500"
                    aria-label="Delete fine"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <LoansSection onChanged={onChanged} />
    </div>
  );
}

function LoansSection({ onChanged }) {
  const loans = useMemo(() => getLoans(), [onChanged]);
  const members = useMemo(() => getMembers().filter((m) => m.role === "member"), []);
  const byName = Object.fromEntries(members.map((m) => [m.id, m.name]));

  const [tab, setTab] = useState("list");
  const [memberId, setMemberId] = useState(members[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [interestPct, setInterestPct] = useState("10");
  const [reason, setReason] = useState("");
  const [payment, setPayment] = useState({ loanId: "", amount: "", date: "" });
  const [msg, setMsg] = useState("");

  return (
    <Section
      icon={HandCoins}
      title="Welfare / loans register"
      subtitle={`${loans.filter((l) => l.status === "active").length} active loans`}
      actions={
        <button
          onClick={() => setTab((t) => (t === "list" ? "new" : "list"))}
          className="inline-flex items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-navy-light"
        >
          <Plus className="h-3.5 w-3.5" />
          {tab === "list" ? "Disburse loan" : "View loans"}
        </button>
      }
    >
      {tab === "new" ? (
        <div className="space-y-3">
          <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className={inputCls}>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.memberNo} · {m.name}
              </option>
            ))}
          </select>
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Principal (KES)" className={inputCls} />
            <input value={interestPct} onChange={(e) => setInterestPct(e.target.value)} placeholder="Interest %" className={inputCls} />
          </div>
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (e.g. school fees, medical)" className={inputCls} />
          <button
            onClick={() => {
              try {
                addLoan({ memberId, amount, interestPct, reason });
                setMsg("Loan disbursed.");
                setAmount("");
                setReason("");
                setTab("list");
                onChanged();
              } catch (e) {
                setMsg(e.message);
              }
            }}
            className="inline-flex items-center gap-2 rounded-full bg-green px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-dark"
          >
            <Plus className="h-4 w-4" />
            Disburse loan
          </button>
          {msg && <p className="text-xs font-medium text-navy/60">{msg}</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {loans.length === 0 && (
            <p className="rounded-2xl bg-sand px-5 py-8 text-center text-sm text-navy/50">
              No loans recorded yet.
            </p>
          )}
          {loans.map((l) => {
            const outstanding = loanOutstanding(l);
            const repaid = (l.repayments || []).reduce((s, r) => s + r.amount, 0);
            return (
              <div key={l.id} className="rounded-2xl bg-sand p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-navy">{byName[l.memberId] || "—"}</p>
                    <p className="text-xs text-navy/50">
                      {l.date} · {l.reason || "Loan"} · {l.interestPct}% interest
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      l.status === "settled" ? "bg-green/10 text-green" : "bg-gold/15 text-gold-dark"
                    }`}
                  >
                    {l.status === "settled" ? "Settled" : "Active"}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <div>
                    <p className="text-[11px] text-navy/50">Principal</p>
                    <p className="font-bold text-navy">{KES(l.amount)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-navy/50">Repaid</p>
                    <p className="font-bold text-green">{KES(repaid)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-navy/50">Outstanding</p>
                    <p className="font-bold text-red-500">{KES(outstanding)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-navy/50">Repayments</p>
                    <p className="font-bold text-navy">{(l.repayments || []).length}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {loans.some((l) => l.status === "active") && (
            <div className="mt-4 flex flex-wrap items-end gap-2 rounded-2xl border border-navy/10 p-4">
              <label className="block flex-1 min-w-[160px]">
                <span className="text-xs font-bold uppercase tracking-wider text-navy/50">Loan</span>
                <select
                  value={payment.loanId}
                  onChange={(e) => setPayment((p) => ({ ...p, loanId: e.target.value }))}
                  className={`${inputCls} mt-1.5`}
                >
                  <option value="">Select active loan…</option>
                  {loans.filter((l) => l.status === "active").map((l) => (
                    <option key={l.id} value={l.id}>
                      {byName[l.memberId]} — {KES(l.amount)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block w-32">
                <span className="text-xs font-bold uppercase tracking-wider text-navy/50">Amount</span>
                <input
                  value={payment.amount}
                  onChange={(e) => setPayment((p) => ({ ...p, amount: e.target.value }))}
                  className={`${inputCls} mt-1.5`}
                />
              </label>
              <button
                onClick={() => {
                  try {
                    addLoanRepayment(payment.loanId, payment.amount);
                    setPayment({ loanId: "", amount: "", date: "" });
                    setMsg("Repayment recorded.");
                    onChanged();
                  } catch (e) {
                    setMsg(e.message);
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-light"
              >
                Record repayment
              </button>
              {msg && <p className="w-full text-xs font-medium text-navy/60">{msg}</p>}
            </div>
          )}
        </div>
      )}
    </Section>
  );
}

export default function FinesLoansTab({ onChanged }) {
  return <FinesSection onChanged={onChanged} />;
}