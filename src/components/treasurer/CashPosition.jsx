import { useRef, useState } from "react";
import {
  Landmark,
  TrendingUp,
  PiggyBank,
  ArrowDownLeft,
  ArrowUpRight,
  Percent,
} from "lucide-react";
import {
  getBankAccounts,
  getMMF,
  getCashPosition,
  addBankTxn,
  addMMFTxn,
  accrueMMF,
  KES,
} from "../../lib/store";

const ACCENT = {
  bank: "bg-blue-100 text-blue-700",
  mmf: "bg-green/10 text-green",
  liquid: "bg-gold/15 text-gold-dark",
  invested: "bg-navy/5 text-navy",
};

const inputCls =
  "w-full rounded-xl border border-navy/10 bg-white px-3.5 py-2.5 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10";

function MiniStat({ label, value, accent }) {
  return (
    <div className="rounded-2xl bg-sand p-4 ring-1 ring-navy/5">
      <p className="text-[11px] font-bold uppercase tracking-wider text-navy/50">
        {label}
      </p>
      <p className={`mt-1.5 font-serif text-xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}

function TxnList({ txns, title }) {
  return (
    <div className="mt-4 border-t border-navy/10 pt-4">
      <p className="text-xs font-bold uppercase tracking-wider text-navy/50">
        {title} · recent movements
      </p>
      <ul className="mt-2 space-y-2">
        {(txns || []).slice(0, 8).map((t, i) => (
          <li key={i} className="flex items-center justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-navy/70">
              {t.date} · {t.reason || t.note}
            </span>
            <span
              className={`shrink-0 font-semibold ${
                t.amount < 0 ? "text-red-500" : "text-green"
              }`}
            >
              {t.amount < 0 ? "-" : "+"}
              {KES(Math.abs(t.amount))}
            </span>
          </li>
        ))}
        {(txns || []).length === 0 && (
          <li className="text-sm text-navy/40">No movements yet.</li>
        )}
      </ul>
      {(txns || []).slice(0, 8).map((t, i) => (
        <div key={`details-${i}`} className="mt-1 text-[11px] text-navy/45">
          {t.coSigners?.length ? `Co-signed by: ${t.coSigners.join(", ")}` : "No co-signers listed"}
          {t.receiptName ? ` · Receipt: ${t.receiptName}` : " · No receipt attached"}
        </div>
      ))}
    </div>
  );
}

export default function CashPosition({ onChanged }) {
  const cash = getCashPosition();
  const banks = getBankAccounts();
  const mmf = getMMF();

  const [target, setTarget] = useState(banks[0]?.id || "mmf");
  const [action, setAction] = useState("deposit");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().slice(0, 10));
  const [coSigners, setCoSigners] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [rate, setRate] = useState("2.0");
  const [msg, setMsg] = useState("");
  const receiptRef = useRef(null);

  const isMmf = target === "mmf";
  const current = isMmf ? mmf : banks.find((b) => b.id === target);

  async function run(actionFn, value, label) {
    try {
      const signedValue = Number(value) || 0;
      if (!signedValue) throw new Error("Amount required");
      if (!note.trim()) throw new Error("Reason required");
      if (!transactionDate) throw new Error("Transaction date required");
      if (!coSigners.trim()) throw new Error("List at least one co-signer");
      if (!receipt) throw new Error("Transaction receipt or confirmation required");

      const receiptDataUrl = await readReceipt(receipt);
      const metadata = {
        date: transactionDate,
        reason: note.trim(),
        coSigners: coSigners.split(",").map((name) => name.trim()).filter(Boolean),
        receiptName: receipt.name,
        receiptDataUrl,
      };

      if (signedValue < 0) {
        const balance = isMmf ? mmf.balance : current?.balance || 0;
        if (Math.abs(signedValue) > balance) {
          throw new Error(`Insufficient funds in ${current?.name || "the selected account"}.`);
        }
      }

      actionFn(value, label, metadata);
      setMsg(`${action === "deposit" ? "Deposited" : "Withdrawn"} ${KES(Math.abs(signedValue))} from ${current?.name}.`);
      setAmount("");
      setNote("");
      setTransactionDate(new Date().toISOString().slice(0, 10));
      setCoSigners("");
      setReceipt(null);
      if (receiptRef.current) receiptRef.current.value = "";
      onChanged();
    } catch (e) {
      setMsg(e.message);
    }
  }

  function readReceipt(file) {
    return new Promise((resolve, reject) => {
      if (file.size > 2_500_000) {
        reject(new Error("Receipt is too large (max 2.5 MB)."));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Unable to read receipt file."));
      reader.readAsDataURL(file);
    });
  }

  function handleReceiptPick(event) {
    setReceipt(event.target.files?.[0] || null);
  }

  async function recordBankMovement() {
    const value = action === "deposit" ? Number(amount) : -Number(amount);
    try {
      if (!Number.isFinite(value) || value === 0) throw new Error("Amount required");
      if (value < 0 && (current?.balance || 0) + value < 0) {
        throw new Error(`Insufficient funds in ${current?.name || "the selected account"}.`);
      }
      await run(addBankTxn, value, note || "Cash adjustment");
    } catch (e) {
      setMsg(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat label="Bank balance" value={KES(cash.bank)} accent="text-blue-700" />
        <MiniStat label="Money market fund" value={KES(cash.mmf)} accent="text-green" />
        <MiniStat label="Liquid (bank + MMF)" value={KES(cash.liquid)} accent="text-gold-dark" />
        <MiniStat label="Invested elsewhere" value={KES(cash.invested)} accent="text-navy" />
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-xl sm:p-7">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold-dark">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-navy">
                Bank accounts
              </h3>
              <p className="text-sm text-navy/60">
                {banks.length} account{banks.length === 1 ? "" : "s"} · pool {KES(cash.pool)} across all members
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {banks.map((b) => (
              <div key={b.id} className="rounded-2xl bg-sand p-5 ring-1 ring-navy/5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-navy">{b.name}</p>
                    <p className="text-xs text-navy/50">
                      {b.accountName} · {b.accountNumber}
                    </p>
                  </div>
                  <p className="font-serif text-xl font-bold text-blue-700">
                    {KES(b.balance)}
                  </p>
                </div>
                <TxnList txns={b.txns} title={b.name} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-xl sm:p-7">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green/10 text-green">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-navy">Cash movements</h3>
              <p className="text-sm text-navy/60">
                Record completed movements with their reason, co-signers and supporting receipt.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-navy/50">Account</span>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className={`${inputCls} mt-1.5`}
                >
                  {banks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                  <option value="mmf">KCB Money Market Fund</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-navy/50">Type</span>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className={`${inputCls} mt-1.5`}
                >
                  <option value="deposit">Deposit</option>
                  <option value="withdraw">Withdraw</option>
                </select>
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-navy/50">Amount (KES)</span>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className={`${inputCls} mt-1.5`}
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-navy/50">Note</span>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. July contributions"
                  className={`${inputCls} mt-1.5`}
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-navy/50">Transaction date</span>
                <input
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className={`${inputCls} mt-1.5`}
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-navy/50">Co-signers</span>
                <input
                  value={coSigners}
                  onChange={(e) => setCoSigners(e.target.value)}
                  placeholder="Names, separated by commas"
                  className={`${inputCls} mt-1.5`}
                />
              </label>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl bg-sand p-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-navy ring-1 ring-navy/10 hover:bg-navy/5">
                <ArrowDownLeft className="h-4 w-4" />
                Upload receipt / confirmation
                <input
                  ref={receiptRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleReceiptPick}
                />
              </label>
              <span className="text-xs text-navy/60">{receipt?.name || "Required evidence"}</span>
            </div>

            <button
              onClick={() => {
                if (isMmf) {
                  run(addMMFTxn, action === "deposit" ? Number(amount) : -Number(amount), note || (action === "deposit" ? "Deposit to MMF" : "Withdrawal from MMF"));
                } else {
                  recordBankMovement();
                }
              }}
              disabled={!Number(amount)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-green px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              {action === "deposit" ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
              {action === "deposit" ? "Record deposit" : "Record withdrawal"}
            </button>
            {msg && <p className="text-xs font-medium text-navy/60">{msg}</p>}
          </div>

          {mmf && (
            <>
              <div className="mt-6 border-t border-navy/10 pt-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-navy">
                    <span className="inline-flex items-center gap-1.5">
                      <PiggyBank className="h-4 w-4 text-green" />
                      {mmf.name}
                    </span>
                  </p>
                  <p className="font-serif text-lg font-bold text-green">
                    {KES(mmf.balance)}
                    <span className="ml-2 text-xs font-medium text-navy/50">
                      {mmf.shares} units · {KES(mmf.unitPrice)}/u
                    </span>
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex w-32 items-center rounded-xl border border-navy/10 px-3">
                    <Percent className="h-4 w-4 text-navy/40" />
                    <input
                      type="number"
                      step="0.1"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      className="w-full bg-transparent px-1 py-2.5 text-sm text-navy outline-none"
                      aria-label="Interest rate %"
                    />
                  </div>
                  <button
                    onClick={() => {
                      accrueMMF(rate);
                      setMsg(`Accrued interest at ${rate}% on the MMF.`);
                      onChanged();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-light"
                  >
                    Accrue interest
                  </button>
                </div>
                <TxnList txns={mmf.txns} title={mmf.name} />
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}