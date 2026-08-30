import Link from "next/link";
import { requireAuthenticatedPage } from "@/lib/auth/guards";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
const user = await requireAuthenticatedPage();

const firstName = user.firstName || "Trader";

// Load the exact same balance record used by
// the admin balance management system.
const balance = await prisma.balance.findUnique({
where: {
userId: user.id,
},
select: {
available: true,
locked: true,
updatedAt: true,
},
});

const availableBalance = balance?.available ?? 0;
const lockedBalance = balance?.locked ?? 0;

const availableBalanceNumber = Number(availableBalance);
const lockedBalanceNumber = Number(lockedBalance);

const totalAccountValue =
availableBalanceNumber + lockedBalanceNumber;

return ( <main className="min-h-screen bg-[#050505] !text-[#FFFFFF]">
{/* Responsive Navigation */} <DashboardNav />


  <div className="flex min-h-screen">
    {/* Main */}
    <section className="min-w-0 flex-1">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        {/* Welcome */}
        <div className="mb-8">
          <p className="text-sm font-bold text-gold">
            Account overview
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome back, {firstName}
          </h1>

          <p className="mt-2 text-sm !text-[#FFFFFF]">
            Monitor your portfolio, manage funds,
            and access the markets.
          </p>
        </div>

        {/* Balance cards */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* Available Balance */}
          <div className="rounded-3xl border border-gold/20 bg-gold/[0.06] p-6">
            <p className="text-sm !text-[#FFFFFF]">
              Available balance
            </p>

            <p className="mt-3 text-3xl font-bold tracking-tight">
              $
              {availableBalanceNumber.toLocaleString(
                "en-US",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </p>

            <p className="mt-2 text-xs !text-[#FFFFFF]">
              Available for trading and withdrawals
            </p>
          </div>

          {/* Portfolio Value */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm !text-[#FFFFFF]">
              Portfolio value
            </p>

            <p className="mt-3 text-3xl font-bold tracking-tight">
              $
              {totalAccountValue.toLocaleString(
                "en-US",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </p>

            <p className="mt-2 text-xs !text-[#FFFFFF]">
              Current value of your holdings
            </p>
          </div>

          {/* Active Trades */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm !text-[#FFFFFF]">
              Active trades
            </p>

            <p className="mt-3 text-3xl font-bold tracking-tight">
              0
            </p>

            <p className="mt-2 text-xs !text-[#FFFFFF]">
              Currently open positions
            </p>
          </div>

          {/* Total P/L */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm !text-[#FFFFFF]">
              Total profit/loss
            </p>

            <p className="mt-3 text-3xl font-bold tracking-tight">
              $0.00
            </p>

            <p className="mt-2 text-xs !text-[#FFFFFF]">
              Overall trading performance
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-8">
          <div className="mb-4">
            <p className="text-sm !text-[#FFFFFF]">
              Quick actions
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Manage your account
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Link
              href="/deposit"
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-gold/30 hover:bg-gold/[0.05]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold">
                ↓
              </div>

              <h3 className="mt-4 font-bold">
                Deposit funds
              </h3>

              <p className="mt-1 text-sm !text-[#FFFFFF]">
                Add funds to your trading account.
              </p>

              <span className="mt-4 inline-block text-sm text-gold">
                Make a deposit →
              </span>
            </Link>

            <Link
              href="/withdraw"
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-gold/30 hover:bg-gold/[0.05]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.05] !text-[#FFFFFF]">
                ↑
              </div>

              <h3 className="mt-4 font-bold">
                Withdraw funds
              </h3>

              <p className="mt-1 text-sm !text-[#FFFFFF]">
                Request a withdrawal from your account.
              </p>

              <span className="mt-4 inline-block text-sm text-gold">
                Request withdrawal →
              </span>
            </Link>

            {/* Market Watchlist */}
            <Link
              href="/market-watchlist"
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-gold/30 hover:bg-gold/[0.05]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.05] !text-[#FFFFFF]">
                ↗
              </div>

              <h3 className="mt-4 font-bold">
                Market Watchlist
              </h3>

              <p className="mt-1 text-sm !text-[#FFFFFF]">
                Track cryptocurrency, forex, and stock
                markets.
              </p>

              <span className="mt-4 inline-block text-sm text-gold">
                View markets →
              </span>
            </Link>

            <Link
              href="/transactions"
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-gold/30 hover:bg-gold/[0.05]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.05] !text-[#FFFFFF]">
                ↔
              </div>

              <h3 className="mt-4 font-bold">
                Transactions
              </h3>

              <p className="mt-1 text-sm !text-[#FFFFFF]">
                Review your deposits, withdrawals,
                and trades.
              </p>

              <span className="mt-4 inline-block text-sm text-gold">
                View transactions →
              </span>
            </Link>
          </div>
        </div>

        {/* Portfolio section */}
        <div className="mt-8 grid gap-6 xl:grid-cols-3">
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 xl:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm !text-[#FFFFFF]">
                  Portfolio
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Your holdings
                </h2>
              </div>

              <Link
                href="/market-watchlist"
                className="text-sm text-gold hover:text-gold-light"
              >
                Markets →
              </Link>
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-black/20 p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.05] !text-[#FFFFFF]">
                +
              </div>

              <h3 className="mt-4 font-bold">
                No holdings yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 !text-[#FFFFFF]">
                Once you start investing, your
                cryptocurrency, forex, and stock
                positions will appear here.
              </p>

              <Link
                href="/market-watchlist"
                className="mt-5 inline-block rounded-xl bg-gold px-5 py-3 text-sm font-bold !text-[#FFFFFF] transition hover:bg-gold"
              >
                Explore markets
              </Link>
            </div>
          </section>

          {/* Account status */}
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm !text-[#FFFFFF]">
              Account
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Account status
            </h2>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4">
                <div>
                  <p className="text-sm font-bold">
                    Email
                  </p>

                  <p className="mt-1 text-xs !text-[#FFFFFF]">
                    {user.email}
                  </p>
                </div>

                <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-bold text-gold">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4">
                <div>
                  <p className="text-sm font-bold">
                    KYC
                  </p>

                  <p className="mt-1 text-xs !text-[#FFFFFF]">
                    Identity verification
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    user.kyc?.status === "APPROVED"
                      ? "bg-gold/10 text-gold"
                      : "bg-yellow-400/10 text-yellow-400"
                  }`}
                >
                  {user.kyc?.status === "APPROVED"
                    ? "Approved"
                    : "Pending"}
                </span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-bold">
                  Market access
                </p>

                <p className="mt-1 text-xs leading-5 !text-[#FFFFFF]">
                  Monitor cryptocurrency, forex, and
                  stock markets from your watchlist.
                </p>

                <Link
                  href="/trade"
                  className="mt-4 inline-block text-sm text-gold hover:text-gold-light"
                >
                  View market watchlist →
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* Recent activity */}
        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm !text-[#FFFFFF]">
                Activity
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Recent activity
              </h2>
            </div>

            <Link
              href="/transactions"
              className="text-sm text-gold hover:text-gold-light"
            >
              View all →
            </Link>
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center">
            <p className="text-sm !text-[#FFFFFF]">
              No recent activity
            </p>

            <p className="mt-1 text-xs !text-[#FFFFFF]">
              Your latest account activity will appear
              here.
            </p>
          </div>
        </section>
      </div>
    </section>
  </div>
</main>


);
}

