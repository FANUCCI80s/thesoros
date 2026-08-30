"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type TransactionType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "TRADE"
  | "REFUND"
  | "ADJUSTMENT";

type TransactionStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "REVERSED";

type Transaction = {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: string;
  currency: string;
  description: string | null;
  reference: string | null;
  completedAt: string | null;
  createdAt: string;
  depositId: string | null;
  withdrawalId: string | null;
};

type FilterType = "ALL" | TransactionType;

const filters: Array<{
  value: FilterType;
  label: string;
}> = [
  {
    value: "ALL",
    label: "All",
  },
  {
    value: "DEPOSIT",
    label: "Deposits",
  },
  {
    value: "WITHDRAWAL",
    label: "Withdrawals",
  },
  {
    value: "TRADE",
    label: "Trades",
  },
  {
    value: "REFUND",
    label: "Refunds",
  },
  {
    value: "ADJUSTMENT",
    label: "Adjustments",
  },
];

function formatType(type: TransactionType) {
  switch (type) {
    case "DEPOSIT":
      return "Deposit";
    case "WITHDRAWAL":
      return "Withdrawal";
    case "TRADE":
      return "Trade";
    case "REFUND":
      return "Refund";
    case "ADJUSTMENT":
      return "Balance adjustment";
    default:
      return type;
  }
}

function formatStatus(status: TransactionStatus) {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "COMPLETED":
      return "Completed";
    case "FAILED":
      return "Failed";
    case "REVERSED":
      return "Reversed";
    default:
      return status;
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function getStatusClass(status: TransactionStatus) {
  switch (status) {
    case "COMPLETED":
      return "border-gold/20 bg-gold/10 text-gold-light";
    case "PENDING":
      return "border-yellow-400/20 bg-yellow-400/10 text-yellow-300";
    case "FAILED":
      return "border-red-400/20 bg-red-400/10 text-red-300";
    case "REVERSED":
      return "border-orange-400/20 bg-orange-400/10 text-orange-300";
    default:
      return "border-white/10 bg-white/[0.04] text-zinc-400";
  }
}

function getTypeIcon(type: TransactionType) {
  switch (type) {
    case "DEPOSIT":
      return "â†“";
    case "WITHDRAWAL":
      return "â†‘";
    case "TRADE":
      return "â†—";
    case "REFUND":
      return "â†©";
    case "ADJUSTMENT":
      return "â†”";
    default:
      return "â€¢";
  }
}

function getAmountClass(type: TransactionType) {
  if (
    type === "DEPOSIT" ||
    type === "REFUND" ||
    type === "ADJUSTMENT"
  ) {
    return "text-gold";
  }

  if (type === "WITHDRAWAL") {
    return "text-red-300";
  }

  return "text-white";
}

export default function TransactionsClient() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTransactions() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/transactions", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load transactions."
        );
      }

      setTransactions(
        Array.isArray(data.transactions)
          ? data.transactions
          : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load transactions."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    if (filter === "ALL") {
      return transactions;
    }

    return transactions.filter(
      (transaction) => transaction.type === filter
    );
  }, [transactions, filter]);

  return (
    <div className="min-h-screen bg-[#050505] !text-[#FFFFFF]">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#050505] lg:flex lg:flex-col">
          <div className="border-b border-white/10 p-5">
            <Link
              href="/dashboard"
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold/30 bg-gold/10">
                <img src="/branding/thesoros-logo.png" alt="THÉSOROS" className="h-8 w-auto object-contain" />
              </div>

              <div>
                <p className="font-bold tracking-tight">
                  Thesoros
                </p>

                <p className="text-xs !text-[#FFFFFF]">
                  Trading platform
                </p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:!text-[#FFFFFF]"
            >
              <span>âŒ‚</span>
              Dashboard
            </Link>

            <Link
              href="/trade"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:!text-[#FFFFFF]"
            >
              <span>â†—</span>
              Trade
            </Link>

            <Link
              href="/deposit"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:!text-[#FFFFFF]"
            >
              <span>â†“</span>
              Deposit
            </Link>

            <Link
              href="/withdraw"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:!text-[#FFFFFF]"
            >
              <span>â†‘</span>
              Withdraw
            </Link>

            <Link
              href="/transactions"
              className="flex items-center gap-3 rounded-xl bg-gold/10 px-4 py-3 text-sm font-bold text-gold"
            >
              <span>â†”</span>
              Transactions
            </Link>

            <div className="my-5 border-t border-white/10" />

            <Link
              href="/notifications"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:!text-[#FFFFFF]"
            >
              <span>â—</span>
              Notifications
            </Link>

            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:!text-[#FFFFFF]"
            >
              <span>âš™</span>
              Settings
            </Link>
          </nav>

          <div className="border-t border-white/10 p-4">
            <Link
              href="/dashboard"
              className="block rounded-xl border border-white/10 px-4 py-3 text-center text-sm text-zinc-400 transition hover:border-white/20 hover:!text-[#FFFFFF]"
            >
              Back to dashboard
            </Link>
          </div>
        </aside>

        {/* Main */}
        <section className="min-w-0 flex-1">

          {/* Mobile header */}
          <header className="border-b border-white/10 bg-[#050505] px-5 py-4 lg:hidden">
            <div className="flex items-center justify-between">
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
                className="text-sm text-zinc-500 hover:!text-[#FFFFFF]"
              >
                Dashboard
              </Link>
            </div>
          </header>

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">

            {/* Header */}
            <div className="mb-8">
              <p className="mb-2 text-sm font-bold text-gold">
                Account activity
              </p>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Transactions
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 !text-[#FFFFFF]">
                View your deposits, withdrawals, trades,
                refunds, and other account transactions.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-red-300">
                      Unable to load transactions
                    </p>

                    <p className="mt-1 text-sm !text-[#FFFFFF]">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={loadTransactions}
                    className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300 transition hover:border-white/20 hover:!text-[#FFFFFF]"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Filters */}
            <section className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-2">
              <div className="flex gap-1 overflow-x-auto">
                {filters.map((item) => {
                  const selected = filter === item.value;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setFilter(item.value)}
                      className={`shrink-0 rounded-xl px-4 py-2.5 text-sm transition ${
                        selected
                          ? "bg-gold/10 font-medium text-gold"
                          : "text-zinc-500 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Transactions */}
            <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">

              <div className="border-b border-white/10 px-6 py-5 sm:px-8">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <h2 className="font-bold">
                      Transaction history
                    </h2>

                    <p className="mt-1 text-xs !text-[#FFFFFF]">
                      {loading
                        ? "Loading..."
                        : `${filteredTransactions.length} transaction${
                            filteredTransactions.length === 1
                              ? ""
                              : "s"
                          }`}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={loadTransactions}
                    disabled={loading}
                    className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-zinc-400 transition hover:border-white/20 hover:!text-[#FFFFFF] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="px-6 py-16 text-center sm:px-8">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-gold" />

                  <p className="mt-4 text-sm !text-[#FFFFFF]">
                    Loading transaction history...
                  </p>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="px-6 py-16 text-center sm:px-8">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-xl !text-[#FFFFFF]">
                    â†”
                  </div>

                  <h3 className="mt-5 font-bold">
                    No transactions found
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 !text-[#FFFFFF]">
                    Your transaction history will appear here
                    after you make a deposit, withdrawal,
                    trade, or other account transaction.
                  </p>

                  <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                      href="/deposit"
                      className="rounded-xl bg-gold px-5 py-3 text-sm font-bold !text-[#FFFFFF] transition hover:bg-gold"
                    >
                      Make a deposit
                    </Link>

                    <Link
                      href="/withdraw"
                      className="rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-zinc-300 transition hover:border-white/20 hover:!text-[#FFFFFF]"
                    >
                      Request withdrawal
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider !text-[#FFFFFF]">
                          <th className="px-6 py-4 font-bold sm:px-8">
                            Transaction
                          </th>

                          <th className="px-6 py-4 font-bold">
                            Status
                          </th>

                          <th className="px-6 py-4 text-right font-bold">
                            Amount
                          </th>

                          <th className="px-6 py-4 text-right font-bold sm:px-8">
                            Date
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredTransactions.map((transaction) => (
                          <tr
                            key={transaction.id}
                            className="border-b border-white/[0.06] last:border-0"
                          >
                            <td className="px-6 py-5 sm:px-8">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-sm !text-[#FFFFFF]">
                                  {getTypeIcon(transaction.type)}
                                </div>

                                <div className="min-w-0">
                                  <p className="font-bold">
                                    {formatType(transaction.type)}
                                  </p>

                                  <p className="mt-1 max-w-sm truncate text-xs !text-[#FFFFFF]">
                                    {transaction.description ||
                                      transaction.reference ||
                                      "Account transaction"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-5">
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
                                  transaction.status
                                )}`}
                              >
                                {formatStatus(transaction.status)}
                              </span>
                            </td>

                            <td className="px-6 py-5 text-right">
                              <p
                                className={`font-medium ${getAmountClass(
                                  transaction.type
                                )}`}
                              >
                                {transaction.type === "WITHDRAWAL" ||
                                transaction.type === "TRADE"
                                  ? "-"
                                  : "+"}
                                $
                                {Number(transaction.amount).toLocaleString(
                                  "en-US",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )}
                              </p>

                              <p className="mt-1 text-xs !text-[#FFFFFF]">
                                {transaction.currency}
                              </p>
                            </td>

                            <td className="px-6 py-5 text-right sm:px-8">
                              <p className="text-sm !text-[#FFFFFF]">
                                {formatDate(transaction.createdAt)}
                              </p>

                              {transaction.reference && (
                                <p className="mt-1 max-w-40 truncate text-xs !text-[#FFFFFF]">
                                  Ref: {transaction.reference}
                                </p>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="divide-y divide-white/[0.06] md:hidden">
                    {filteredTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-sm !text-[#FFFFFF]">
                              {getTypeIcon(transaction.type)}
                            </div>

                            <div className="min-w-0">
                              <p className="font-bold">
                                {formatType(transaction.type)}
                              </p>

                              <p className="mt-1 truncate text-xs !text-[#FFFFFF]">
                                {transaction.description ||
                                  transaction.reference ||
                                  "Account transaction"}
                              </p>
                            </div>
                          </div>

                          <p
                            className={`shrink-0 font-medium ${getAmountClass(
                              transaction.type
                            )}`}
                          >
                            {transaction.type === "WITHDRAWAL" ||
                            transaction.type === "TRADE"
                              ? "-"
                              : "+"}
                            $
                            {Number(transaction.amount).toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </p>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
                              transaction.status
                            )}`}
                          >
                            {formatStatus(transaction.status)}
                          </span>

                          <span className="text-xs !text-[#FFFFFF]">
                            {formatDate(transaction.createdAt)}
                          </span>
                        </div>

                        {transaction.reference && (
                          <p className="mt-3 text-xs !text-[#FFFFFF]">
                            Reference: {transaction.reference}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}
