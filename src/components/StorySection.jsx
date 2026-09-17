export default function StorySection() {
  return (
    <section id="story" className="bg-sand py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-2 lg:items-center lg:gap-20 lg:px-10">
        {/* Image with stat card */}
        <div className="relative">
          <div className="overflow-hidden rounded-3xl shadow-xl shadow-black/5">
            <img
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80"
              alt="Friends talking in a room"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="absolute -bottom-8 right-6 rounded-2xl bg-white p-5 shadow-xl shadow-black/10 lg:right-10">
            <div className="font-serif text-3xl font-bold text-navy">5+</div>
            <div className="text-sm text-navy/70">Football tournaments hosted</div>
          </div>
        </div>

        {/* Text */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-dark">
            Our Story
          </p>
          <h2 className="mt-4 font-serif text-4xl font-bold leading-tight text-navy sm:text-5xl">
            It began with a small shop, a phone charger, and a group of friends.
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed text-navy/75">
            <p>
              Nyakahura Elites started exactly where home did — at a humble
              village shop where university students from the same community
              would gather on holiday to charge their phones, swap stories about
              campus life, and simply be together.
            </p>
            <p>
              What began as three or four friends grew into a yearly tradition,
              then into an organized group, and finally into the structured
              community we are today — one that saves together, mentors the
              next generation, and gives back to the village that raised us.
            </p>
          </div>

          <p className="mt-8 text-sm font-semibold text-navy/60">
            From a village shop to today's community — every chapter was written
            together.
          </p>
        </div>
      </div>
    </section>
  );
}