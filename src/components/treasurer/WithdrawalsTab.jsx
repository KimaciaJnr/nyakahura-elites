import { useState } from "react";
import { ArrowUpRight, HandCoins, Wallet } from "lucide-react";
import { getActiveMembers, getWithdrawals, recordMemberWithdrawal, KES } from "../../lib/store";

export default function WithdrawalsTab({ onChanged }) {
  const [form, setForm] = useState({ memberId: "", amount: "", reason: "", date: "" });
  const [notice, setNotice] = useState(null);

  const withdrawals = getWithdrawals();
  const members = getActiveMembers();
  const byName = Object.fromEntries(members.map((m) => [m.id, m.name]));

  function submit() {
    try {
      recordMemberWithdrawal({
        memberId: form.memberId,
        amount: form.amount,
        reason: form.reason,
        date: form.date || undefined,
      });
      setNotice(null);
      setForm({ memberId: "", amount: "", reason: "", date: "" });
      onChanged();
    } catch (err) {
      setNotice(err.message);
    }
  }

  return (
    <div className="mt-8 space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold-dark">
            <HandCoins className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-navy">
              Record a member withdrawal
            </h2>
            <p className="text-sm text-navy/60">
              Savings are held in the group account — only elected officials can
              authorise transfers. Recording one deducts the amount from the
              member's savings and posts it to their statement.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <select
            value={form.memberId}
            onChange={(e) => setForm({ ...form, memberId: e.target.value })}
            className="rounded-xl border border-navy/10 bg-white py-3 px-4 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
          >
            <option value="">Select member…</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} · {m.memberNo}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="Amount (KES)"
            className="rounded-xl border border-navy/10 py-3 px-4 text-sm text-navy outline-none placeholder:text-navy/40 focus:border-navy focus:ring-2 focus:ring-navy/10"
          />
          <input
            type="text"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            placeholder="Reason"
            className="rounded-xl border border-navy/10 py-3 px-4 text-sm text-navy outline-none placeholder:text-navy/40 focus:border-navy focus:ring-2 focus:ring-navy/10"
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="rounded-xl border border-navy/10 py-3 px-4 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
          />
        </div>

        {notice && (
          <p className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
            {notice}
          </p>
        )}

        <div className="mt-4">
          <button
            onClick={submit}
            disabled={!form.memberId || !form.amount}
            className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowUpRight className="h-4 w-4" />
            Record withdrawal
          </button>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sand text-navy/70">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-navy">
              Withdrawal history ({withdrawals.length})
            </h2>
            <p className="text-sm text-navy/60">
              Every payout processed by the executive from the group account.
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b-2 border-navy/10 text-[11px] uppercase tracking-wide text-navy/50">
                <th className="py-3 pr-3 font-semibold">Member</th>
                <th className="py-3 pr-3 font-semibold">Date</th>
                <th className="py-3 pr-3 font-semibold">Reason</th>
                <th className="py-3 pr-3 text-right font-semibold">Amount</th>
                <th className="py-3 text-right font-semibold">Recorded by</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => (
                <tr key={w.id} className="border-b border-navy/5">
                  <td className="py-3 pr-3 font-semibold text-navy">
                    {byName[w.memberId] || "—"}
                  </td>
                  <td className="py-3 pr-3 text-navy/60">{w.date}</td>
                  <td className="py-3 pr-3 text-navy/70">{w.reason || "—"}</td>
                  <td className="py-3 pr-3 text-right font-bold text-navy">{KES(w.amount)}</td>
                  <td className="py-3 text-right text-navy/60">{w.recordedBy || "Treasurer"}</td>
                </tr>
              ))}
              {withdrawals.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-navy/50">
                    No withdrawals recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 flex items-center gap-2 text-xs text-navy/50">
          <Wallet className="h-4 w-4" />
          Members do not withdraw directly — payouts require the executive's
          authority.
        </p>
      </section>
    </div>
  );
}