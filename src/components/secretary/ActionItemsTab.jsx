import { useEffect, useMemo, useState } from "react";
import { ListChecks, Plus, Check, Trash2, Target } from "lucide-react";
import {
  getActionItems,
  addActionItem,
  updateActionItem,
  deleteActionItem,
  getMinutes,
} from "../../lib/store";

const inputCls =
  "w-full rounded-xl border border-navy/10 bg-white px-3.5 py-2.5 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10";

export default function ActionItemsTab({ onChanged }) {
  const [refresh, setRefresh] = useState(0);
  const items = useMemo(() => getActionItems(), [refresh, onChanged]);
  const minutesOptions = useMemo(() => getMinutes(), []);

  const [show, setShow] = useState(false);
  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [minutesId, setMinutesId] = useState("");
  const [ref, setRef] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setMsg(""), 3000);
    return () => clearTimeout(t);
  }, [msg]);

  const open = items.filter((a) => a.status === "open");
  const done = items.filter((a) => a.status === "done");
  const overDue = open.filter((a) => a.dueDate && a.dueDate < new Date().toISOString().slice(0, 10));

  const minTitle = (id) => {
    const m = minutesOptions.find((x) => x.id === id);
    return m ? m.title : "General";
  };

  return (
    <section className="mt-8 rounded-3xl bg-white p-6 shadow-xl sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-navy">
            <ListChecks className="h-5 w-5 text-gold-dark" />
            Action items
          </h2>
          <p className="mt-1 text-sm text-navy/60">
            Resolutions turned into tracked tasks with owners and deadlines.
          </p>
        </div>
        <button
          onClick={() => setShow((s) => !s)}
          className="inline-flex items-center gap-1.5 rounded-full bg-gold-dark px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold"
        >
          <Plus className="h-4 w-4" />
          {show ? "Close" : "Add action item"}
        </button>
      </div>

      {overDue.length > 0 && (
        <div className="mt-5 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 ring-1 ring-red-200">
          <Target className="h-4 w-4 shrink-0" />
          {overDue.length} overdue action item{overDue.length === 1 ? "" : "s"}.
        </div>
      )}

      {show && (
        <div className="mt-6 space-y-4 rounded-2xl bg-sand p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wider text-navy/50">Action</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Open the KCB Money Market Fund"
                className={`${inputCls} mt-1.5`}
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-navy/50">Owner</span>
              <input
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="e.g. Jane Wangari (Treasurer)"
                className={`${inputCls} mt-1.5`}
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-navy/50">Due date</span>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={`${inputCls} mt-1.5`} />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wider text-navy/50">From minutes (optional)</span>
              <div className="mt-1.5 flex gap-2">
                <select
                  value={minutesId}
                  onChange={(e) => {
                    setMinutesId(e.target.value);
                    const m = minutesOptions.find((x) => x.id === e.target.value);
                    if (m?.resolutions?.length) {
                      setRef(m.resolutions[0].ref || "");
                    }
                  }}
                  className={inputCls}
                >
                  <option value="">— none —</option>
                  {minutesOptions.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
                <input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Ref (e.g. MIN.05)" className={inputCls} />
              </div>
            </label>
          </div>
          <button
            onClick={() => {
              if (!title.trim()) {
                setMsg("Describe the action item first.");
                return;
              }
              addActionItem({ title: title.trim(), owner, dueDate, minutesId: minutesId || null, ref });
              setTitle("");
              setOwner("");
              setDueDate("");
              setMinutesId("");
              setRef("");
              setShow(false);
              setMsg("Action item added.");
              setRefresh((n) => n + 1);
              onChanged?.();
            }}
            className="inline-flex items-center gap-2 rounded-full bg-green px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-dark"
          >
            <Plus className="h-4 w-4" />
            Add action item
          </button>
          {msg && <p className="text-xs font-medium text-navy/60">{msg}</p>}
        </div>
      )}

      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-wider text-navy/40">
          Open ({open.length})
        </p>
        <ul className="mt-2 space-y-2">
          {open.length === 0 && (
            <li className="rounded-2xl bg-sand px-5 py-6 text-center text-sm text-navy/50">
              No open action items.
            </li>
          )}
          {open.map((a) => (
            <ActionRow
              key={a.id}
              item={a}
              minutesLabel={minTitle(a.minutesId)}
              onToggle={() => {
                updateActionItem(a.id, { status: "done" });
                setRefresh((n) => n + 1);
              }}
              onDelete={() => {
                deleteActionItem(a.id);
                setRefresh((n) => n + 1);
              }}
            />
          ))}
        </ul>
      </div>

      {done.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-wider text-navy/40">
            Done ({done.length})
          </p>
          <ul className="mt-2 space-y-2">
            {done.map((a) => (
              <ActionRow
                key={a.id}
                item={a}
                minutesLabel={minTitle(a.minutesId)}
                done
                onToggle={() => {
                  updateActionItem(a.id, { status: "open" });
                  setRefresh((n) => n + 1);
                }}
                onDelete={() => {
                  deleteActionItem(a.id);
                  setRefresh((n) => n + 1);
                }}
              />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function ActionRow({ item, minutesLabel, done, onToggle, onDelete }) {
  const overdue =
    !done && item.dueDate && item.dueDate < new Date().toISOString().slice(0, 10);
  return (
    <li
      className={`rounded-2xl p-5 ring-1 ${
        done ? "bg-white opacity-70" : overdue ? "bg-red-50 ring-red-200" : "bg-sand ring-navy/5"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-navy/5 px-2.5 py-1 text-[11px] font-semibold text-navy">
              {item.ref || "Action"}
            </span>
            <span className="text-xs text-navy/50">{minutesLabel}</span>
          </div>
          <p className={`mt-2 text-sm font-semibold ${done ? "text-navy/50 line-through" : "text-navy"}`}>
            {item.title}
          </p>
          <p className="mt-1 text-xs text-navy/50">
            Owner: <span className="font-semibold text-navy/70">{item.owner || "—"}</span>
            {item.dueDate ? ` · due ${item.dueDate}` : ""}
            {overdue && <span className="ml-1 font-bold text-red-600">overdue</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
              done ? "bg-navy/5 text-navy hover:bg-navy/10" : "bg-green text-white hover:bg-green-dark"
            }`}
          >
            <Check className="h-3.5 w-3.5" />
            {done ? "Reopen" : "Mark done"}
          </button>
          <button
            onClick={onDelete}
            className="rounded-full p-2 text-navy/40 hover:bg-red-50 hover:text-red-500"
            aria-label="Delete action item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </li>
  );
}