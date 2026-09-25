import { useMemo, useRef, useState } from "react";
import { ArrowUpRight, CheckCircle2, Clock3, HandCoins, Upload, Wallet } from "lucide-react";

import {
  KES,
  addOfficialTransaction,
  approveOfficialTransaction,
  getPendingOfficialTransactions,
  getWithdrawals,
} from "../../lib/store";

const REQUIRED_APPROVERS = [
  { key: "chairperson", label: "Chairperson" },
  { key: "vicechairperson", label: "Vice Chairperson" },
  { key: "treasurer", label: "Treasurer" },
];

export default function WithdrawalsTab({ session, onChanged }) {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    reason: "",
    date: "",
    bankRef: "",
    coSigners: "",
    evidence: null,
  });
  const [notice, setNotice] = useState("");
  const [uploadName, setUploadName] = useState("");
  const fileRef = useRef(null);

  const withdrawals = useMemo(() => getWithdrawals(), [onChanged]);
  const pending = useMemo(() => getPendingOfficialTransactions(), [onChanged]);

  async function submit() {
    try {
      const file = form.evidence;
      if (!file) throw new Error("Transaction receipt or confirmation is required.");
      if (!form.coSigners.trim()) throw new Error("List at least one co-signer.");
      let evidenceDataUrl = "";

      if (file) {
        evidenceDataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ""));
          reader.onerror = () => reject(new Error("Unable to read receipt file."));
          reader.readAsDataURL(file);
        });
      }

      addOfficialTransaction({
        title: form.title,
        amount: form.amount,
        date: form.date || undefined,
        reason: form.reason,
        bankRef: form.bankRef,
        coSigners: form.coSigners.split(",").map((name) => name.trim()).filter(Boolean),
        evidenceName: file ? file.name : "",
        evidenceDataUrl,
        recordedBy: "Treasurer",
        requiredApprovers: REQUIRED_APPROVERS.map((role) => role.key),
      });

      setNotice("");
      setForm({ title: "", amount: "", reason: "", date: "", bankRef: "", coSigners: "", evidence: null });
      setUploadName("");
      if (fileRef.current) {
        fileRef.current.value = "";
      }
      onChanged();
    } catch (error) {
      setNotice(error.message || "Unable to save this transaction.");
    }
  }

  function handleEvidencePick(event) {
    const nextFile = event.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, evidence: nextFile }));
    setUploadName(nextFile ? nextFile.name : "");
  }

  function handleApproval(transactionId, roleKey, roleLabel) {
    try {
      const actorRole = session?.role || roleKey;
      const approverName = session?.name || roleLabel;
      approveOfficialTransaction(transactionId, roleKey, approverName, actorRole);
      setNotice("");
      onChanged();
    } catch (error) {
      setNotice(error.message || "Approval failed.");
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
              Record a group withdrawal / transaction
            </h2>
            <p className="text-sm text-navy/60">
              Withdrawals are only recorded for official group transactions. A transaction stays pending until all required approving officials sign off and the receipt is logged.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <input
            type="text"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            placeholder="Transaction title"
            className="rounded-xl border border-navy/10 py-3 px-4 text-sm text-navy outline-none placeholder:text-navy/40 focus:border-navy focus:ring-2 focus:ring-navy/10"
          />
          <input
            type="number"
            value={form.amount}
            onChange={(event) => setForm({ ...form, amount: event.target.value })}
            placeholder="Amount (KES)"
            className="rounded-xl border border-navy/10 py-3 px-4 text-sm text-navy outline-none placeholder:text-navy/40 focus:border-navy focus:ring-2 focus:ring-navy/10"
          />
          <input
            type="date"
            value={form.date}
            onChange={(event) => setForm({ ...form, date: event.target.value })}
            className="rounded-xl border border-navy/10 py-3 px-4 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
          />
          <input
            type="text"
            value={form.reason}
            onChange={(event) => setForm({ ...form, reason: event.target.value })}
            placeholder="Purpose / reason"
            className="rounded-xl border border-navy/10 py-3 px-4 text-sm text-navy outline-none placeholder:text-navy/40 focus:border-navy focus:ring-2 focus:ring-navy/10 sm:col-span-2"
          />
          <input
            type="text"
            value={form.bankRef}
            onChange={(event) => setForm({ ...form, bankRef: event.target.value })}
            placeholder="Bank ref / transfer ref"
            className="rounded-xl border border-navy/10 py-3 px-4 text-sm text-navy outline-none placeholder:text-navy/40 focus:border-navy focus:ring-2 focus:ring-navy/10"
          />
          <input
            type="text"
            value={form.coSigners}
            onChange={(event) => setForm({ ...form, coSigners: event.target.value })}
            placeholder="Co-signers (names separated by commas)"
            className="rounded-xl border border-navy/10 py-3 px-4 text-sm text-navy outline-none placeholder:text-navy/40 focus:border-navy focus:ring-2 focus:ring-navy/10 sm:col-span-2 lg:col-span-3"
          />
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-sand p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-navy ring-1 ring-navy/10 hover:bg-navy/5">
            <Upload className="h-4 w-4" />
            Upload receipt
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleEvidencePick}
            />
          </label>
          <span className="text-xs text-navy/60">{uploadName || "Required evidence"}</span>
        </div>

        {notice && (
          <p className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
            {notice}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={submit}
            disabled={!form.title || !form.amount || !form.coSigners || !form.evidence}
            className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowUpRight className="h-4 w-4" />
            Log transaction
          </button>
          <span className="rounded-full bg-gold/15 px-3 py-1.5 text-xs font-semibold text-gold-dark">
            3 approval checks required: Chairperson, Vice Chairperson, Treasurer
          </span>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sand text-navy/70">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-navy">
              Transaction ledger ({withdrawals.length})
            </h2>
            <p className="text-sm text-navy/60">
              Each transaction is visible to the executive and remains pending until all necessary approvals are recorded.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
            Pending approvals: {pending.length}
          </span>
        </div>

        <div className="mt-4 space-y-4">
          {withdrawals.map((transaction) => {
            const missing = REQUIRED_APPROVERS.filter(
              (role) => !(transaction.approvals || {})[role.key],
            );
            const isPending = transaction.status !== "approved";

            return (
              <div key={transaction.id} className="rounded-2xl border border-navy/10 bg-sand p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-serif text-xl font-bold text-navy">{transaction.title}</p>
                    <p className="text-xs text-navy/50">
                      {transaction.date} · {transaction.bankRef || "No bank ref"}
                    </p>
                    <p className="mt-1 text-xs text-navy/60">
                      {transaction.reason || "No reason recorded"} · Co-signed by: {(transaction.coSigners || []).join(", ") || "Not listed"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-2xl font-bold text-navy">{KES(transaction.amount)}</p>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        isPending ? "bg-amber-100 text-amber-700" : "bg-green/10 text-green"
                      }`}
                    >
                      {isPending ? <Clock3 className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      {isPending ? "Pending approval" : "Approved"}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {REQUIRED_APPROVERS.map((role) => {
                    const approvedRole = (transaction.approvals || {})[role.key];
                    return (
                      <span
                        key={role.key}
                        className={`rounded-full px-2.5 py-1 font-semibold ${
                          approvedRole ? "bg-green/10 text-green" : "bg-white text-navy/60"
                        }`}
                      >
                        {role.label}: {approvedRole ? "Approved" : "Waiting"}
                      </span>
                    );
                  })}
                </div>

                <div className="mt-3 text-sm text-navy/70">
                  <p>
                    <span className="font-semibold">Purpose:</span> {transaction.reason || "—"}
                  </p>
                  {transaction.evidenceName && (
                    <p>
                      <span className="font-semibold">Evidence:</span> {transaction.evidenceName}
                    </p>
                  )}
                </div>

                {missing.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {missing.map((role) => {
                      const isCurrentApprover = session?.role === role.key;
                      return (
                        <button
                          key={role.key}
                          type="button"
                          disabled={!isCurrentApprover}
                          onClick={() => handleApproval(transaction.id, role.key, role.label)}
                          className="rounded-full bg-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {isCurrentApprover ? `Approve as ${role.label}` : `${role.label} approval pending`}
                        </button>
                      );
                    })}
                  </div>
                )}

                {transaction.recordedBy && (
                  <p className="mt-3 text-xs text-navy/50">Recorded by: {transaction.recordedBy}</p>
                )}
              </div>
            );
          })}

          {withdrawals.length === 0 && (
            <div className="rounded-2xl border border-dashed border-navy/20 bg-white px-5 py-10 text-center text-sm text-navy/50">
              No official transactions logged yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
