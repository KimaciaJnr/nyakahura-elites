import { useMemo, useState } from "react";
import { Megaphone, Plus, Trash2, Send, Eye, EyeOff } from "lucide-react";
import {
  getAnnouncements,
  addAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../../lib/store";

const inputCls =
  "w-full rounded-xl border border-navy/10 bg-white px-3.5 py-2.5 text-sm text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10";

export default function AnnouncementsTab({ onChanged }) {
  const [refresh, setRefresh] = useState(0);
  const announcements = useMemo(() => getAnnouncements(), [refresh, onChanged]);

  const [show, setShow] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState("");

  return (
    <section className="mt-8 rounded-3xl bg-white p-6 shadow-xl sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-navy">
            <Megaphone className="h-5 w-5 text-gold-dark" />
            Announcements
          </h2>
          <p className="mt-1 text-sm text-navy/60">
            Published announcements appear on every member's dashboard.
          </p>
        </div>
        <button
          onClick={() => setShow((s) => !s)}
          className="inline-flex items-center gap-1.5 rounded-full bg-gold-dark px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold"
        >
          <Plus className="h-4 w-4" />
          {show ? "Close" : "New announcement"}
        </button>
      </div>

      {show && (
        <div className="mt-6 space-y-4 rounded-2xl bg-sand p-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-navy/50">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Arrears settlement deadline"
              className={`${inputCls} mt-1.5`}
            />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-navy/50">Message</span>
            <textarea
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What should members know?"
              className={`${inputCls} mt-1.5`}
            />
          </div>
          <button
            onClick={() => {
              if (!title.trim()) {
                setMsg("Give the announcement a title.");
                return;
              }
              addAnnouncement({ title: title.trim(), body: body.trim(), published: true });
              setTitle("");
              setBody("");
              setShow(false);
              setMsg("Announcement published to members.");
              setRefresh((n) => n + 1);
              onChanged?.();
            }}
            className="inline-flex items-center gap-2 rounded-full bg-green px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-dark"
          >
            <Send className="h-4 w-4" />
            Publish announcement
          </button>
          {msg && <p className="text-xs font-medium text-navy/60">{msg}</p>}
        </div>
      )}

      <ul className="mt-6 space-y-3">
        {announcements.length === 0 && (
          <li className="rounded-2xl bg-sand px-5 py-8 text-center text-sm text-navy/50">
            No announcements yet.
          </li>
        )}
        {announcements.map((a) => (
          <li key={a.id} className="rounded-2xl bg-sand p-5 ring-1 ring-navy/5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      a.published ? "bg-green/10 text-green" : "bg-navy/5 text-navy/50"
                    }`}
                  >
                    {a.published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    {a.published ? "Published" : "Hidden"}
                  </span>
                  <span className="text-xs text-navy/50">{a.date}</span>
                </div>
                <p className="mt-2 font-serif text-lg font-bold text-navy">{a.title}</p>
                {a.body && <p className="mt-1 text-sm leading-relaxed text-navy/70">{a.body}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    updateAnnouncement(a.id, { published: !a.published });
                    setRefresh((n) => n + 1);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-4 py-2 text-xs font-semibold text-navy hover:bg-navy/10"
                >
                  {a.published ? "Hide" : "Publish"}
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete "${a.title}"?`)) {
                      deleteAnnouncement(a.id);
                      setRefresh((n) => n + 1);
                    }
                  }}
                  className="rounded-full p-2 text-navy/40 hover:bg-red-50 hover:text-red-500"
                  aria-label="Delete announcement"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}