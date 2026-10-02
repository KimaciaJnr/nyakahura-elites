import { useMemo, useState } from "react";
import {
  Users,
  Search,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Briefcase,
  CalendarDays,
  AlertTriangle,
  Wallet,
  Snowflake,
  TrendingUp,
} from "lucide-react";
import {
  getMembers,
  getAccount,
  getMemberSavings,
  KES,
} from "../../lib/store";

const YEARS = [2023, 2024, 2025, 2026];

function fmtJoin(joined) {
  if (!joined) return "—";
  const [y, m] = String(joined).split("-").map(Number);
  if (!y || !m) return joined;
  return new Date(y, m - 1, 1).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
}

function initials(name) {
  return String(name || "")
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Chip({ ok, text }) {
  return ok ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-green/10 px-2.5 py-1 text-[11px] font-semibold text-green">
      {text}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600 ring-1 ring-red-200">
      {text}
    </span>
  );
}

export default function MemberDirectory() {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);

  const roster = useMemo(
    () =>
      getMembers()
        .filter((m) => m.role === "member")
        .map((m) => {
          const acc = getAccount(m.id);
          const sv = getMemberSavings(m.id);
          return {
            id: m.id,
            name: m.name,
            memberNo: m.memberNo,
            phone: m.phone || "",
            email: m.email || "",
            occupation: m.occupation || "",
            joined: m.joined || "",
            status: m.status || "active",
            monthly: acc ? acc.monthlyContribution || 0 : 0,
            balance: acc ? acc.balance || 0 : 0,
            grand: sv ? sv.grandTotal || 0 : 0,
            arrears: sv ? sv.arrears || 0 : 0,
            years: sv ? sv.years || {} : {},
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  const q = query.trim().toLowerCase();
  const filtered = q
    ? roster.filter((r) =>
        [r.name, r.memberNo, r.phone, r.email, r.occupation]
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
    : roster;

  const activeCount = roster.filter((r) => r.status !== "frozen").length;
  const withPhone = roster.filter((r) => r.phone).length;
  const pool = roster.reduce((sum, r) => sum + r.balance, 0);

  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
          <p className="text-sm text-white/60">Active members</p>
          <p className="mt-2 font-serif text-3xl font-bold text-white">
            {activeCount}
          </p>
          <p className="mt-1 text-xs text-white/50">
            {roster.length - activeCount} frozen · on record
          </p>
        </div>
        <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
          <p className="text-sm text-white/60">Phone numbers on file</p>
          <p className="mt-2 font-serif text-3xl font-bold text-gold">
            {withPhone}
          </p>
        </div>
        <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
          <p className="text-sm text-white/60">Savings pool (members)</p>
          <p className="mt-2 font-serif text-3xl font-bold text-gold">
            {KES(pool)}
          </p>
        </div>
      </div>

      <section className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-navy/5 text-navy">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-navy">
                Member directory
              </h2>
              <p className="text-sm text-navy/60">
                Contact details and financial standing. Read-only for
                leadership — members update their own phone number.
              </p>
            </div>
          </div>
        </div>

        <div className="relative mt-5">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, member no, phone, email, occupation…"
            className="w-full rounded-xl border border-navy/10 py-3 pl-11 pr-4 text-sm text-navy outline-none placeholder:text-navy/40 focus:border-navy focus:ring-2 focus:ring-navy/10"
          />
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b-2 border-navy/10 text-[11px] uppercase tracking-wide text-navy/50">
                <th className="py-3 pr-3 font-semibold">No.</th>
                <th className="py-3 pr-3 font-semibold">Member</th>
                <th className="py-3 pr-3 font-semibold">Phone</th>
                <th className="py-3 pr-3 font-semibold">Savings</th>
                <th className="py-3 pr-3 font-semibold">Standing</th>
                <th className="py-3 text-right font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const open = openId === r.id;
                const frozen = r.status === "frozen";
                return [
                  <tr
                    key={r.id}
                    className={`border-b border-navy/5 transition-colors hover:bg-sand/50 ${open ? "bg-sand/40" : ""}`}
                  >
                    <td className="py-3 pr-3 font-medium text-navy/60">
                      {r.memberNo}
                    </td>
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/5 text-xs font-bold text-navy">
                          {initials(r.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-navy">{r.name}</p>
                          <p className="text-[11px] text-navy/50">
                            {r.occupation || "Member"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-3">
                      {r.phone ? (
                        <span className="inline-flex items-center gap-1.5 text-navy/70">
                          <Phone className="h-3.5 w-3.5 text-green" />
                          {r.phone}
                        </span>
                      ) : (
                        <span className="text-navy/40">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-3 font-serif text-base font-bold text-navy">
                      {KES(r.balance)}
                    </td>
                    <td className="py-3 pr-3">
                      {frozen ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 ring-1 ring-amber-200">
                          <Snowflake className="h-3 w-3" />
                          Frozen
                        </span>
                      ) : r.arrears > 0 ? (
                        <Chip ok={false} text={`Arrears ${KES(r.arrears)}`} />
                      ) : (
                        <Chip ok text="Up to date" />
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setOpenId(open ? null : r.id)}
                        className="inline-flex items-center gap-1 rounded-full bg-navy/5 px-3 py-1.5 text-[11px] font-semibold text-navy transition-colors hover:bg-navy/10"
                        aria-expanded={open}
                      >
                        {open ? "Close" : "View"}
                        {open ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>,
                  open && (
                    <tr key={`${r.id}-detail`}>
                      <td colSpan={6} className="bg-sand/60 px-4 pb-5">
                        <div className="mt-3 grid gap-5 rounded-2xl bg-white p-5 ring-1 ring-navy/5 lg:grid-cols-2">
                          <div>
                            <h3 className="text-sm font-bold text-navy">
                              Member profile
                            </h3>
                            <dl className="mt-3 space-y-2 text-sm">
                              <div className="flex items-center justify-between gap-4">
                                <dt className="flex items-center gap-1.5 text-navy/50">
                                  <Mail className="h-3.5 w-3.5" />
                                  Email
                                </dt>
                                <dd className="truncate font-medium text-navy">
                                  {r.email || "—"}
                                </dd>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <dt className="flex items-center gap-1.5 text-navy/50">
                                  <Phone className="h-3.5 w-3.5" />
                                  Phone
                                </dt>
                                <dd className="font-medium text-navy">
                                  {r.phone || "—"}
                                </dd>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <dt className="flex items-center gap-1.5 text-navy/50">
                                  <Briefcase className="h-3.5 w-3.5" />
                                  Occupation
                                </dt>
                                <dd className="font-medium text-navy">
                                  {r.occupation || "—"}
                                </dd>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <dt className="flex items-center gap-1.5 text-navy/50">
                                  <CalendarDays className="h-3.5 w-3.5" />
                                  Joined
                                </dt>
                                <dd className="font-medium text-navy">
                                  {fmtJoin(r.joined)}
                                </dd>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <dt className="flex items-center gap-1.5 text-navy/50">
                                  <Wallet className="h-3.5 w-3.5" />
                                  Monthly contribution
                                </dt>
                                <dd className="font-medium text-navy">
                                  {KES(r.monthly)}
                                </dd>
                              </div>
                            </dl>
                          </div>

                          <div>
                            <h3 className="flex items-center gap-2 text-sm font-bold text-navy">
                              <TrendingUp className="h-4 w-4 text-green" />
                              Savings record
                            </h3>
                            <div className="mt-3 grid grid-cols-4 gap-2">
                              {YEARS.map((y) => (
                                <div
                                  key={y}
                                  className="rounded-xl bg-sand p-3 text-center ring-1 ring-navy/5"
                                >
                                  <p className="text-[11px] font-bold text-navy/50">
                                    {y}
                                  </p>
                                  <p className="mt-1 text-xs font-bold text-navy">
                                    {r.years[y] != null
                                      ? KES(r.years[y])
                                      : "—"}
                                  </p>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 flex items-center justify-between rounded-xl bg-navy/5 px-4 py-2.5 text-sm">
                              <span className="text-navy/60">Grand total</span>
                              <span className="font-serif text-base font-bold text-green">
                                {KES(r.grand)}
                              </span>
                            </div>
                            <p className="mt-2 text-xs text-navy/50">
                              {r.arrears > 0 ? (
                                <span className="inline-flex items-center gap-1 font-semibold text-red-600">
                                  <AlertTriangle className="h-3 w-3" />
                                  Has {KES(r.arrears)} in arrears
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 font-semibold text-green">
                                  Savings standing up to date
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ),
                ];
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
      </section>
    </div>
  );
}