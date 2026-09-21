import { useMemo, useState } from "react";
import { Phone, Mail, Search, Users, Snowflake } from "lucide-react";
import { getMembers } from "../../lib/store";

export default function DirectoryTab() {
  const [query, setQuery] = useState("");
  const members = useMemo(
    () => getMembers().filter((m) => m.role === "member"),
    [],
  );
  const activeCount = members.filter((m) => m.status !== "frozen").length;
  const frozenCount = members.length - activeCount;

  const q = query.trim().toLowerCase();
  const filtered = q
    ? members.filter((m) =>
        [m.name, m.memberNo, m.email, m.phone || "", m.occupation || ""]
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
    : members;

  const withPhone = members.filter((m) => m.phone).length;

  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
          <p className="text-sm text-white/60">Active members</p>
          <p className="mt-2 font-serif text-3xl font-bold text-white">{activeCount}</p>
          <p className="mt-1 text-xs text-white/50">
            {frozenCount} frozen · on record
          </p>
        </div>
        <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
          <p className="text-sm text-white/60">Phone numbers on file</p>
          <p className="mt-2 font-serif text-3xl font-bold text-gold">{withPhone}</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
          <p className="text-sm text-white/60">Member directory</p>
          <p className="mt-2 font-serif text-3xl font-bold text-white">
            {filtered.length}
          </p>
        </div>
      </div>

      <section className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold-dark">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-navy">Member directory</h2>
            <p className="text-sm text-navy/60">
              Contact details for all members. Members update their own phone
              number from their portal.
            </p>
          </div>
        </div>

        <div className="relative mt-5">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, member no, phone, email…"
            className="w-full rounded-xl border border-navy/10 py-3 pl-11 pr-4 text-sm text-navy outline-none placeholder:text-navy/40 focus:border-navy focus:ring-2 focus:ring-navy/10"
          />
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b-2 border-navy/10 text-[11px] uppercase tracking-wide text-navy/50">
                <th className="py-3 pr-3 font-semibold">No.</th>
                <th className="py-3 pr-3 font-semibold">Name</th>
                <th className="py-3 pr-3 font-semibold">Phone</th>
                <th className="py-3 pr-3 font-semibold">Email</th>
                <th className="py-3 text-right font-semibold">Role</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-navy/5">
                  <td className="py-3 pr-3 font-medium text-navy/60">{m.memberNo}</td>
                  <td className="py-3 pr-3 font-semibold text-navy">{m.name}</td>
                  <td className="py-3 pr-3">
                    {m.phone ? (
                      <span className="inline-flex items-center gap-1.5 text-navy/70">
                        <Phone className="h-3.5 w-3.5 text-green" />
                        {m.phone}
                      </span>
                    ) : (
                      <span className="text-navy/40">—</span>
                    )}
                  </td>
                  <td className="py-3 pr-3">
                    <span className="inline-flex items-center gap-1.5 text-navy/70">
                      <Mail className="h-3.5 w-3.5 text-navy/40" />
                      {m.email}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {m.status === "frozen" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 ring-1 ring-amber-200">
                        <Snowflake className="h-3 w-3" />
                        Frozen
                      </span>
                    ) : (
                      <span className="rounded-full bg-navy/5 px-2.5 py-1 text-[11px] font-semibold capitalize text-navy/70">
                        {m.occupation || "Member"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-navy/50">
                    No members match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}