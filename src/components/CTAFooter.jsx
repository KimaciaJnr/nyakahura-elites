import { ArrowRight } from "lucide-react";

export default function CTAFooter() {
  return (
    <section id="join" className="bg-navy py-20 text-white lg:py-28">
      <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
        <h2 className="font-serif text-4xl font-bold leading-tight sm:text-5xl">
          From a village shop to a growing community —
          <br />
          <span className="italic text-gold">
            and we're just getting started.
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/75">
          Be part of the next chapter. Join us, support our work, or simply come
          home — everyone with roots in Nyakahura is welcome.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#get-involved"
            className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-navy shadow-lg shadow-gold/30 transition-colors hover:bg-gold-dark"
          >
            Join Our Community
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#get-involved"
            className="inline-flex items-center rounded-full border border-white/40 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Send Us a Message
          </a>
        </div>
      </div>
    </section>
  );
}