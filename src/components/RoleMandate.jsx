import { ScrollText, CheckCircle2, UserRound } from "lucide-react";
import { getRoleByKey } from "../data/roles";

export default function RoleMandate({ roleKey, holder, className = "" }) {
  const role = getRoleByKey(roleKey);
  if (!role) return null;

  return (
    <section
      className={`rounded-3xl bg-white p-6 shadow-xl ring-1 ring-navy/5 sm:p-8 ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold-dark">
            <ScrollText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-dark">
              {role.label} · {role.tag}
            </p>
            <h2 className="mt-1 font-serif text-xl font-bold text-navy">
              Mandate and duties
            </h2>
          </div>
        </div>
        {holder && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-navy/10 px-3.5 py-1.5 text-xs font-semibold text-navy/70">
            <UserRound className="h-3.5 w-3.5" />
            {holder.name}
            {holder.memberNo ? ` · ${holder.memberNo}` : ""}
          </span>
        )}
      </div>

      <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
        {role.mandate.map((duty) => (
          <li
            key={duty}
            className="flex items-start gap-2.5 rounded-xl bg-sand px-4 py-3 text-sm leading-relaxed text-navy/80"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green" />
            {duty}
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs font-medium text-navy/50">
        This portal lives on with the office — when the role is handed over, the
        next elected official picks it up exactly where the last one left it.
      </p>
    </section>
  );
}