import { useState } from "react";
import {
  PenLine,
  Check,
  Plus,
  Trash2,
  ChevronLeft,
  AlertTriangle,
} from "lucide-react";
import { addMinutes, updateMinutes } from "../../lib/store";

const TYPE_CODE = { AGM: "AGM", Monthly: "M", Special: "SP" };
const TYPE_OPTIONS = ["AGM", "Monthly", "Special"];

function makeRef(type, date, index) {
  const year = (date || new Date().toISOString().slice(0, 10)).slice(0, 4);
  const code = TYPE_CODE[type] || "M";
  return `MIN.${String(index + 1).padStart(2, "0")}/${code}/${year}`;
}

const inputClass =
  "w-full rounded-xl border border-navy/10 px-4 py-3 text-sm text-navy outline-none placeholder:text-navy/40 focus:border-navy focus:ring-2 focus:ring-navy/10";
const labelClass = "block text-sm font-semibold text-navy";

function toList(value) {
  return value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function fromList(list) {
  return (list || []).join("\n");
}

export default function MinutesForm({ minutes, onCancel, onSaved }) {
  const editing = Boolean(minutes);
  const [title, setTitle] = useState(minutes?.title || "");
  const [meetingType, setMeetingType] = useState(minutes?.meetingType || "Monthly");
  const [meetingDate, setMeetingDate] = useState(
    minutes?.meetingDate || new Date().toISOString().slice(0, 10),
  );
  const [startTime, setStartTime] = useState(minutes?.startTime || "20:30");
  const [endTime, setEndTime] = useState(minutes?.endTime || "21:30");
  const [venue, setVenue] = useState(minutes?.venue || "Google Meet");
  const [chairperson, setChairperson] = useState(minutes?.chairperson || "Marvin Karanja");
  const [secretary, setSecretary] = useState(minutes?.secretary || "Susan Wambui");
  const [present, setPresent] = useState(fromList(minutes?.membersPresent));
  const [withApology, setWithApology] = useState(fromList(minutes?.absentWithApology));
  const [withoutApology, setWithoutApology] = useState(fromList(minutes?.absentWithoutApology));
  const [agenda, setAgenda] = useState(minutes?.agenda?.length ? [...minutes.agenda] : [""]);
  const [resolutions, setResolutions] = useState(
    minutes?.resolutions?.length
      ? minutes.resolutions.map((r) => ({ ref: r.ref, title: r.title, body: r.body }))
      : [{ ref: makeRef(meetingType, meetingDate, 0), title: "", body: "" }],
  );
  const [writtenBy, setWrittenBy] = useState(minutes?.writtenBy || "Susan Wambui");
  const [approvedBy, setApprovedBy] = useState(minutes?.approvedBy || "Marvin Karanja");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateAgenda(i, value) {
    setAgenda((a) => a.map((x, j) => (j === i ? value : x)));
  }
  function addAgenda() {
    setAgenda((a) => [...a, ""]);
  }
  function removeAgenda(i) {
    setAgenda((a) => a.filter((_, j) => j !== i));
  }

  function updateRes(i, field, value) {
    setResolutions((r) => r.map((x, j) => (j === i ? { ...x, [field]: value } : x)));
  }
  function addRes() {
    setResolutions((r) => [
      ...r,
      { ref: makeRef(meetingType, meetingDate, r.length), title: "", body: "" },
    ]);
  }
  function removeRes(i) {
    setResolutions((r) => r.filter((_, j) => j !== i));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!title.trim()) return setError("Give the minutes a title (e.g. AGM 2026).");
    if (!meetingDate) return setError("Choose the meeting date.");

    const cleanAgenda = agenda.map((s) => s.trim()).filter(Boolean);
    const cleanRes = resolutions.filter((r) => r.title.trim() && r.body.trim());
    if (cleanAgenda.length === 0)
      return setError("Add at least one agenda item.");
    if (cleanRes.length === 0)
      return setError("Add at least one resolution with a title and body.");

    const data = {
      title: title.trim(),
      meetingType,
      meetingDate,
      startTime,
      endTime,
      venue: venue.trim() || "Google Meet",
      chairperson: chairperson.trim(),
      secretary: secretary.trim(),
      writtenBy: writtenBy.trim(),
      approvedBy: approvedBy.trim(),
      membersPresent: toList(present),
      absentWithApology: toList(withApology),
      absentWithoutApology: toList(withoutApology),
      agenda: cleanAgenda,
      resolutions: cleanRes,
      status: editing ? minutes.status : "draft",
    };

    if (editing) {
      updateMinutes(minutes.id, data);
      setSuccess("Minutes updated.");
      onSaved(minutes.id);
    } else {
      const saved = addMinutes(data);
      setSuccess("Minutes saved as draft.");
      onSaved(saved.id);
    }
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-navy">
            <PenLine className="h-5 w-5 text-gold-dark" />
            {editing ? "Edit minutes" : "Write minutes"}
          </h2>
          <p className="mt-1 text-sm text-navy/60">
            Record submissions after the meeting. You can approve them later.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-full bg-navy/5 px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-navy/10"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to minutes
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {error && (
          <p className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-xl bg-green/10 px-4 py-3 text-sm font-medium text-green ring-1 ring-green/20">
            {success}
          </p>
        )}

        <div>
          <h3 className="font-serif text-lg font-bold text-navy">Meeting details</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="min-title">
                Title *
              </label>
              <input
                id="min-title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. AGM 2026"
                className={`mt-2 ${inputClass}`}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="min-type">
                Meeting type *
              </label>
              <select
                id="min-type"
                value={meetingType}
                onChange={(e) => setMeetingType(e.target.value)}
                className={`mt-2 ${inputClass}`}
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="min-date">
                Date *
              </label>
              <input
                id="min-date"
                type="date"
                required
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className={`mt-2 ${inputClass}`}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="min-start">
                Start time
              </label>
              <input
                id="min-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={`mt-2 ${inputClass}`}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="min-end">
                End time
              </label>
              <input
                id="min-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={`mt-2 ${inputClass}`}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="min-venue">
                Venue
              </label>
              <input
                id="min-venue"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Google Meet or physical venue"
                className={`mt-2 ${inputClass}`}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="min-chair">
                Chairperson
              </label>
              <input
                id="min-chair"
                value={chairperson}
                onChange={(e) => setChairperson(e.target.value)}
                className={`mt-2 ${inputClass}`}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="min-sec">
                Secretary
              </label>
              <input
                id="min-sec"
                value={secretary}
                onChange={(e) => setSecretary(e.target.value)}
                className={`mt-2 ${inputClass}`}
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-serif text-lg font-bold text-navy">Attendance</h3>
          <p className="mt-1 text-sm text-navy/60">
            One name per line.
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div>
              <label className={labelClass} htmlFor="min-present">
                Members present
              </label>
              <textarea
                id="min-present"
                rows={6}
                value={present}
                onChange={(e) => setPresent(e.target.value)}
                placeholder={"David Muhia\nPeter Maina"}
                className={`mt-2 ${inputClass} leading-relaxed`}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="min-apology">
                Absent with apology
              </label>
              <textarea
                id="min-apology"
                rows={6}
                value={withApology}
                onChange={(e) => setWithApology(e.target.value)}
                placeholder="One name per line"
                className={`mt-2 ${inputClass} leading-relaxed`}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="min-no-apology">
                Absent without apology
              </label>
              <textarea
                id="min-no-apology"
                rows={6}
                value={withoutApology}
                onChange={(e) => setWithoutApology(e.target.value)}
                placeholder="One name per line"
                className={`mt-2 ${inputClass} leading-relaxed`}
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-serif text-lg font-bold text-navy">Agenda</h3>
          <div className="mt-4 space-y-2">
            {agenda.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-6 text-right text-sm text-navy/40">
                  {i + 1}.
                </span>
                <input
                  value={item}
                  onChange={(e) => updateAgenda(i, e.target.value)}
                  placeholder="Agenda item"
                  className={inputClass}
                />
                {agenda.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAgenda(i)}
                    className="shrink-0 rounded-full p-2 text-red-500 transition-colors hover:bg-red-50"
                    aria-label={`Remove agenda item ${i + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addAgenda}
              className="inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-4 py-2 text-xs font-semibold text-navy transition-colors hover:bg-navy/10"
            >
              <Plus className="h-3.5 w-3.5" />
              Add agenda item
            </button>
          </div>
        </div>

        <div>
          <h3 className="font-serif text-lg font-bold text-navy">
            Resolutions / minutes
          </h3>
          <p className="mt-1 text-sm text-navy/60">
            Each decision becomes a numbered minute, e.g. MIN.01/AGM/2026.
          </p>
          <div className="mt-4 space-y-4">
            {resolutions.map((r, i) => (
              <div
                key={i}
                className="rounded-2xl bg-sand p-5 ring-1 ring-navy/5"
              >
                <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
                  <div>
                    <label className={labelClass} htmlFor={`res-${i}-ref`}>
                      Reference
                    </label>
                    <input
                      id={`res-${i}-ref`}
                      value={r.ref}
                      onChange={(e) => updateRes(i, "ref", e.target.value)}
                      className={`mt-2 ${inputClass} bg-white`}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor={`res-${i}-title`}>
                      Title *
                    </label>
                    <input
                      id={`res-${i}-title`}
                      value={r.title}
                      onChange={(e) => updateRes(i, "title", e.target.value)}
                      placeholder="e.g. Monthly meetings and attendance"
                      className={`mt-2 ${inputClass} bg-white`}
                    />
                  </div>
                </div>
                <label className={`mt-3 block ${labelClass}`} htmlFor={`res-${i}-body`}>
                  Submission *
                </label>
                <textarea
                  id={`res-${i}-body`}
                  rows={3}
                  value={r.body}
                  onChange={(e) => updateRes(i, "body", e.target.value)}
                  placeholder="What was agreed / minuted…"
                  className={`mt-2 ${inputClass} bg-white leading-relaxed`}
                />
                {resolutions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRes(i)}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 ring-1 ring-red-200 transition-colors hover:bg-red-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addRes}
              className="inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-4 py-2 text-xs font-semibold text-navy transition-colors hover:bg-navy/10"
            >
              <Plus className="h-3.5 w-3.5" />
              Add resolution
            </button>
          </div>
        </div>

        <div>
          <h3 className="font-serif text-lg font-bold text-navy">Sign-off</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="min-written">
                Minutes written by
              </label>
              <input
                id="min-written"
                value={writtenBy}
                onChange={(e) => setWrittenBy(e.target.value)}
                className={`mt-2 ${inputClass}`}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="min-approved">
                Approved by
              </label>
              <input
                id="min-approved"
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                className={`mt-2 ${inputClass}`}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-navy/10 pt-6">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-green px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-dark"
          >
            <Check className="h-4 w-4" />
            {editing ? "Save changes" : "Save minutes"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 rounded-full bg-navy/5 px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-navy/10"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}