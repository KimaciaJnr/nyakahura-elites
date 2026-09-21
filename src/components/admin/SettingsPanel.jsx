import { useEffect, useState } from "react";
import {
  Settings,
  Plus,
  Minus,
  Save,
  Check,
  RotateCcw,
  Download,
  CalendarDays,
  Clock,
} from "lucide-react";
import {
  getConfig,
  updateConfig,
  getContributionForMonth,
  backupAll,
  resetDemo,
  KES,
} from "../../lib/store";

const MONTHS = [
  "01", "02", "03", "04", "05", "06",
  "07", "08", "09", "10", "11", "12",
];
const YEARS = ["2026", "2027", "2028", "2029"];

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-navy/50">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="mt-1 block text-xs text-navy/40">{hint}</span>}
    </label>
  );
}

function Input({ value, onChange, type = "number", className = "" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-xl border border-navy/10 bg-white px-3.5 py-2.5 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 ${className}`}
    />
  );
}

export default function SettingsPanel({ onChanged, allowReset = true }) {
  const [cfg, setCfg] = useState(() => getConfig());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSaved(false), 2500);
    return () => clearTimeout(t);
  }, [saved]);

  const set = (key, value) => setCfg((c) => ({ ...c, [key]: value }));

  const setScheduleRow = (index, patch) =>
    setCfg((c) => ({
      ...c,
      schedule: c.schedule.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    }));

  const addScheduleRow = () =>
    setCfg((c) => ({
      ...c,
      schedule: [...c.schedule, { from: "2028-01", amount: c.schedule[c.schedule.length - 1]?.amount || 500 }],
    }));

  const removeScheduleRow = (index) =>
    setCfg((c) => ({
      ...c,
      schedule: c.schedule.filter((_, i) => i !== index && !(i === 0 && index === 0)),
    }));

  const save = () => {
    const schedule = cfg.schedule.map((s) => ({
      from: s.from ? s.from : null,
      amount: Number(s.amount) || 0,
    }));
    updateConfig({ ...cfg, schedule });
    onChanged?.();
    setSaved(true);
  };

  const downloadBackup = () => {
    const blob = new Blob([backupAll()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nyakahura-elites-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="rounded-3xl bg-white p-6 shadow-xl sm:p-8 lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-navy">
            <Settings className="h-5 w-5 text-gold-dark" />
            Group settings
          </h2>
          {saved && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green/10 px-3.5 py-1.5 text-xs font-semibold text-green-dark">
              <Check className="h-3.5 w-3.5" />
              Saved
            </span>
          )}
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Current monthly contribution (KES)">
            <Input value={cfg.monthlyContribution} onChange={(v) => set("monthlyContribution", v)} />
          </Field>
          <Field
            label="Contribution growth schedule (KES)"
            hint="Contribution escalates automatically from the set month — e.g. Ksh 1,000 from Jan 2027."
          >
            <div className="space-y-2">
              {cfg.schedule.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select
                    value={row.from || ""}
                    onChange={(e) =>
                      setScheduleRow(i, { from: e.target.value || null })
                    }
                    className="rounded-xl border border-navy/10 bg-white px-2 py-2.5 text-sm text-navy outline-none focus:border-navy"
                  >
                    {i === 0 ? (
                      <option value="">
                        {cfg.schedule[0]?.from ? "From" : "Current (now)"}
                      </option>
                    ) : null}
                    <option value="">Always (base rate)</option>
                    {YEARS.map((year) =>
                      MONTHS.map((m) => (
                        <option key={`${year}-${m}`} value={`${year}-${m}`}>
                          {`${year}-${m}`}
                        </option>
                      )),
                    )}
                  </select>
                  <Input value={row.amount} onChange={(v) => setScheduleRow(i, { amount: v })} />
                  <button
                    type="button"
                    onClick={() => removeScheduleRow(i)}
                    disabled={cfg.schedule.length <= 1}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-navy/10 text-navy/50 transition-colors hover:border-red-300 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                    title="Remove row"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addScheduleRow}
                className="inline-flex items-center gap-1.5 rounded-xl bg-navy/5 px-3 py-2 text-xs font-semibold text-navy transition-colors hover:bg-navy/10"
              >
                <Plus className="h-3.5 w-3.5" />
                Add rate change
              </button>
            </div>
          </Field>

          <Field label="Late payment fine (KES)">
            <Input value={cfg.fineLate} onChange={(v) => set("fineLate", v)} />
          </Field>
          <Field label="Missed meeting fine (KES)">
            <Input value={cfg.fineMeeting} onChange={(v) => set("fineMeeting", v)} />
          </Field>
          <Field label="3 consecutive misses fine (KES)">
            <Input value={cfg.fineThreeMisses} onChange={(v) => set("fineThreeMisses", v)} />
          </Field>

          <Field label="Contribution deadline (day of the following month)">
            <Input value={cfg.deadlineDay} onChange={(v) => set("deadlineDay", v)} />
          </Field>
          <Field label="Meeting time (e.g. 20:30)">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-navy/40" />
              <Input value={cfg.meetingTime} onChange={(v) => set("meetingTime", v)} />
            </div>
          </Field>
          <Field label="Meeting venue">
            <Input value={cfg.venue} onChange={(v) => set("venue", v)} />
          </Field>
        </div>

        <div className="mt-6 rounded-2xl bg-navy/5 p-4 text-sm">
          <p className="flex items-center gap-2 font-semibold text-navy">
            <CalendarDays className="h-4 w-4 text-gold-dark" />
            Contribution preview
          </p>
          <ul className="mt-2 space-y-1 text-navy/70">
            <li>Now: {KES(getContributionForMonth("2026-09"))} per member per month</li>
            <li>Jan 2027: {KES(getContributionForMonth("2027-01"))} per member per month</li>
            <li>Jan 2028: {KES(getContributionForMonth("2028-01"))} per member per month</li>
            <li>Savings keep growing each month so totals climb over time</li>
          <li>Contributions paid by day {cfg.deadlineDay} of the following month carry no fine; after that midnight a {KES(cfg.fineLate)} late fine applies</li>
          </ul>
        </div>

        <button
          type="button"
          onClick={save}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-green px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-dark"
        >
          <Save className="h-4 w-4" />
          Save settings
        </button>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
        <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-navy">
          <Download className="h-5 w-5 text-gold-dark" />
          Backup
        </h2>
        <p className="mt-2 text-sm text-navy/60">
          Download all member data, savings record, meetings, fines, loans and
          announcements as a JSON file. The demo is stored in your browser
          (localStorage), so keep a backup of anything you cannot afford to lose.
        </p>
        <button
          type="button"
          onClick={downloadBackup}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy/90"
        >
          <Download className="h-4 w-4" />
          Download backup (JSON)
        </button>

        {allowReset ? (
          <div className="mt-8 border-t border-navy/10 pt-6">
            <h3 className="flex items-center gap-2 font-semibold text-navy">
              <RotateCcw className="h-4 w-4 text-gold-dark" />
              Danger zone
            </h3>
            <p className="mt-1.5 text-xs text-navy/50">
              Restore the original demo data. This clears everything added since.
            </p>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Reset all demo data back to the original seed?")) {
                  resetDemo();
                  onChanged?.();
                }
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
            >
              <RotateCcw className="h-4 w-4" />
              Reset demo data
            </button>
          </div>
        ) : (
          <p className="mt-8 border-t border-navy/10 pt-6 text-xs text-navy/50">
            Settings apply group-wide — only the administrator can reset the
            demo data.
          </p>
        )}
      </section>
    </div>
  );
}