import { Printer, X } from "lucide-react";
import {
  getMember,
  getAccount,
  getHistory,
  getMemberSavings,
  getConfig,
  getContributionForMonth,
  KES,
} from "../../lib/store";

const inputRow = "border-b border-navy/10";
const amountCls = (v) => (v < 0 ? "text-red-500" : "text-navy/80");

export default function MemberStatement({ memberId, onClose }) {
  const member = getMember(memberId);
  const account = getAccount(memberId);
  const history = getHistory(memberId).slice(0, 20);
  const record = getMemberSavings(memberId);
  const cfg = getConfig();

  if (!member) return null;
  const years = record ? record.years : {};
  const grand = record ? record.grandTotal : account?.balance || 0;
  const arrears = record ? record.arrears : 0;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy/60 p-4 backdrop-blur-sm sm:p-8">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl sm:p-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy font-serif text-xl font-bold text-gold">
              N
            </div>
            <div>
              <p className="font-serif text-xl font-bold text-navy">
                Nyakahura Elites Investment Group
              </p>
              <p className="text-xs text-navy/50">
                Member savings statement · prepared {today}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-navy/40 transition-colors hover:bg-navy/5"
            aria-label="Close statement"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-8 grid gap-4 rounded-2xl bg-sand p-6 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-navy/50">Member</p>
            <p className="font-serif text-2xl font-bold text-navy">{member.name}</p>
            <p className="text-sm text-navy/60">{member.memberNo}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-[11px] font-bold uppercase tracking-wider text-navy/50">
              Current contribution
            </p>
            <p className="font-serif text-2xl font-bold text-green">
              {KES(getContributionForMonth(today.slice(0, 7)))} / month
            </p>
            <p className="text-sm text-navy/60">
              {member.occupation || "Member since " + member.joined}
              {member.phone ? ` · ${member.phone}` : ""}
            </p>
          </div>
        </div>

        <h3 className="mt-8 text-xs font-bold uppercase tracking-wider text-navy/50">
          Savings record (yearly totals)
        </h3>
        <table className="mt-2 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-navy/10 text-left text-[11px] uppercase tracking-wide text-navy/50">
              <th className="py-2 pr-3 font-semibold">Year</th>
              {[2023, 2024, 2025, 2026].map((y) => (
                <th key={y} className="py-2 pr-3 text-right font-semibold">
                  {y}
                </th>
              ))}
              <th className="py-2 pr-3 text-right font-semibold">Grand total</th>
              <th className="py-2 text-right font-semibold">Arrears</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-3 font-semibold text-navy">Annual total</td>
              {[2023, 2024, 2025, 2026].map((y) => (
                <td key={y} className={`py-3 pr-3 text-right ${amountCls(years[y] || 0)}`}>
                  {years[y] == null ? "—" : Number(years[y]).toLocaleString("en-KE")}
                </td>
              ))}
              <td className="py-3 pr-3 text-right font-serif font-bold text-green">
                {Number(grand).toLocaleString("en-KE")}
              </td>
              <td className={`py-3 text-right font-bold ${arrears > 0 ? "text-red-500" : arrears < 0 ? "text-green" : "text-navy/40"}`}>
                {arrears > 0 ? Number(arrears).toLocaleString("en-KE") : arrears < 0 ? `-${Number(-arrears).toLocaleString("en-KE")}` : "—"}
              </td>
            </tr>
          </tbody>
        </table>

        <h3 className="mt-8 text-xs font-bold uppercase tracking-wider text-navy/50">
          Recent contributions & withdrawals
        </h3>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-navy/40">No activity recorded yet.</p>
        ) : (
          <table className="mt-2 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-navy/10 text-left text-[11px] uppercase tracking-wide text-navy/50">
                <th className="py-2 pr-3 font-semibold">Date</th>
                <th className="py-2 pr-3 font-semibold">Type</th>
                <th className="py-2 pr-3 font-semibold">Note</th>
                <th className="py-2 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {history.map((e) => (
                <tr key={e.id}>
                  <td className="py-2.5 pr-3 text-navy/60">{e.date}</td>
                  <td className="py-2.5 pr-3 capitalize text-navy/70">{e.type}</td>
                  <td className="py-2.5 pr-3 text-navy/70">{e.note}</td>
                  <td className={`py-2.5 text-right font-semibold ${amountCls(e.amount)}`}>
                    {e.amount < 0 ? "-" : ""}
                    {KES(Math.abs(e.amount))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-navy/10 pt-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-navy/50">
              Current savings balance
            </p>
            <p className="font-serif text-3xl font-bold text-green">{KES(account?.balance || 0)}</p>
            <p className="text-xs text-navy/50">
              {cfg.monthlyContribution ? `${KES(getContributionForMonth("2027-01"))} per month from Jan 2027` : ""}
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-light"
          >
            <Printer className="h-4 w-4" />
            Print / Save as PDF
          </button>
        </div>
      </div>
    </div>
  );
}