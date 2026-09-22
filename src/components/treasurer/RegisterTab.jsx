import { useMemo, useRef, useState } from "react";
import {
  CheckSquare,
  Upload,
  FileDown,
  AlertCircle,
  Search,
  Info,
  Trash2,
  X,
} from "lucide-react";
import {
  getMonthRegister,
  getContributionForMonth,
  getConfig,
  KES,
  getContributionStatements,
  contributionDeadline,
  addMonths,
  parseContributionStatementText,
  saveContributionStatement,
  deleteContributionStatement,
} from "../../lib/store";

function fmt(date) {
  if (!date) return "—";
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y}`;
}

function fmtLong(date) {
  if (!date) return "";
  const [y, m, d] = date.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d} ${months[+m - 1]} ${y}`;
}

function secondTuesday(month) {
  const [y, m] = month.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  let d = new Date(y, m - 1, 1);
  while (d.getDay() !== 2) d.setDate(d.getDate() + 1);
  d.setDate(d.getDate() + 7);
  return d;
}

function chip(r, cfg) {
  if (r.awaiting) return { label: "Awaiting statement", cls: "bg-navy/5 text-navy/50" };
  if (r.paid && r.late)
    return { label: `Paid late · ${KES(cfg.fineLate)} fine`, cls: "bg-amber-50 text-amber-700" };
  if (r.paid) return { label: "Paid on time", cls: "bg-green/10 text-green" };
  if (r.fee) return { label: "Unpaid — fee due", cls: "bg-red-100 text-red-600" };
  return { label: "No record", cls: "bg-navy/5 text-navy/50" };
}

const inputCls =
  "mt-1.5 rounded-xl border border-navy/10 bg-white px-4 py-2.5 text-sm font-semibold text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10";

export default function RegisterTab({ onChanged }) {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const cfg = getConfig();
  const expected = getContributionForMonth(month);
  const deadline = contributionDeadline(month);
  const statements = useMemo(() => getContributionStatements(), [onChanged]);
  const stmt = statements.find((s) => s.month === month);
  const rows = useMemo(() => getMonthRegister(month), [month, onChanged]);

  const awaiting = rows.length > 0 && rows.every((r) => r.awaiting);
  const received = rows.filter((r) => r.paid).length;
  const lateCount = rows.filter((r) => r.late).length;
  const missingCount = rows.filter((r) => !r.paid && !r.awaiting).length;
  const outstanding = rows.length - received;

  const q = query.trim().toLowerCase();
  const filtered = q
    ? rows.filter(
        (r) =>
          String(r.member && r.member.name || "").toLowerCase().includes(q) ||
          String(r.member && r.member.memberNo || "").toLowerCase().includes(q),
      )
    : rows;

  const nextMonth = addMonths(month, 1);
  const mtg = secondTuesday(nextMonth);

  function onFile(e) {
    const file = e.target.files && e.target.files[0];
    setError("");
    if (!file) return;
    setPreview(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseContributionStatementText(String(reader.result), month);
        setPreview({ fileName: file.name, ...parsed });
      } catch (err) {
        setError(err.message || "Could not read that statement");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function downloadSample() {
    const lines = [
      "NYAKAHURA ELITES — MONTHLY CONTRIBUTIONS STATEMENT",
      `Contribution month: ${month} | Deadline: ${deadline} (after midnight of the ${cfg.deadlineDay}th, a fine of ${KES(cfg.fineLate)} applies)`,
      "DATE,NAME,AMOUNT",
    ];
    rows.forEach((r, i) => {
      if (i % 7 === 2) return;
      const date = i % 5 === 0 ? `${deadline.slice(0, 8)}0${Math.min(9, (cfg.deadlineDay || 5) + 4)}` : deadline;
      lines.push(`${date},${r.member.name},${expected}`);
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `NEIG monthly contributions ${month}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function publish() {
    if (!preview) return;
    try {
      saveContributionStatement({
        month,
        fileName: preview.fileName,
        rows: preview.rows,
        unmatched: preview.unmatched,
      });
      setPreview(null);
      onChanged();
    } catch (err) {
      setError(err.message || "Could not save the statement");
    }
  }

  return (
    <div className="mt-8 space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-navy">
              <CheckSquare className="h-5 w-5 text-green" />
              Monthly contribution tracking
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-navy/60">
              Contributions for each month are tracked from the statement the
              treasurer uploads — after day {cfg.deadlineDay} of the following
              month, before the monthly catch-up. A deposit made on or before{" "}
              <span className="font-semibold text-navy">{fmt(deadline)}</span> is
              on time; after midnight of the {cfg.deadlineDay}th, a fine of{" "}
              <span className="font-semibold text-navy">{KES(cfg.fineLate)}</span>{" "}
              applies. Rate:{" "}
              <span className="font-semibold text-navy">
                {KES(expected)} for {month}
              </span>
              .
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-navy/50">
                Month
              </span>
              <input
                type="month"
                value={month}
                onChange={(e) => {
                  setMonth(e.target.value || month);
                  setPreview(null);
                }}
                className={inputCls}
              />
            </label>
            {stmt ? (
              <button
                type="button"
                onClick={() => fileRef.current && fileRef.current.click()}
                className="inline-flex items-center gap-2 rounded-full bg-green px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green/90"
              >
                <Upload className="h-4 w-4" />
                Replace statement
              </button>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current && fileRef.current.click()}
                className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy/90"
              >
                <Upload className="h-4 w-4" />
                Upload statement
              </button>
            )}
            <button
              type="button"
              onClick={downloadSample}
              className="inline-flex items-center gap-2 rounded-full border border-navy/15 px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-sand"
            >
              <FileDown className="h-4 w-4" />
              Sample
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.csv,.tsv,text/plain,text/csv"
              className="hidden"
              onChange={onFile}
            />
          </div>
        </div>

        {stmt && (
          <div className="mt-6 flex flex-wrap items-start justify-between gap-3 rounded-2xl bg-green/10 p-4">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-green" />
              <div className="text-sm text-navy/80">
                <p className="font-semibold text-navy">
                  Tracking from “{stmt.fileName}”
                </p>
                <p className="mt-0.5 text-xs text-navy/60">
                  Uploaded {fmtLong(stmt.uploadedAt)} by {stmt.uploadedBy}.
                  Statement-driven data overrides any previous entry for {month}.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Remove the uploaded statement for ${month}?`)) {
                  deleteContributionStatement(month);
                  onChanged();
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        )}

        {awaiting && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-amber-700 ring-1 ring-amber-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="text-sm">
              <p className="font-semibold">
                Awaiting the {month} contribution statement
              </p>
              <p className="mt-0.5 text-amber-700/80">
                {month} contributions are tracked once the treasurer uploads the
                statement — deposit by <strong>{fmt(deadline)}</strong> (day{" "}
                {cfg.deadlineDay} of {fmtLong(nextMonth)}). The upload window is
                after the {cfg.deadlineDay}th and before the monthly catch-up on{" "}
                <strong>{fmtLong(mtg.toISOString().slice(0, 10))}</strong>.
              </p>
            </div>
          </div>
        )}

        {!stmt && !awaiting && (
          <p className="mt-6 flex items-start gap-2 rounded-xl bg-sand px-4 py-3 text-xs text-navy/60">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Showing the seeded tracking for {month}. Upload the month's statement
            to switch this register to statement-based tracking.
          </p>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <div className="rounded-2xl bg-sand p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-navy/50">
              Expected · due {fmt(deadline)}
            </p>
            <p className="mt-1.5 font-serif text-2xl font-bold text-navy">
              {KES(rows.length * expected)}
            </p>
          </div>
          <div className="rounded-2xl bg-green/10 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-green">
              Deposited
            </p>
            <p className="mt-1.5 font-serif text-2xl font-bold text-green">
              {received} / {rows.length}
            </p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
              Paid late
            </p>
            <p className={`mt-1.5 font-serif text-2xl font-bold ${lateCount ? "text-amber-600" : "text-navy"}`}>
              {lateCount}
            </p>
          </div>
          <div className={`rounded-2xl p-4 ${missingCount ? "bg-red-50" : "bg-sand"}`}>
            <p className={`text-[11px] font-bold uppercase tracking-wider ${missingCount ? "text-red-500" : "text-navy/50"}`}>
              No deposit
            </p>
            <p className={`mt-1.5 font-serif text-2xl font-bold ${missingCount ? "text-red-500" : "text-navy"}`}>
              {missingCount}
            </p>
          </div>
        </div>

        {missingCount > 0 && (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 ring-1 ring-red-100">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {missingCount} member{missingCount === 1 ? "" : "s"} have no deposit on
            record for {month} — the contribution stands as arrears (fee due).
          </p>
        )}

        <div className="relative mt-6">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or member number…"
            className="w-full rounded-xl border border-navy/10 py-3 pl-11 pr-4 text-sm text-navy outline-none placeholder:text-navy/40 focus:border-navy focus:ring-2 focus:ring-navy/10"
          />
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b-2 border-navy/10 text-[11px] uppercase tracking-wide text-navy/50">
                <th className="py-3 pr-3 font-semibold">No.</th>
                <th className="py-3 pr-3 font-semibold">Name</th>
                <th className="py-3 pr-3 font-semibold">Deposited on</th>
                <th className="py-3 pr-3 text-right font-semibold">Expected</th>
                <th className="py-3 pr-3 text-right font-semibold">Received</th>
                <th className="py-3 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const s = chip(r, cfg);
                return (
                  <tr
                    key={r.member.id}
                    className="border-b border-navy/5 transition-colors hover:bg-sand/50"
                  >
                    <td className="py-3 pr-3 font-medium text-navy/60">
                      {r.member.memberNo}
                    </td>
                    <td className="py-3 pr-3 font-semibold text-navy">
                      {r.member.name}
                    </td>
                    <td className="py-3 pr-3 text-navy/70">
                      {r.depositedOn ? fmt(r.depositedOn) : "—"}
                    </td>
                    <td className="py-3 pr-3 text-right text-navy/70">
                      {KES(r.expected)}
                    </td>
                    <td className="py-3 pr-3 text-right font-semibold text-navy">
                      {r.paid ? KES(r.amountReceived) : "—"}
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.cls}`}
                      >
                        {s.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-navy/50">
                    No members match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-5 flex items-center gap-2 text-xs text-navy/50">
          <Info className="h-4 w-4" />
          On-time deposits never attract a fine. Late = after midnight of day{" "}
          {cfg.deadlineDay} of the following month → {KES(cfg.fineLate)} fine.
          Missing = arrears until the contribution is made.
        </p>
      </section>

      {preview && (
        <section className="rounded-3xl bg-white p-6 shadow-xl ring-2 ring-green/30 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-serif text-xl font-bold text-navy">
                Preview — {preview.fileName}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-navy/60">
                {preview.rows.length} deposit{preview.rows.length === 1 ? "" : "s"}{" "}
                recognised{preview.unmatched.length ? ` · ${preview.unmatched.length} unmatched` : ""}.
                {stmt ? " This replaces the previous statement for this month." : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="inline-flex items-center gap-1.5 rounded-full border border-navy/15 px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-sand"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="button"
                onClick={publish}
                className="inline-flex items-center gap-1.5 rounded-full bg-green px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-green/90"
              >
                <Upload className="h-4 w-4" />
                Publish statement
              </button>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b-2 border-navy/10 text-[11px] uppercase tracking-wide text-navy/50">
                  <th className="py-2 pr-3 font-semibold">Name</th>
                  <th className="py-2 pr-3 font-semibold">Deposited on</th>
                  <th className="py-2 pr-3 text-right font-semibold">Amount</th>
                  <th className="py-2 text-right font-semibold">Result</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((r) => (
                  <tr key={r.memberId} className="border-b border-navy/5">
                    <td className="py-2.5 pr-3 font-semibold text-navy">
                      {r.name}{" "}
                      <span className="font-medium text-navy/40">{r.memberNo}</span>
                    </td>
                    <td className="py-2.5 pr-3 text-navy/70">{fmt(r.depositedOn)}</td>
                    <td className="py-2.5 pr-3 text-right font-semibold text-navy">
                      {KES(r.amount)}
                    </td>
                    <td className="py-2.5 text-right">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          r.onTime ? "bg-green/10 text-green" : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {r.onTime ? "On time" : `Late · ${KES(cfg.fineLate)} fine`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {preview.unmatched.length > 0 && (
            <div className="mt-5 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
              <p className="text-sm font-semibold text-amber-700">
                Couldn't match {preview.unmatched.length} line
                {preview.unmatched.length === 1 ? "" : "s"} — review before publishing
              </p>
              <ul className="mt-2 space-y-1 text-xs text-amber-700/80">
                {preview.unmatched.map((u, i) => (
                  <li key={i}>
                    “{u.line}” — {u.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 ring-1 ring-red-100">
          {error}
        </p>
      )}
    </div>
  );
}