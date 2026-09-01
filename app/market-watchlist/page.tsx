

import { requireAuthenticatedPage } from "@/lib/auth/guards";
import DashboardNav from "@/components/dashboard/DashboardNav";
import MarketWatchlistClient from "@/components/market-watchlist/MarketWatchlistClient";

export default async function MarketWatchlistPage() {
  await requireAuthenticatedPage();

  return (
    <main className="min-h-screen bg-[#050505] !text-[#FFFFFF]">
      <div className="flex min-h-screen">
        <DashboardNav />

        <section className="min-w-0 flex-1">
          <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
            <MarketWatchlistClient />
          </div>
        </section>
      </div>
    </main>
  );
}

