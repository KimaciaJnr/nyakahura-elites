import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=2000&q=80"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-navy/70" />
      </div>

      <div className="mx-auto flex min-h-[560px] max-w-7xl flex-col justify-center px-6 py-24 sm:min-h-[640px] lg:px-10 lg:py-32">
        <span className="mb-8 inline-flex w-fit items-center rounded-full border border-white/40 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/90">
          A community of young people from Nyakahura, Kenya
        </span>

        <h1 className="max-w-4xl font-serif text-5xl font-bold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
          Together We Grow.
          <br />
          <span className="italic text-gold">Together We Give Back.</span>
        </h1>

        <p className="mt-7 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
          From a few university friends from the same village, to a growing
          community of young professionals — connected by purpose, supporting
          one another, mentoring the next generation, creating opportunities,
          and building a better Nyakahura together.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <a
            href="#get-involved"
            className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-navy shadow-lg shadow-gold/20 transition-colors hover:bg-gold-dark"
          >
            Get Involved
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#story"
            className="inline-flex items-center rounded-full border border-white/50 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Read Our Story
          </a>
        </div>

        <p className="mt-10 text-sm text-white/70">
          Rooted in friendship · Built on collective strength
        </p>
      </div>
    </section>
  );
}