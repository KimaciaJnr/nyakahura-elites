import { useMemo, useState } from "react";
import {
  Upload,
  FileText,
  Check,
  ChevronLeft,
  AlertTriangle,
  Plus,
  Trash2,
  Loader2,
  Link2,
} from "lucide-react";
import {
  getMembers,
  getMinutes,
  getMeetings,
  getMemberNameAliases,
  applyMinutesImport,
} from "../../lib/store";
import {
  extractMinutesDocument,
  parseMinutesText,
  proposeActionItems,
  suggestMemberMatch,
  matchExistingMeeting,
} from "../../lib/minutesImport";

const inputCls =
  "w-full rounded-xl border border-navy/10 bg-white px-3.5 py-2.5 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10";
const labelCls = "text-xs font-bold uppercase tracking-wider text-navy/50";
const MAX_BYTES = 8_000_000;

export default function MinutesImport({ onCancel, onImported }) {
  const members = useMemo(() => getMembers().filter((m) => m.role === "member"), []);
  const aliases = useMemo(() => getMemberNameAliases(), []);
  const [rawText, setRawText] = useState("");
  const [fileInfo, setFileInfo] = useState(null);
  const [draft, setDraft] = useState(null);
  const [mappings, setMappings] = useState({});
  const [actionItems, setActionItems] = useState([]);
  const [meetingChoice, setMeetingChoice] = useState("new");
  const [minutesChoice, setMinutesChoice] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  function set(key, value) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function setList(key, index, value) {
    setDraft((d) => {
      const next = [...d[key]];
      next[index] = value;
      return { ...d, [key]: next };
    });
  }

  function addListRow(key) {
    setDraft((d) => ({ ...d, [key]: [...d[key], ""] }));
  }

  function removeListRow(key, index) {
    setDraft((d) => ({ ...d, [key]: d[key].filter((_, i) => i !== index) }));
  }

  function updateResolution(index, patch) {
    setDraft((d) => ({
      ...d,
      resolutions: d.resolutions.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    }));
  }

  function addResolution() {
    setDraft((d) => {
      const index = d.resolutions.length;
      const year = (d.meetingDate || "").slice(0, 4) || String(new Date().getFullYear());
      const code = d.meetingType === "AGM" ? "AGM" : d.meetingType === "Special" ? "SP" : "M";
      return {
        ...d,
        resolutions: [
          ...d.resolutions,
          {
            ref: `MIN.${String(index + 1).padStart(2, "0")}/${code}/${year}`,
            title: "",
            body: "",
          },
        ],
      };
    });
  }

  function removeResolution(index) {
    setDraft((d) => ({
      ...d,
      resolutions: d.resolutions.filter((_, i) => i !== index),
    }));
  }

  function updateAction(index, patch) {
    setActionItems((items) =>
      items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  async function handleFile(file) {
    setError("");
    setResult(null);
    if (!file) return;
    const name = String(file.name || "").toLowerCase();
    if (!name.endsWith(".docx") && !name.endsWith(".pdf")) {
      setError("Upload a Word (.docx) or PDF minutes document.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That file is larger than 8 MB. Split it or compress it and try again.");
      return;
    }
    setBusy(true);
    try {
      const { text, kind } = await extractMinutesDocument(file);
      const parsed = parseMinutesText(text);
      const officer = (name) => suggestMemberMatch(name, members, aliases)?.name || name;
      const nextMappings = {};
      ["membersPresent", "absentWithApology", "absentWithoutApology"].forEach((key) => {
        parsed[key].forEach((person) => {
          const match = suggestMemberMatch(person, members, aliases);
          if (match) nextMappings[person] = match.id;
        });
      });
      ["chairperson", "viceChairperson", "treasurer", "secretary", "organizingSecretary", "nominatedMember", "writtenBy", "approvedBy"].forEach(
        (key) => {
          if (parsed[key]) parsed[key] = officer(parsed[key]);
        },
      );
      const meeting = matchExistingMeeting(parsed, getMeetings());
      const sameDayMinutes = getMinutes().find((m) => m.meetingDate === parsed.meetingDate);

      setRawText(text);
      setFileInfo({ name: file.name, kind, size: file.size });
      setDraft(parsed);
      setMappings(nextMappings);
      setActionItems(proposeActionItems(parsed));
      setMeetingChoice(meeting ? meeting.id : "new");
      setMinutesChoice(sameDayMinutes ? sameDayMinutes.id : "");
    } catch (err) {
      setError(err?.message || "That document could not be read.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setDraft(null);
    setFileInfo(null);
    setRawText("");
    setMappings({});
    setActionItems([]);
    setResult(null);
    setError("");
  }

  const resolvedName = (person) => {
    const memberId = mappings[person];
    const member = members.find((m) => m.id === memberId);
    return member ? member.name : person;
  };

  const attendanceTotals = draft
    ? {
        present: draft.membersPresent.map(resolvedName).filter(Boolean).length,
        apology: draft.absentWithApology.map(resolvedName).filter(Boolean).length,
        absent: draft.absentWithoutApology.map(resolvedName).filter(Boolean).length,
      }
    : null;

  const unfinable = draft
    ? draft.absentWithoutApology.filter(
        (person) => !members.some((m) => m.id === mappings[person]),
      )
    : [];

  function handleConfirm() {
    setError("");
    if (!draft) return;
    if (!draft.title.trim()) return setError("Give the minutes a title.");
    if (!draft.meetingDate) return setError("Choose the meeting date.");
    if (!draft.resolutions.some((r) => r.title.trim() && r.body.trim())) {
      return setError("Keep at least one resolution with a title and body.");
    }

    const payload = {
      ...draft,
      membersPresent: draft.membersPresent.map(resolvedName).filter(Boolean),
      absentWithApology: draft.absentWithApology.map(resolvedName).filter(Boolean),
      absentWithoutApology: draft.absentWithoutApology.map(resolvedName).filter(Boolean),
      agenda: draft.agenda.filter(Boolean),
      resolutions: draft.resolutions
        .filter((r) => r.title.trim() && r.body.trim())
        .map((r) => ({
          ...r,
          ref: (r.ref || "").toUpperCase(),
          title: r.title.trim(),
          body: r.body.trim(),
        })),
      minutesId: minutesChoice || null,
      matchMeetingId: meetingChoice,
      linkMeeting: true,
      actionItems,
      sourceDocument: fileInfo?.name || "",
    };

    setBusy(true);
    try {
      const applied = applyMinutesImport(payload);
      setResult(applied);
      onImported?.(applied.minutes.id);
    } catch (err) {
      setError(err?.message || "The import could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
        <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-navy">
          <Check className="h-5 w-5 text-green" />
          Import saved
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-navy/70">
          <li>Minutes stored as a draft with {result.minutes.resolutions.length} resolutions.</li>
          <li>
            {result.meetingCreated
              ? "A new meeting record was created and linked."
              : result.meetingId
                ? "The existing meeting was updated and linked."
                : "No meeting record was linked."}
          </li>
          <li>
            {result.finesCreated} meeting fine{result.finesCreated === 1 ? "" : "s"} created
            for unexcused absences.
          </li>
          <li>
            {result.actionItemsCreated} action item{result.actionItemsCreated === 1 ? "" : "s"} created.
          </li>
        </ul>
        <p className="mt-4 text-xs text-navy/50">
          Unmatched names are stored exactly as written in the document. Open the minutes to edit
          them or map them to members before approval.
        </p>
        <button
          onClick={() => onImported?.(result.minutes.id)}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold-dark px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gold"
        >
          Open minutes
        </button>
      </section>
    );
  }

  if (!draft) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-full bg-navy/5 px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-navy/10"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to minutes
        </button>
        <h2 className="mt-6 flex items-center gap-2 font-serif text-xl font-bold text-navy">
          <Upload className="h-5 w-5 text-gold-dark" />
          Import minutes document
        </h2>
        <p className="mt-1 text-sm text-navy/60">
          Upload the signed minutes in Word (.docx) or PDF. We read the meeting details,
          attendance, agenda and resolutions, then show you everything before saving.
        </p>

        <label className="mt-6 block cursor-pointer rounded-2xl border-2 border-dashed border-navy/20 bg-sand p-10 text-center transition-colors hover:border-navy/40">
          <input
            type="file"
            accept=".docx,.pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          {busy ? (
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-navy">
              <Loader2 className="h-5 w-5 animate-spin" />
              Reading document…
            </span>
          ) : (
            <>
              <Upload className="mx-auto h-7 w-7 text-navy/40" />
              <p className="mt-3 text-sm font-semibold text-navy">Choose a .docx or .pdf file</p>
              <p className="mt-1 text-xs text-navy/50">Up to 8 MB · scanned PDFs are not supported</p>
            </>
          )}
        </label>

        {error && (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 ring-1 ring-red-200">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}
      </section>
    );
  }

  const meetings = getMeetings();

  return (
    <section className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-navy">
            <FileText className="h-5 w-5 text-gold-dark" />
            Review before importing
          </h2>
          <p className="mt-1 flex items-center gap-2 text-sm text-navy/60">
            <Link2 className="h-4 w-4" />
            {fileInfo?.name} · {(fileInfo?.kind || "").toUpperCase()} · nothing is saved until you
            confirm
          </p>
        </div>
        <button
          onClick={reset}
          className="rounded-full bg-navy/5 px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-navy/10"
        >
          Change file
        </button>
      </div>

      {draft.warnings.length > 0 && (
        <div className="mt-5 space-y-1 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-amber-200">
          {draft.warnings.map((w) => (
            <p key={w} className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {w}
            </p>
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Minutes title" className="sm:col-span-2 lg:col-span-1">
          <input
            className={inputCls}
            value={draft.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </Field>
        <Field label="Meeting type">
          <select
            className={inputCls}
            value={draft.meetingType}
            onChange={(e) => set("meetingType", e.target.value)}
          >
            <option>AGM</option>
            <option>Monthly</option>
            <option>Special</option>
          </select>
        </Field>
        <Field label="Meeting date">
          <input
            type="date"
            className={inputCls}
            value={draft.meetingDate}
            onChange={(e) => set("meetingDate", e.target.value)}
          />
        </Field>
        <Field label="Start time">
          <input
            type="time"
            className={inputCls}
            value={draft.startTime}
            onChange={(e) => set("startTime", e.target.value)}
          />
        </Field>
        <Field label="End time">
          <input
            type="time"
            className={inputCls}
            value={draft.endTime}
            onChange={(e) => set("endTime", e.target.value)}
          />
        </Field>
        <Field label="Venue">
          <input
            className={inputCls}
            value={draft.venue}
            onChange={(e) => set("venue", e.target.value)}
          />
        </Field>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["chairperson", "Chairperson"],
          ["viceChairperson", "Vice chairperson"],
          ["treasurer", "Treasurer"],
          ["secretary", "Secretary"],
          ["organizingSecretary", "Organising secretary"],
          ["nominatedMember", "Nominated member"],
        ].map(([key, label]) => (
          <Field key={key} label={label}>
            <input
              className={inputCls}
              value={draft[key]}
              onChange={(e) => set(key, e.target.value)}
            />
          </Field>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {[
          ["membersPresent", "Present"],
          ["absentWithApology", "Absent with apology"],
          ["absentWithoutApology", "Absent without apology"],
        ].map(([key, label]) => (
          <AttendanceBlock
            key={key}
            label={label}
            names={draft[key]}
            members={members}
            aliases={aliases}
            mappings={mappings}
            onChangeName={(i, v) => setList(key, i, v)}
            onRemove={(i) => removeListRow(key, i)}
            onAdd={() => addListRow(key)}
            onMap={(person, memberId) =>
              setMappings((m) => ({ ...m, [person]: memberId }))
            }
          />
        ))}
      </div>

      {unfinable.length > 0 && (
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {unfinable.length} unexcused name{unfinable.length === 1 ? "" : "s"} not mapped to a
          member, so no fine can be raised: {unfinable.join(", ")}
        </p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Field label="Agenda (one item per line)">
          <textarea
            rows={8}
            className={inputCls}
            value={draft.agenda.join("\n")}
            onChange={(e) => set("agenda", e.target.value.split("\n").map((s) => s.trim()))}
          />
        </Field>
        <div>
          <p className={labelCls}>Sign-off</p>
          <div className="mt-1.5 grid gap-4 sm:grid-cols-2">
            <input
              className={inputCls}
              value={draft.writtenBy}
              placeholder="Written by"
              onChange={(e) => set("writtenBy", e.target.value)}
            />
            <input
              className={inputCls}
              value={draft.approvedBy}
              placeholder="Approved by"
              onChange={(e) => set("approvedBy", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <p className={labelCls}>Resolutions ({draft.resolutions.length})</p>
          <button
            onClick={addResolution}
            className="inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-navy/10"
          >
            <Plus className="h-3.5 w-3.5" />
            Add resolution
          </button>
        </div>
        <div className="mt-3 space-y-4">
          {draft.resolutions.map((r, i) => (
            <div key={i} className="rounded-2xl bg-sand p-4 ring-1 ring-navy/5">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  className={`${inputCls} max-w-[11rem] font-semibold`}
                  value={r.ref}
                  onChange={(e) => updateResolution(i, { ref: e.target.value })}
                />
                <input
                  className={inputCls}
                  value={r.title}
                  placeholder="Resolution title"
                  onChange={(e) => updateResolution(i, { title: e.target.value })}
                />
                <button
                  onClick={() => removeResolution(i)}
                  className="rounded-full p-2 text-navy/40 transition-colors hover:bg-red-50 hover:text-red-500"
                  aria-label="Remove resolution"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <textarea
                rows={3}
                className={`${inputCls} mt-2`}
                value={r.body}
                onChange={(e) => updateResolution(i, { body: e.target.value })}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <p className={labelCls}>Action items from resolutions</p>
        <p className="mt-1 text-xs text-navy/50">
          Tick the items the group is expected to track. Owners and dates can be edited.
        </p>
        <div className="mt-3 space-y-3">
          {actionItems.length === 0 && (
            <p className="rounded-2xl bg-sand px-5 py-4 text-sm text-navy/50">
              No action items were detected in the resolutions.
            </p>
          )}
          {actionItems.map((item, i) => (
            <div
              key={i}
              className="flex flex-wrap items-center gap-3 rounded-2xl bg-sand p-4 ring-1 ring-navy/5"
            >
              <input
                type="checkbox"
                checked={item.include !== false}
                onChange={(e) => updateAction(i, { include: e.target.checked })}
                className="h-4 w-4 accent-navy"
                aria-label="Include action item"
              />
              <span className="rounded-full bg-navy/5 px-2.5 py-1 text-[11px] font-semibold text-navy">
                {item.ref || "Action"}
              </span>
              <input
                className={`${inputCls} min-w-[14rem] flex-1`}
                value={item.title}
                onChange={(e) => updateAction(i, { title: e.target.value })}
              />
              <input
                className={`${inputCls} max-w-[12rem]`}
                placeholder="Owner"
                value={item.owner}
                onChange={(e) => updateAction(i, { owner: e.target.value })}
              />
              <input
                type="date"
                className={`${inputCls} max-w-[10rem]`}
                value={item.dueDate}
                onChange={(e) => updateAction(i, { dueDate: e.target.value })}
              />
              <button
                onClick={() => setActionItems((items) => items.filter((_, j) => j !== i))}
                className="rounded-full p-2 text-navy/40 transition-colors hover:bg-red-50 hover:text-red-500"
                aria-label="Remove action item"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() =>
            setActionItems((items) => [...items, { ref: "", title: "", owner: "", dueDate: "", include: true }])
          }
          className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-3 py-2 text-xs font-semibold text-navy transition-colors hover:bg-navy/10"
        >
          <Plus className="h-3.5 w-3.5" />
          Add action item
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Field label="Link to existing meeting">
          <select
            className={inputCls}
            value={meetingChoice}
            onChange={(e) => setMeetingChoice(e.target.value)}
          >
            <option value="new">Create a new meeting record</option>
            {meetings.map((m) => (
              <option key={m.id} value={m.id}>
                {m.date} · {m.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Overwrite minutes for this date">
          <select
            className={inputCls}
            value={minutesChoice}
            onChange={(e) => setMinutesChoice(e.target.value)}
          >
            <option value="">Create new minutes</option>
            {getMinutes().map((m) => (
              <option key={m.id} value={m.id}>
                {m.meetingDate} · {m.title}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {error && (
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 ring-1 ring-red-200">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      <details className="mt-6 rounded-2xl bg-sand p-4">
        <summary className="cursor-pointer text-sm font-semibold text-navy">
          View extracted document text
        </summary>
        <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap text-xs text-navy/70">
          {rawText}
        </pre>
      </details>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={handleConfirm}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full bg-gold-dark px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gold disabled:opacity-60"
        >
          <Check className="h-4 w-4" />
          Confirm import
        </button>
        <button
          onClick={onCancel}
          className="rounded-full bg-navy/5 px-5 py-3 text-sm font-semibold text-navy transition-colors hover:bg-navy/10"
        >
          Cancel
        </button>
        {attendanceTotals && (
          <span className="text-xs text-navy/50">
            {attendanceTotals.present} present · {attendanceTotals.apology} apologised ·{" "}
            {attendanceTotals.absent} unexcused
          </span>
        )}
      </div>
    </section>
  );
}

function Field({ label, className = "", children }) {
  return (
    <label className={`block ${className}`}>
      <span className={labelCls}>{label}</span>
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}

function AttendanceBlock({
  label,
  names,
  members,
  aliases,
  mappings,
  onChangeName,
  onRemove,
  onAdd,
  onMap,
}) {
  return (
    <div>
      <p className={labelCls}>
        {label} ({names.length})
      </p>
      <div className="mt-2 space-y-2">
        {names.length === 0 && (
          <p className="rounded-xl bg-sand px-4 py-3 text-xs text-navy/50">None listed.</p>
        )}
        {names.map((person, i) => {
          const suggestion = suggestMemberMatch(person, members, aliases);
          const selected = mappings[person] || "";
          return (
            <div key={i} className="flex items-center gap-2">
              <input
                className={inputCls}
                value={person}
                onChange={(e) => onChangeName(i, e.target.value)}
                aria-label={`${label} name`}
              />
              <select
                className={`${inputCls} max-w-[12rem]`}
                value={selected}
                onChange={(e) => onMap(person, e.target.value)}
                aria-label={`Map ${person} to member`}
              >
                <option value="">Keep as written</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              {suggestion && !selected && (
                <button
                  onClick={() => onMap(person, suggestion.id)}
                  className="shrink-0 rounded-full bg-green/10 px-2.5 py-1 text-[11px] font-semibold text-green"
                  title={`Map to ${suggestion.name}`}
                >
                  {suggestion.name.split(" ")[0]}
                </button>
              )}
              <button
                onClick={() => onRemove(i)}
                className="shrink-0 rounded-full p-2 text-navy/40 transition-colors hover:bg-red-50 hover:text-red-500"
                aria-label={`Remove ${person}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
      <button
        onClick={onAdd}
        className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-navy/10"
      >
        <Plus className="h-3.5 w-3.5" />
        Add name
      </button>
    </div>
  );
}
