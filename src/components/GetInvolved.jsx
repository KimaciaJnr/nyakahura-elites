import { useState } from "react";
import { ArrowRight, Check, ChevronDown } from "lucide-react";

export default function GetInvolved() {
  const [interest, setInterest] = useState("Supporting a program");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (honeypot) return;
    setSubmitted(true);
  }

  return (
    <section id="get-involved" className="bg-sand py-20 scroll-mt-24 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-dark">Get Involved</p>
          <h2 className="mt-4 font-serif text-4xl font-bold leading-tight text-navy sm:text-5xl">
            Support our work.
          </h2>
          <p className="mt-6 max-w-md leading-relaxed text-navy/70">
            Membership is by invitation only, but there is still a place for you
            — support a program, partner with us, or connect with the people
            building a stronger Nyakahura.
          </p>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-navy/5">
            <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-green/10 text-green">
              <Check className="h-7 w-7" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-navy">
              Thank you — we&apos;ll be in touch.
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-navy/70">
              Someone from the Nyakahura Elites team will reach out to you at{" "}
              <span className="font-semibold text-navy">{email}</span> soon.
            </p>
          </div>
        ) : (
          <form className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy/5 sm:p-8" onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold text-navy" htmlFor="interest">
              I&apos;d like to connect about
            </label>
            <div className="relative mt-2">
              <select
                id="interest"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                className="w-full appearance-none rounded-xl border border-navy/10 bg-white px-4 py-3 pr-10 text-sm text-navy focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10"
              >
                <option>Supporting a program</option>
                <option>Partnering with Nyakahura Elites</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40" />
            </div>
            <label className="mt-5 block text-sm font-semibold text-navy" htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-xl border border-navy/10 px-4 py-3 text-sm text-navy outline-none placeholder:text-navy/40 focus:border-navy focus:ring-2 focus:ring-navy/10"
            />
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />
            <button type="submit" className="mt-6 inline-flex items-center gap-2 rounded-full bg-green px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-dark">
              Start a conversation <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}