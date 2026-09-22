import { useMemo, useState } from "react";
import {
  Landmark,
  TrendingUp,
  PiggyBank,
  Search,
  AlertTriangle,
} from "lucide-react";
import {
  getActiveMembers,
  getAccount,
  getMemberSavings,
  getPoolStats,
  getCashPosition,
  getUnpaidTotals,
  getPoolYearlyTotals,
} from "../../lib/store";

function KES(n) {
  return "KES " + Number(n || 0).toLocaleString("en-KE");
}

function Section({ title, subtitle, children }) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-xl sm:p-7">
      <h3 className="font-serif text-lg font-bold text-navy">{title}</h3>
      {subtitle && <p className="mt-0.5 text-sm text-navy/60">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function MiniStat({ label, value, classValue }) {
  return (
    <div className="rounded-2xl bg-sand p-4 ring-1 ring-navy/5">
      <p className="text-[11px] font-bold uppercase tracking-wider text-navy/50">
        {label}
      </p>
      <p className={`mt-1.5 font-serif text-xl font-bold ${classValue}`}>{value}</p>
    </div>
  );
}

function ArrearsChip({ arrears }) {
  if (!arrears) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green/10 px-2 py-0.5 text-[11px] font-semibold text-green">
        Up to date
      </span>
    );
  }
  if (arrears > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-600">
        <AlertTriangle className="h-3 w-3" />
        Arrears {KES(arrears)}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green/10 px-2 py-0.5 text-[11px] font-semibold text-green">
      Ahead {KES(-arrears)}
    </span>
  );
}

export default function FinancesMembers({ onChanged }) {
  const [q, setQ] = useState("");

  const pool = getPoolStats();
  const cash = getCashPosition();
  const unpaid = getUnpaidTotals();
  const yearly = getPoolYearlyTotals();
  const members = getActiveMembers();

  const roster = useMemo(
    () =>
      members
        .map((m) => {
          const acc = getAccount(m.id);
          const sv = getMemberSavings(m.id);
          return {
            id: m.id,
            name: m.name,
            memberNo: m.memberNo,
            status: m.status,
            balance: acc ? acc.balance || 0 : 0,
            monthly: acc ? acc.monthlyContribution || 0 : 0,
            arrears: sv ? sv.arrears ?? 0 : 0,
            grand: sv ? sv.grandTotal ?? 0 : 0,
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    [members],
  );

  const query = q.trim().toLowerCase();
  const filtered = query
    ? roster.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.memberNo.toLowerCase().includes(query),
      )
    : roster;

  const shareRows = [
    { label: "Bank accounts", value: cash.bank, classValue: "bg-blue-600" },
    { label: "Money market fund (KCB MMF)", value: cash.mmf, classValue: "bg-green" },
    { label: "Invested elsewhere", value: cash.invested, classValue: "bg-gold-dark" },
  ];
  const shareTotal = Math.max(cash.bank + cash.mmf + cash.invested, 1);
  const maxYear = Math.max(...yearly.map((y) => y.total), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-white">
            Finances & members
          </h2>
          <p className="mt-1 text-sm text-white/60">
            Read-only snapshot for leadership. The treasurer manages these
            records.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat
          label="Savings pool"
          value={KES(pool.savingsPool)}
          classValue="text-green"
        />
        <MiniStat label="Liquid (bank + MMF)" value={KES(cash.liquid)} classValue="text-gold-dark" />
        <MiniStat label="Invested" value={KES(cash.invested)} classValue="text-navy" />
        <MiniStat
          label="Arrears outstanding"
          value={`${KES(unpaid.amount)} · ${unpaid.count}`}
          classValue="text-red-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section
          title="Where the money sits"
          subtitle="Current split of group funds"
        >
          <div className="space-y-4">
            {shareRows.map((d) => (
              <div key={d.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-navy">{d.label}</span>
                  <span className="font-bold text-navy">{KES(d.value)}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-navy/10">
                  <div
                    className={`h-full rounded-full ${d.classValue}`}
                    style={{ width: `${Math.max((d.value / shareTotal) * 100, d.value > 0 ? 3 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Savings trend"
          subtitle="Total group savings collected per year"
        >
          <div>
            {yearly.map((y) => (
              <div key={y.year} className="mb-3 flex items-center gap-3">
                <span className="w-12 text-sm font-semibold text-navy">{y.year}</span>
                <div className="flex-1">
                  <div
                    className="h-5 rounded-full bg-green"
                    style={{ width: `${Math.max((y.total / maxYear) * 100, y.total > 0 ? 4 : 2)}%` }}
                  />
                </div>
                <span className="w-24 text-right text-xs font-bold text-navy">
                  {KES(y.total)}
                </span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section
        title="Members"
        subtitle="Active members with savings balances and arrears"
      >
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-navy/10 bg-sand px-3.5 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-navy/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or member no…"
            className="w-full bg-transparent text-sm text-navy outline-none placeholder:text-navy/40"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-navy/10 text-[11px] uppercase tracking-wider text-navy/50">
                <th className="pb-2 pr-3 font-bold">Member</th>
                <th className="pb-2 pr-3 font-bold">Status</th>
                <th className="pb-2 pr-3 text-right font-bold">Monthly</th>
                <th className="pb-2 pr-3 text-right font-bold">Savings</th>
                <th className="pb-2 text-right font-bold">Standing</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-navy/5">
                  <td className="py-2.5 pr-3">
                    <p className="font-semibold text-navy">{r.name}</p>
                    <p className="text-[11px] text-navy/50">{r.memberNo}</p>
                  </td>
                  <td className="py-2.5 pr-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        r.status === "on_hold"
                          ? "bg-gold/15 text-gold-dark"
                          : "bg-green/10 text-green"
                      }`}
                    >
                      {r.status === "on_hold" ? "On hold" : "Active"}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-right font-semibold text-navy">
                    {KES(r.monthly)}
                  </td>
                  <td className="py-2.5 pr-3 text-right font-semibold text-navy">
                    {KES(r.balance)}
                  </td>
                  <td className="py-2.5 text-right">
                    <ArrearsChip arrears={r.arrears} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-navy/40">
                    No members match “{q}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}