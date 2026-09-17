import { GraduationCap, Trophy, ArrowRight } from "lucide-react";

const programs = [
  {
    tag: "Mentorship",
    icon: GraduationCap,
    title: "Inspiring the next generation to reach higher",
    text: "Every year, our members return to local schools to share journeys from university and work — encouraging students on discipline, leadership, careers, and life after school.",
    cta: "Explore mentorship programs",
    image:
      "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    tag: "Football",
    icon: Trophy,
    title: "Five tournaments. Teamwork on the field.",
    text: "Through sport we bring the community together — promoting teamwork, healthy competition, and friendships that last beyond the final whistle.",
    cta: "See tournament history",
    image:
      "https://images.unsplash.com/photo-1552667466-07770ae110d0?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function ProgramCards() {
  return (
    <section id="mentorship" className="bg-white py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-2 lg:px-10">
        {programs.map(({ tag, icon: Icon, title, text, cta, image }) => (
          <article
            key={tag}
            className="group relative isolate overflow-hidden rounded-3xl"
          >
            <img
              src={image}
              alt={title}
              loading="lazy"
              className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy/95 via-navy/70 to-navy/30" />

            <div className="flex min-h-[420px] flex-col justify-end p-8 lg:p-10">
              <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-gold px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-navy">
                <Icon className="h-3.5 w-3.5" />
                {tag}
              </span>
              <h3 className="font-serif text-3xl font-bold leading-tight text-white sm:text-4xl">
                {title}
              </h3>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80">
                {text}
              </p>
              <a
                href="#get-involved"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-gold"
              >
                {cta}
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}