const testimonials = [
  {
    quote:
      "The interface feels clean and focused. I can find the account information I need without fighting through a complicated dashboard.",
    name: "Michael R.",
    role: "Thesoros user",
  },
  {
    quote:
      "I like having my market activity and account management experience organized in one place.",
    name: "Daniel K.",
    role: "Thesoros user",
  },
  {
    quote:
      "The platform has a modern feel and makes the overall trading experience much easier to navigate.",
    name: "Sarah M.",
    role: "Thesoros user",
  },
];

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="border-t border-white/[0.06] py-28"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">
            User Experience
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-tight !text-[#FFFFFF] sm:text-5xl">
            Built to feel simple.
          </h2>

          <p className="mx-auto mt-5 max-w-xl leading-7 !text-[#FFFFFF]">
            A focused platform experience designed to keep your account and
            market activity easy to navigate.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.name}
              className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-7 transition hover:border-gold/20 hover:bg-gold/[0.025]"
            >
              <div className="flex gap-1 text-gold">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>

              <blockquote className="mt-6 text-sm leading-7 !text-[#FFFFFF]">
                “{testimonial.quote}”
              </blockquote>

              <div className="mt-7 flex items-center gap-3 border-t border-white/[0.06] pt-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-sm font-bold text-gold">
                  {testimonial.name.charAt(0)}
                </div>

                <div>
                  <p className="text-sm font-bold !text-[#FFFFFF]">
                    {testimonial.name}
                  </p>

                  <p className="mt-0.5 text-xs !text-[#FFFFFF]">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
