"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

/* =========================================================
   TYPES
========================================================= */

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
  amount: string | number;
  currency: string;
  description: string | null;
  reference: string | null;
  createdAt: string;
  completedAt: string | null;

  deposit?: {
    id: string;
    method: string;
  } | null;

  withdrawal?: {
    id: string;
    method: string;
  } | null;

  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  };
};

/*
 * Deposit request returned from /api/admin/deposit.
 *
 * We intentionally allow a few optional fields because your
 * deposit API may return different shapes depending on the
 * endpoint implementation.
 */
type DepositRequest = {
  id: string;

  status?: string | null;

  amount: string | number;

  currency?: string | null;

  method?: string | null;

  reference?: string | null;

  description?: string | null;

  createdAt: string;

  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  } | null;

  transaction?: {
    id: string;
    type?: string;
    status?: string;
    amount?: string | number;
    currency?: string;
  } | null;
};

type TransactionApiResponse = {
  transactions?: Transaction[];
  error?: string;
};

type DepositApiResponse = {
  deposits?: DepositRequest[];
  depositRequests?: DepositRequest[];
  requests?: DepositRequest[];
  data?: DepositRequest[];
  transactions?: DepositRequest[];
  error?: string;
};

/* =========================================================
   FILTER OPTIONS
========================================================= */

const TYPE_OPTIONS: Array<{
  value: "" | TransactionType;
  label: string;
}> = [
  {
    value: "",
    label: "All transaction types",
  },
  {
    value: "DEPOSIT",
    label: "Deposit",
  },
  {
    value: "WITHDRAWAL",
    label: "Withdrawal",
  },
  {
    value: "TRADE",
    label: "Trade",
  },
  {
    value: "REFUND",
    label: "Refund",
  },
  {
    value: "ADJUSTMENT",
    label: "Adjustment",
  },
];

const STATUS_OPTIONS: Array<{
  value: "" | TransactionStatus;
  label: string;
}> = [
  {
    value: "",
    label: "All statuses",
  },
  {
    value: "PENDING",
    label: "Pending",
  },
  {
    value: "COMPLETED",
    label: "Completed",
  },
  {
    value: "FAILED",
    label: "Failed",
  },
  {
    value: "REVERSED",
    label: "Reversed",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function formatAmount(
  amount: string | number,
  currency: string
): string {
  const numericAmount =
    typeof amount === "number" ? amount : Number(amount);

  const safeCurrency = currency || "USD";

  if (!Number.isFinite(numericAmount)) {
    return `${safeCurrency} 0.00`;
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: safeCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(numericAmount);
  } catch {
    return `${safeCurrency} ${numericAmount.toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 8,
      }
    )}`;
  }
}

function formatDate(date: string): string {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTypeLabel(type: TransactionType): string {
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
      return "Adjustment";

    default:
      return type;
  }
}

function getStatusLabel(status: TransactionStatus): string {
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

function getMethodLabel(
  method: string | null | undefined
): string {
  if (!method) {
    return "—";
  }

  switch (method) {
    case "BANK_TRANSFER":
      return "Bank Transfer";

    case "CARD":
    case "CREDIT_CARD":
    case "DEBIT_CARD":
      return "Card";

    case "CRYPTO":
    case "CRYPTOCURRENCY":
    case "CRYPTO_CURRENCY":
      return "Cryptocurrency";

    case "CASH_APP":
    case "CASHAPP":
      return "Cash App";

    case "PAYPAL":
      return "PayPal";

    case "ZELLE":
      return "Zelle";

    case "VENMO":
      return "Venmo";

    default:
      return method
        .toLowerCase()
        .split("_")
        .map(
          (word) =>
            word.charAt(0).toUpperCase() +
            word.slice(1)
        )
        .join(" ");
  }
}

function getTransactionMethod(
  transaction: Transaction
): string {
  if (transaction.type === "DEPOSIT") {
    return getMethodLabel(
      transaction.deposit?.method
    );
  }

  if (transaction.type === "WITHDRAWAL") {
    return getMethodLabel(
      transaction.withdrawal?.method
    );
  }

  return "—";
}

function getStatusClass(
  status: TransactionStatus
): string {
  switch (status) {
    case "COMPLETED":
      return "border-gold/20 bg-gold/10 text-gold";

    case "PENDING":
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";

    case "FAILED":
      return "border-red-500/20 bg-red-500/10 text-red-400";

    case "REVERSED":
      return "border-orange-500/20 bg-orange-500/10 text-orange-400";

    default:
      return "border-white/10 bg-white/5 text-gray-300";
  }
}

function getTypeClass(
  type: TransactionType
): string {
  switch (type) {
    case "DEPOSIT":
      return "text-gold";

    case "WITHDRAWAL":
      return "text-red-400";

    case "TRADE":
      return "text-blue-400";

    case "REFUND":
      return "text-purple-400";

    case "ADJUSTMENT":
      return "text-yellow-400";

    default:
      return "text-gray-300";
  }
}

/* =========================================================
   PENDING DEPOSIT CARD
========================================================= */

function PendingDepositCard({
  deposit,
}: {
  deposit: DepositRequest;
}) {
  const user = deposit.user;

  const amount = deposit.amount;

  const currency =
    deposit.currency ||
    deposit.transaction?.currency ||
    "USD";

  return (
    <div className="rounded-2xl border border-gold/20 bg-gold/[0.035] p-5 transition hover:border-gold/30">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        {/* Information */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-xs font-bold text-gold">
              DEPOSIT REQUEST
            </span>

            <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-400">
              PENDING REVIEW
            </span>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* User */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider !text-[#FFFFFF]">
                User
              </p>

              {user ? (
                <>
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="mt-1 block text-sm font-bold !text-[#FFFFFF] hover:text-gold"
                  >
                    {user.firstName}{" "}
                    {user.lastName}
                  </Link>

                  <p className="mt-1 truncate text-xs !text-[#FFFFFF]">
                    {user.email}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm !text-[#FFFFFF]">
                  User information unavailable
                </p>
              )}
            </div>

            {/* Amount */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider !text-[#FFFFFF]">
                Amount
              </p>

              <p className="mt-1 text-lg font-bold text-gold">
                {formatAmount(amount, currency)}
              </p>
            </div>

            {/* Method */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider !text-[#FFFFFF]">
                Method
              </p>

              <p className="mt-1 text-sm font-bold !text-[#FFFFFF]">
                {getMethodLabel(deposit.method)}
              </p>
            </div>

            {/* Submitted */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider !text-[#FFFFFF]">
                Submitted
              </p>

              <p className="mt-1 text-sm !text-[#FFFFFF]">
                {formatDate(deposit.createdAt)}
              </p>
            </div>
          </div>

          {(deposit.reference ||
            deposit.description) && (
            <div className="mt-5 rounded-xl border border-white/5 bg-black/20 p-3">
              {deposit.reference && (
                <p className="text-xs !text-[#FFFFFF]">
                  Reference:{" "}
                  <span className="font-bold !text-[#FFFFFF]">
                    {deposit.reference}
                  </span>
                </p>
              )}

              {deposit.description && (
                <p className="mt-1 text-xs !text-[#FFFFFF]">
                  {deposit.description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row xl:flex-col">
          <Link
            href={`/admin/deposits/${deposit.id}`}
            className="inline-flex min-w-[175px] items-center justify-center rounded-xl bg-gold px-5 py-3 text-sm font-bold !text-[#FFFFFF] transition hover:bg-gold"
          >
            Review Deposit
          </Link>

          <Link
            href={`/admin/deposits/${deposit.id}`}
            className="inline-flex min-w-[175px] items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-gray-300 transition hover:bg-white/10 hover:!text-[#FFFFFF]"
          >
            View Deposit
          </Link>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PENDING WITHDRAWAL CARD
========================================================= */

function PendingWithdrawalCard({
  transaction,
}: {
  transaction: Transaction;
}) {
  return (
    <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.035] p-5 transition hover:border-red-500/30">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400">
              WITHDRAWAL REQUEST
            </span>

            <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-400">
              PENDING REVIEW
            </span>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* User */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider !text-[#FFFFFF]">
                User
              </p>

              <Link
                href={`/admin/users/${transaction.user.id}`}
                className="mt-1 block text-sm font-bold !text-[#FFFFFF] hover:text-gold"
              >
                {transaction.user.firstName}{" "}
                {transaction.user.lastName}
              </Link>

              <p className="mt-1 truncate text-xs !text-[#FFFFFF]">
                {transaction.user.email}
              </p>
            </div>

            {/* Amount */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider !text-[#FFFFFF]">
                Amount
              </p>

              <p className="mt-1 text-lg font-bold text-red-400">
                {formatAmount(
                  transaction.amount,
                  transaction.currency
                )}
              </p>
            </div>

            {/* Method */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider !text-[#FFFFFF]">
                Method
              </p>

              <p className="mt-1 text-sm font-bold !text-[#FFFFFF]">
                {getTransactionMethod(transaction)}
              </p>
            </div>

            {/* Submitted */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider !text-[#FFFFFF]">
                Submitted
              </p>

              <p className="mt-1 text-sm !text-[#FFFFFF]">
                {formatDate(transaction.createdAt)}
              </p>
            </div>
          </div>

          {(transaction.reference ||
            transaction.description) && (
            <div className="mt-5 rounded-xl border border-white/5 bg-black/20 p-3">
              {transaction.reference && (
                <p className="text-xs !text-[#FFFFFF]">
                  Reference:{" "}
                  <span className="font-bold !text-[#FFFFFF]">
                    {transaction.reference}
                  </span>
                </p>
              )}

              {transaction.description && (
                <p className="mt-1 text-xs !text-[#FFFFFF]">
                  {transaction.description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row xl:flex-col">
          <Link
            href={`/admin/transactions/${transaction.id}`}
            className="inline-flex min-w-[175px] items-center justify-center rounded-xl bg-red-500 px-5 py-3 text-sm font-bold !text-[#FFFFFF] transition hover:bg-red-400"
          >
            Review Withdrawal
          </Link>

          <Link
            href={`/admin/transactions/${transaction.id}`}
            className="inline-flex min-w-[175px] items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-gray-300 transition hover:bg-white/10 hover:!text-[#FFFFFF]"
          >
            View Withdrawal
          </Link>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PENDING DEPOSIT SECTION
========================================================= */

function PendingDepositSection({
  deposits,
}: {
  deposits: DepositRequest[];
}) {
  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-gold/20 bg-white/[0.02]">
      <div className="border-b border-gold/10 bg-gold/[0.035] px-5 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-xl text-gold">
              ↓
            </div>

            <div>
              <h2 className="text-lg font-bold !text-[#FFFFFF]">
                Pending Deposit Requests
              </h2>

              <p className="mt-1 text-sm !text-[#FFFFFF]">
                Deposits submitted by users that require
                admin review and approval.
              </p>
            </div>
          </div>

          <div className="inline-flex w-fit rounded-full border border-gold/20 bg-gold/10 px-3 py-1.5 text-xs font-bold text-gold">
            {deposits.length}{" "}
            {deposits.length === 1
              ? "request"
              : "requests"}
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        {deposits.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 px-5 py-10 text-center">
            <div className="text-sm font-bold !text-[#FFFFFF]">
              No pending deposit requests
            </div>

            <p className="mt-1 text-xs !text-[#FFFFFF]">
              New deposit requests will appear here.
            </p>
          </div>
        ) : (
          deposits.map((deposit) => (
            <PendingDepositCard
              key={deposit.id}
              deposit={deposit}
            />
          ))
        )}
      </div>
    </section>
  );
}

/* =========================================================
   PENDING WITHDRAWAL SECTION
========================================================= */

function PendingWithdrawalSection({
  withdrawals,
}: {
  withdrawals: Transaction[];
}) {
  return (
    <section className="mb-8 overflow-hidden rounded-2xl border border-red-500/20 bg-white/[0.02]">
      <div className="border-b border-red-500/10 bg-red-500/[0.035] px-5 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-xl text-red-400">
              ↑
            </div>

            <div>
              <h2 className="text-lg font-bold !text-[#FFFFFF]">
                Pending Withdrawal Requests
              </h2>

              <p className="mt-1 text-sm !text-[#FFFFFF]">
                Withdrawals submitted by users that require
                admin review and approval.
              </p>
            </div>
          </div>

          <div className="inline-flex w-fit rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400">
            {withdrawals.length}{" "}
            {withdrawals.length === 1
              ? "request"
              : "requests"}
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        {withdrawals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 px-5 py-10 text-center">
            <div className="text-sm font-bold !text-[#FFFFFF]">
              No pending withdrawal requests
            </div>

            <p className="mt-1 text-xs !text-[#FFFFFF]">
              New withdrawal requests will appear here.
            </p>
          </div>
        ) : (
          withdrawals.map((transaction) => (
            <PendingWithdrawalCard
              key={transaction.id}
              transaction={transaction}
            />
          ))
        )}
      </div>
    </section>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<
    Transaction[]
  >([]);

  const [pendingDeposits, setPendingDeposits] =
    useState<DepositRequest[]>([]);

  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] = useState<
    "" | TransactionType
  >("");

  const [statusFilter, setStatusFilter] = useState<
    "" | TransactionStatus
  >("");

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  const [depositError, setDepositError] =
    useState("");

  /* =======================================================
     LOAD NORMAL TRANSACTIONS
  ======================================================= */

  const loadTransactions = useCallback(
    async (showRefreshState = false) => {
      try {
        if (showRefreshState) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const params = new URLSearchParams();

        if (search.trim()) {
          params.set(
            "search",
            search.trim()
          );
        }

        if (typeFilter) {
          params.set(
            "type",
            typeFilter
          );
        }

        if (statusFilter) {
          params.set(
            "status",
            statusFilter
          );
        }

        const queryString =
          params.toString();

        const response = await fetch(
          `/api/admin/transactions${
            queryString
              ? `?${queryString}`
              : ""
          }`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const data: TransactionApiResponse =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load transactions."
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
        setRefreshing(false);
      }
    },
    [
      search,
      typeFilter,
      statusFilter,
    ]
  );

  /* =======================================================
     LOAD PENDING DEPOSITS
     
     IMPORTANT:
     This is separate from /api/admin/transactions.
     
     It uses the new:
     
     /api/admin/deposit
  ======================================================= */

  const loadPendingDeposits =
    useCallback(
      async (
        showRefreshState = false
      ) => {
        try {
          if (showRefreshState) {
            setRefreshing(true);
          }

          setDepositError("");

          const response = await fetch(
            "/api/admin/deposit?status=PENDING",
            {
              method: "GET",
              credentials: "include",
              cache: "no-store",
            }
          );

          const data: DepositApiResponse =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.error ||
                "Unable to load pending deposit requests."
            );
          }

          /*
           * Your API might return:
           *
           * {
           *   deposits: [...]
           * }
           *
           * or:
           *
           * {
           *   depositRequests: [...]
           * }
           *
           * or:
           *
           * {
           *   requests: [...]
           * }
           *
           * This handles all of them.
           */
          const deposits =
            data.deposits ||
            data.depositRequests ||
            data.requests ||
            data.data ||
            data.transactions ||
            [];

          setPendingDeposits(
            Array.isArray(deposits)
              ? deposits
              : []
          );
        } catch (err) {
          setDepositError(
            err instanceof Error
              ? err.message
              : "Unable to load pending deposit requests."
          );

          setPendingDeposits([]);
        } finally {
          if (showRefreshState) {
            setRefreshing(false);
          }
        }
      },
      []
    );

  /* =======================================================
     LOAD EVERYTHING
  ======================================================= */

  const loadAll = useCallback(
    async (showRefreshState = false) => {
      await Promise.all([
        loadTransactions(showRefreshState),
        loadPendingDeposits(
          showRefreshState
        ),
      ]);
    },
    [
      loadTransactions,
      loadPendingDeposits,
    ]
  );

  /* =======================================================
     INITIAL / FILTER LOAD
  ======================================================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAll();
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [loadAll]);

  /* =======================================================
     FILTER TRANSACTIONS
  ======================================================= */

  const filteredTransactions =
    useMemo(() => {
      return transactions.filter(
        (transaction) => {
          const searchValue =
            search
              .trim()
              .toLowerCase();

          if (!searchValue) {
            return true;
          }

          const userName =
            `${transaction.user.firstName} ${transaction.user.lastName}`.toLowerCase();

          const email =
            transaction.user.email.toLowerCase();

          const reference =
            transaction.reference?.toLowerCase() ||
            "";

          const transactionId =
            transaction.id.toLowerCase();

          const description =
            transaction.description?.toLowerCase() ||
            "";

          const method =
            getTransactionMethod(
              transaction
            ).toLowerCase();

          return (
            userName.includes(
              searchValue
            ) ||
            email.includes(
              searchValue
            ) ||
            reference.includes(
              searchValue
            ) ||
            transactionId.includes(
              searchValue
            ) ||
            description.includes(
              searchValue
            ) ||
            method.includes(
              searchValue
            )
          );
        }
      );
    }, [
      transactions,
      search,
    ]);

  /* =======================================================
     PENDING WITHDRAWALS
  ======================================================= */

  const pendingWithdrawals =
    useMemo(() => {
      return filteredTransactions.filter(
        (transaction) =>
          transaction.type ===
            "WITHDRAWAL" &&
          transaction.status ===
            "PENDING"
      );
    }, [filteredTransactions]);

  /* =======================================================
     PENDING TRANSACTIONS
  ======================================================= */

  const pendingTransactions =
    useMemo(() => {
      return filteredTransactions.filter(
        (transaction) =>
          transaction.status ===
          "PENDING"
      );
    }, [filteredTransactions]);

  /* =======================================================
     TOTAL TRANSACTION AMOUNT
  ======================================================= */

  const totalAmount =
    useMemo(() => {
      return filteredTransactions.reduce(
        (total, transaction) => {
          const value = Number(
            transaction.amount
          );

          return Number.isFinite(
            value
          )
            ? total + value
            : total;
        },
        0
      );
    }, [filteredTransactions]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#050505] !text-[#FFFFFF]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-gold">
              Admin Panel
            </p>

            <h1 className="text-3xl font-bold tracking-tight">
              Transactions
            </h1>

            <p className="mt-2 max-w-2xl text-sm !text-[#FFFFFF]">
              Review incoming deposits, withdrawal
              requests, and monitor all platform
              transactions.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadAll(true)
            }
            disabled={
              loading ||
              refreshing
            }
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold !text-[#FFFFFF] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm !text-[#FFFFFF]">
              Transactions
            </p>

            <p className="mt-2 text-2xl font-bold">
              {filteredTransactions.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm !text-[#FFFFFF]">
              Total Amount
            </p>

            <p className="mt-2 text-2xl font-bold text-gold">
              {formatAmount(
                totalAmount,
                "USD"
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-500/10 bg-yellow-500/[0.03] p-5">
            <p className="text-sm !text-[#FFFFFF]">
              Pending Reviews
            </p>

            <p className="mt-2 text-2xl font-bold text-yellow-400">
              {pendingTransactions.length +
                pendingDeposits.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gold/10 bg-gold/[0.03] p-5">
            <p className="text-sm !text-[#FFFFFF]">
              Pending Deposits
            </p>

            <p className="mt-2 text-2xl font-bold text-gold">
              {pendingDeposits.length}
            </p>
          </div>
        </div>

        {/* =================================================
            GENERAL ERROR
        ================================================= */}

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* =================================================
            DEPOSIT API ERROR
        ================================================= */}

        {depositError && (
          <div className="mb-6 rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-sm text-orange-400">
            <p className="font-bold">
              Pending deposit requests could not be
              loaded.
            </p>

            <p className="mt-1 text-xs text-orange-300/70">
              {depositError}
            </p>
          </div>
        )}

        {/* =================================================
            PENDING DEPOSITS
        ================================================= */}

        {!loading && (
          <PendingDepositSection
            deposits={pendingDeposits}
          />
        )}

        {/* =================================================
            PENDING WITHDRAWALS
        ================================================= */}

        {!loading && (
          <PendingWithdrawalSection
            withdrawals={
              pendingWithdrawals
            }
          />
        )}

        {/* =================================================
            SEARCH / FILTERS
        ================================================= */}

        <section className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-4">
            <h2 className="text-base font-bold !text-[#FFFFFF]">
              Transaction History
            </h2>

            <p className="mt-1 text-xs !text-[#FFFFFF]">
              Search and filter completed, failed,
              reversed, pending, and other platform
              transactions.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px_auto]">
            {/* Search */}
            <div>
              <label
                htmlFor="transaction-search"
                className="mb-2 block text-sm font-bold !text-[#FFFFFF]"
              >
                Search transactions
              </label>

              <input
                id="transaction-search"
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search user, email, reference, ID..."
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:!text-[#FFFFFF] focus:border-gold/50"
              />
            </div>

            {/* Type */}
            <div>
              <label
                htmlFor="transaction-type"
                className="mb-2 block text-sm font-bold !text-[#FFFFFF]"
              >
                Type
              </label>

              <select
                id="transaction-type"
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(
                    event.target
                      .value as
                      | ""
                      | TransactionType
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm !text-[#FFFFFF] outline-none focus:border-gold/50"
              >
                {TYPE_OPTIONS.map(
                  (option) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                      className="bg-[#050505]"
                    >
                      {
                        option.label
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="transaction-status"
                className="mb-2 block text-sm font-bold !text-[#FFFFFF]"
              >
                Status
              </label>

              <select
                id="transaction-status"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target
                      .value as
                      | ""
                      | TransactionStatus
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm !text-[#FFFFFF] outline-none focus:border-gold/50"
              >
                {STATUS_OPTIONS.map(
                  (option) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                      className="bg-[#050505]"
                    >
                      {
                        option.label
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Clear */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setTypeFilter("");
                  setStatusFilter("");
                }}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-gray-300 transition hover:bg-white/10 hover:!text-[#FFFFFF] lg:w-auto"
              >
                Clear
              </button>
            </div>
          </div>
        </section>

        {/* =================================================
            TRANSACTION HISTORY
        ================================================= */}

        {loading ? (
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-16 text-center">
            <div className="text-sm !text-[#FFFFFF]">
              Loading transactions...
            </div>
          </section>
        ) : (
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            {/* Table Header */}
            <div className="border-b border-white/10 bg-white/[0.02] px-5 py-5">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold !text-[#FFFFFF]">
                    All Transactions
                  </h2>

                  <p className="mt-1 text-sm !text-[#FFFFFF]">
                    Complete transaction history for the
                    platform.
                  </p>
                </div>

                <div className="text-sm !text-[#FFFFFF]">
                  {
                    filteredTransactions.length
                  }{" "}
                  {filteredTransactions.length ===
                  1
                    ? "transaction"
                    : "transactions"}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[1100px] w-full">
                <thead className="border-b border-white/10 bg-white/[0.02]">
                  <tr className="text-left text-xs uppercase tracking-wider !text-[#FFFFFF]">
                    <th className="px-5 py-4 font-bold">
                      Transaction
                    </th>

                    <th className="px-5 py-4 font-bold">
                      User
                    </th>

                    <th className="px-5 py-4 font-bold">
                      Type
                    </th>

                    <th className="px-5 py-4 font-bold">
                      Method
                    </th>

                    <th className="px-5 py-4 font-bold">
                      Amount
                    </th>

                    <th className="px-5 py-4 font-bold">
                      Status
                    </th>

                    <th className="px-5 py-4 font-bold">
                      Date
                    </th>

                    <th className="px-5 py-4 text-right font-bold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {filteredTransactions.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-5 py-16 text-center"
                      >
                        <div className="text-sm font-bold !text-[#FFFFFF]">
                          No transactions found
                        </div>

                        <div className="mt-1 text-sm !text-[#FFFFFF]">
                          Try changing your search or
                          filters.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map(
                      (transaction) => {
                        const isReviewable =
                          transaction.status ===
                            "PENDING" &&
                          (transaction.type ===
                            "DEPOSIT" ||
                            transaction.type ===
                              "WITHDRAWAL");

                        const isDeposit =
                          transaction.type ===
                          "DEPOSIT";

                        return (
                          <tr
                            key={
                              transaction.id
                            }
                            className="transition hover:bg-white/[0.02]"
                          >
                            {/* Transaction */}
                            <td className="px-5 py-5">
                              <div className="max-w-[190px]">
                                <p className="truncate text-sm font-bold !text-[#FFFFFF]">
                                  {transaction.description ||
                                    getTypeLabel(
                                      transaction.type
                                    )}
                                </p>

                                <p className="mt-1 truncate text-xs !text-[#FFFFFF]">
                                  {transaction.reference ||
                                    transaction.id}
                                </p>
                              </div>
                            </td>

                            {/* User */}
                            <td className="px-5 py-5">
                              <Link
                                href={`/admin/users/${transaction.user.id}`}
                                className="block min-w-[180px] transition hover:text-gold"
                              >
                                <p className="text-sm font-bold !text-[#FFFFFF]">
                                  {
                                    transaction
                                      .user
                                      .firstName
                                  }{" "}
                                  {
                                    transaction
                                      .user
                                      .lastName
                                  }
                                </p>

                                <p className="mt-1 text-xs !text-[#FFFFFF]">
                                  {
                                    transaction
                                      .user
                                      .email
                                  }
                                </p>
                              </Link>
                            </td>

                            {/* Type */}
                            <td className="px-5 py-5">
                              <span
                                className={`text-sm font-semibold ${getTypeClass(
                                  transaction.type
                                )}`}
                              >
                                {getTypeLabel(
                                  transaction.type
                                )}
                              </span>
                            </td>

                            {/* Method */}
                            <td className="px-5 py-5">
                              <span className="text-sm !text-[#FFFFFF]">
                                {getTransactionMethod(
                                  transaction
                                )}
                              </span>
                            </td>

                            {/* Amount */}
                            <td className="px-5 py-5">
                              <span className="whitespace-nowrap text-sm font-bold !text-[#FFFFFF]">
                                {formatAmount(
                                  transaction.amount,
                                  transaction.currency
                                )}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="px-5 py-5">
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                                  transaction.status
                                )}`}
                              >
                                {getStatusLabel(
                                  transaction.status
                                )}
                              </span>
                            </td>

                            {/* Date */}
                            <td className="px-5 py-5">
                              <span className="whitespace-nowrap text-sm !text-[#FFFFFF]">
                                {formatDate(
                                  transaction.createdAt
                                )}
                              </span>
                            </td>

                            {/* Action */}
                            <td className="px-5 py-5 text-right">
                              {isReviewable ? (
                                <Link
                                  href={
                                    isDeposit
                                      ? `/admin/deposits/${transaction.deposit?.id || transaction.id}`
                                      : `/admin/transactions/${transaction.id}`
                                  }
                                  className={`inline-flex rounded-lg border px-3 py-2 text-xs font-bold transition ${
                                    isDeposit
                                      ? "border-gold/20 bg-gold/10 text-gold hover:bg-gold/20"
                                      : "border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                  }`}
                                >
                                  {isDeposit
                                    ? "Review Deposit"
                                    : "Review Withdrawal"}
                                </Link>
                              ) : (
                                <Link
                                  href={`/admin/transactions/${transaction.id}`}
                                  className="inline-flex rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-gray-300 transition hover:bg-white/10 hover:!text-[#FFFFFF]"
                                >
                                  View Details
                                </Link>
                              )}
                            </td>
                          </tr>
                        );
                      }
                    )
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
