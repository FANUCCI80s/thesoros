const steps = [
  {
    number: "01",
    title: "Create Your Profile",
    text: "Join THÉSOROS by creating your account and completing the required verification steps for a secure and seamless onboarding experience.",
  },
  {
    number: "02",
    title: "Fund Your Portfolio",
    text: "Choose an available funding method and follow the guided instructions within your account. Your balance is updated once your deposit has been verified and approved.",
  },
  {
    number: "03",
    title: "Explore Opportunities",
    text: "Discover supported markets and investment opportunities through a refined environment designed to help you monitor assets and make informed decisions.",
  },
  {
    number: "04",
    title: "Manage Your Wealth",
    text: "Monitor your portfolio, balances, transactions, and investment activity from one integrated dashboard designed around clarity and control.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden border-t border-white/[0.06] bg-[#050505] py-28"
    >
      {/* Background image */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25"
        style={{
          backgroundImage:
            "url('/branding/new-background-mobile-2.jpg')",
        }}
      />

      {/* Dark overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[#050505]/80" />

      {/* Cinematic gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050505]/95 via-transparent to-[#050505]/95" />

      {/* Gold ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-gold/[0.06] blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">
            How It Works
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-tight !text-[#FFFFFF] sm:text-5xl">
            Your journey starts here.
          </h2>

          <p className="mx-auto mt-5 max-w-xl leading-7 !text-[#FFFFFF]">
            From your first step to managing your portfolio, THÉSOROS brings
            your wealth journey together in one refined environment.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="group relative overflow-hidden rounded-3xl border border-white/[0.09] bg-black/40 p-7 shadow-2xl backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-gold/30 hover:bg-gold/[0.04]"
            >
              {/* Hover glow */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gold/[0.07] opacity-0 blur-[70px] transition duration-500 group-hover:opacity-100" />

              <div className="relative">
                {/* Step number */}
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/20 bg-gold/10 text-sm font-bold text-gold transition duration-300 group-hover:scale-105">
                  {step.number}
                </div>

                {/* Title */}
                <h3 className="mt-7 text-lg font-bold !text-[#FFFFFF]">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="mt-3 text-sm leading-6 !text-[#FFFFFF]">
                  {step.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}