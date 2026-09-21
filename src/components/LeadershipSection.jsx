import { CURRENT_REGIME, FOUNDING_REGIME, ELECTION_CYCLE_YEARS } from "../data/leadership";

const AVATAR_SHADES = [
  "bg-green",
  "bg-gold-dark",
  "bg-navy",
  "bg-red",
  "bg-green/80",
  "bg-gold-dark/80",
];

function initials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function OfficerCard({ person, index }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl bg-sand p-6 text-center transition-colors hover:bg-sand/70">
      <div
        className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-full text-lg font-bold text-white ${
          person.photo ? "" : AVATAR_SHADES[index % AVATAR_SHADES.length]
        }`}
      >
        {person.photo ? (
          <img
            src={person.photo}
            alt={`${person.name} — ${person.role}`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          initials(person.name)
        )}
      </div>
      <div>
        <p className="font-serif text-sm font-bold text-navy">{person.name}</p>
        <p className="mt-0.5 text-xs font-semibold text-gold-dark">{person.role}</p>
      </div>
    </div>
  );
}

function RegimeBlock({ regime }) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-serif text-xl font-bold text-navy">{regime.label}</h3>
        <span className="rounded-full border border-navy/10 px-3 py-1 text-xs font-semibold text-navy/60">
          {regime.term}
        </span>
      </div>
      <p className="mt-1.5 text-sm text-navy/60">{regime.note}</p>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {regime.roles.map((person, i) => (
          <OfficerCard key={person.name} person={person} index={i} />
        ))}
      </div>
    </div>
  );
}

export default function LeadershipSection() {
  return (
    <section id="leadership" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-dark">
          About us — Leadership
        </p>
        <h2 className="mt-4 font-serif text-4xl font-bold leading-tight text-navy sm:text-5xl">
          Run by the members, for the members.
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-navy/75">
          Every {ELECTION_CYCLE_YEARS} years the group elects a new committee,
          and any member can step up to any position. The current team took
          office in January 2026 at the handover from the committee that had led
          the chama since its foundations.
        </p>

        <div className="mt-14 grid gap-14">
          <RegimeBlock regime={CURRENT_REGIME} />

          <div className="border-t border-navy/10 pt-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-navy/50">
              A little history
            </p>
            <RegimeBlock regime={FOUNDING_REGIME} />
          </div>

          {!CURRENT_REGIME.roles.every((r) => r.photo) && (
            <p className="text-xs text-navy/40">
              Official portraits are on their way — the initials above stand in
              until real photos are added.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}