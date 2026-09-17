import {
  Users,
  ShieldCheck,
  Sparkles,
  Heart,
  Trophy,
  HeartHandshake,
} from "lucide-react";

const values = [
  { icon: Users, title: "Unity", text: "Members from different campuses and careers, still one community rooted in the same village." },
  { icon: ShieldCheck, title: "Accountability", text: "Transparent contributions and responsibilities — every member owns their part of the promise." },
  { icon: Sparkles, title: "Collective Growth", text: "We rise together, lifting each other through school, work, and life's milestones." },
  { icon: Heart, title: "Friendship", text: "Approachability and warmth at the centre — we are friends first, members second." },
  { icon: Trophy, title: "Ambition", text: "A shared drive to excel in education, build successful lives, and become valuable citizens." },
  { icon: HeartHandshake, title: "Giving Back", text: "Returning what Nyakahura gave us through mentorship, sport, and community development." },
];

export default function ValuesSection() {
  return (
    <section className="bg-cream py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-dark">
            Our Values
          </p>
          <h2 className="mt-4 font-serif text-4xl font-bold leading-tight text-navy sm:text-5xl">
            Built on more than friendship
          </h2>
          <p className="mt-5 text-base leading-relaxed text-navy/70">
            The values that carried a handful of friends through university now
            guide a whole community.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {values.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/[0.04]"
            >
              <div className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-green/[0.06] text-green ring-1 ring-green/10">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-xl font-bold text-navy">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-navy/70">
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}