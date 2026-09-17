import { Link } from "react-router-dom";
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
          Support our work, or simply come home — members with roots in
          Nyakahura can sign in to their portal below.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/account"
            className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-navy shadow-lg shadow-gold/30 transition-colors hover:bg-gold-dark"
          >
            Member Login
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#get-involved"
            className="inline-flex items-center rounded-full border border-white/40 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Support Our Work
          </a>
        </div>
      </div>
    </section>
  );
}