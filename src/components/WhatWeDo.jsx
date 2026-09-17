import { PiggyBank, GraduationCap, Trophy, HandHeart } from "lucide-react";

const items = [
  {
    icon: GraduationCap,
    title: "Mentoring Youth",
    text: "Yearly mentorship programs in local schools — sharing campus experience, career guidance, and life beyond the classroom.",
  },
  {
    icon: Trophy,
    title: "Playing Football",
    text: "Five tournaments organized and hosted — bringing young people together through teamwork and healthy competition.",
  },
  {
    icon: HandHeart,
    title: "Giving Back",
    text: "From our famous December 31st gathering to community development — investing in the home that invested in us.",
  },
  {
    icon: PiggyBank,
    title: "Saving Together",
    text: "A chama-style savings initiative backed by working members, building a collective financial foundation for our community activities.",
  },
];

export default function WhatWeDo() {
  return (
    <section id="impact" className="bg-navy py-20 text-white lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
          What We Do
        </p>
        <h2 className="mt-4 max-w-3xl font-serif text-4xl font-bold leading-tight sm:text-5xl">
          One community, growing in every direction.
        </h2>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/75">
          Nyakahura Elites isn't just a savings group or a social club. It's a
          community of young people investing in each other and in the place
          that shaped them.
        </p>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-3xl bg-white/[0.06] p-7 ring-1 ring-white/10 backdrop-blur transition-colors hover:bg-white/[0.09]"
            >
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gold/15 text-gold ring-1 ring-gold/30">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-xl font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}