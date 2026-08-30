import Link from "next/link";

export default function FinalCta() {
  return (
    <section className="border-t border-white/[0.06] py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-gold/20 bg-gold/[0.05] px-6 py-20 text-center sm:px-12">
          <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-3xl" />

          <div className="absolute bottom-0 left-1/2 h-48 w-48 -translate-x-1/2 translate-y-1/2 rounded-full bg-gold/[0.07] blur-3xl" />

          <div className="relative">
            <img src="/branding/thesoros-logo.png" alt="THÉSOROS" className="h-9 w-auto object-contain" />

            <p className="mt-7 text-xs font-bold uppercase tracking-[0.25em] text-gold">
              Thesoros
            </p>

            <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-bold tracking-tight !text-[#FFFFFF] sm:text-6xl">
              Build your thésoros in the markets.
            </h2>

            <p className="mx-auto mt-6 max-w-xl leading-7 !text-[#FFFFFF]">
              Create your Thesoros account and access a modern
              environment for managing your market journey.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-2xl bg-gold px-7 py-4 text-sm font-bold !text-[#FFFFFF] transition hover:bg-gold"
              >
                Create Your Account
              </Link>

              <Link
                href="/login"
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-7 py-4 text-sm font-bold !text-[#FFFFFF] transition hover:bg-white/[0.06]"
              >
                Log In
              </Link>
            </div>

            <p className="mt-7 text-[11px] !text-[#FFFFFF]">
              Market activity involves risk. Past performance does not
              guarantee future results.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
