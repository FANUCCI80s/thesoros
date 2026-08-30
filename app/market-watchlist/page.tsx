

import Link from "next/link";
import { requireAuthenticatedPage } from "@/lib/auth/guards";
import DashboardNav from "@/components/dashboard/DashboardNav";
import MarketWatchlistClient from "@/components/market-watchlist/MarketWatchlistClient";

export default async function MarketWatchlistPage() {
  const user = await requireAuthenticatedPage();

  const firstName = user.firstName || "Trader";

  return (
    <main className="min-h-screen bg-[#050505] !text-[#FFFFFF]">
      <div className="flex min-h-screen">
        <DashboardNav />

        <section className="min-w-0 flex-1">
          {/* Mobile Header */}
          <header className="border-b border-white/10 bg-[#050505] px-5 py-4 lg:hidden">
            <div className="flex items-center justify-between gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold/30 bg-gold/10">
                  <img src="/branding/thesoros-logo.png" alt="THÉSOROS" className="h-8 w-auto object-contain" />
                </div>

                <span className="font-bold">
                  Thesoros
                </span>
              </Link>

              <Link
                href="/dashboard"
                className="text-sm text-zinc-500 transition hover:!text-[#FFFFFF]"
              >
                Dashboard
              </Link>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
            {/* Page Header */}
            <div className="mb-8">
              <p className="text-sm font-bold text-gold">
                Live market overview
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Market Watchlist
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 !text-[#FFFFFF]">
                Welcome back, {firstName}. Monitor cryptocurrency,
                stock, and forex markets using live market data.
              </p>
            </div>

            <MarketWatchlistClient />
          </div>
        </section>
      </div>
    </main>
  );
}


