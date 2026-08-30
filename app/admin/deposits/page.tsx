"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type DepositStatus =
  | "PENDING"
  | "APPROVED"
  | "DECLINED";

type DepositMethod =
  | "BANK_TRANSFER"
  | "CARD"
  | "CRYPTOCURRENCY"
  | "CASH_APP"
  | "PAYPAL"
  | "ZELLE"
  | "VENMO";

type Deposit = {
  id: string;
  userId: string;
  method: DepositMethod;
  status: DepositStatus;
  amount: string | number;
  reference: string | null;
  notes: string | null;
  createdAt: string;
  reviewedAt: string | null;
  declineReason: string | null;

  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };

  transaction: {
    id: string;
    type: string;
    status: string;
    amount: string | number;
    currency: string;
    reference: string | null;
    createdAt: string;
  } | null;
};

type ApiResponse = {
  success?: boolean;
  deposits?: Deposit[];
  count?: number;
  error?: string;
  message?: string;
};

function formatAmount(
  amount: string | number
): string {
  const numeric =
    typeof amount === "number"
      ? amount
      : Number(amount);

  if (!Number.isFinite(numeric)) {
    return "$0.00";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  }).format(numeric);
}

function formatDate(date: string) {
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

function methodLabel(
  method: DepositMethod
) {
  switch (method) {
    case "BANK_TRANSFER":
      return "Bank Transfer";

    case "CARD":
      return "Card";

    case "CRYPTOCURRENCY":
      return "Cryptocurrency";

    case "CASH_APP":
      return "Cash App";

    case "PAYPAL":
      return "PayPal";

    case "ZELLE":
      return "Zelle";

    case "VENMO":
      return "Venmo";

    default:
      return method;
  }
}

function statusClass(
  status: DepositStatus
) {
  switch (status) {
    case "PENDING":
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";

    case "APPROVED":
      return "border-gold/20 bg-gold/10 text-gold";

    case "DECLINED":
      return "border-red-500/20 bg-red-500/10 text-red-400";

    default:
      return "border-white/10 bg-white/5 text-gray-400";
  }
}

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<
    Deposit[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [status, setStatus] =
    useState<"PENDING" | "APPROVED" | "DECLINED" | "ALL">(
      "PENDING"
    );

  const loadDeposits = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/admin/deposit?status=${status}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const data: ApiResponse =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              data.message ||
              "Unable to load deposits."
          );
        }

        setDeposits(data.deposits || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load deposits."
        );
      } finally {
        setLoading(false);
      }
    },
    [status]
  );

  useEffect(() => {
    loadDeposits();
  }, [loadDeposits]);

  return (
    <main className="min-h-screen bg-[#050505] !text-[#FFFFFF]">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-bold text-gold">
            Admin
          </p>

          <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Deposit Requests
              </h1>

              <p className="mt-2 text-sm !text-[#FFFFFF]">
                Review and approve or decline user deposit
                requests.
              </p>
            </div>

            <button
              type="button"
              onClick={loadDeposits}
              disabled={loading}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold !text-[#FFFFFF] transition hover:bg-white/10 disabled:opacity-50"
            >
              {loading
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">
            <p className="text-xs uppercase tracking-wider !text-[#FFFFFF]">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-400">
              {status === "PENDING"
                ? deposits.length
                : "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-gold/20 bg-gold/5 p-5">
            <p className="text-xs uppercase tracking-wider !text-[#FFFFFF]">
              Approved
            </p>

            <p className="mt-2 text-3xl font-bold text-gold">
              {status === "APPROVED"
                ? deposits.length
                : "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
            <p className="text-xs uppercase tracking-wider !text-[#FFFFFF]">
              Declined
            </p>

            <p className="mt-2 text-3xl font-bold text-red-400">
              {status === "DECLINED"
                ? deposits.length
                : "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-wider !text-[#FFFFFF]">
              Showing
            </p>

            <p className="mt-2 text-3xl font-bold">
              {deposits.length}
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {(
            [
              ["PENDING", "Pending"],
              ["APPROVED", "Approved"],
              ["DECLINED", "Declined"],
              ["ALL", "All Deposits"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                setStatus(value)
              }
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                status === value
                  ? "bg-gold text-white"
                  : "border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center !text-[#FFFFFF]">
            Loading deposit requests...
          </div>
        ) : deposits.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-2xl">
              ✓
            </div>

            <h2 className="mt-5 text-lg font-bold">
              No deposit requests found
            </h2>

            <p className="mt-2 text-sm !text-[#FFFFFF]">
              There are currently no deposits in the
              selected category.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="border-b border-white/10 bg-black/20">
                  <tr className="text-left text-xs uppercase tracking-wider !text-[#FFFFFF]">
                    <th className="px-5 py-4">
                      User
                    </th>

                    <th className="px-5 py-4">
                      Amount
                    </th>

                    <th className="px-5 py-4">
                      Method
                    </th>

                    <th className="px-5 py-4">
                      Reference
                    </th>

                    <th className="px-5 py-4">
                      Submitted
                    </th>

                    <th className="px-5 py-4">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {deposits.map((deposit) => (
                    <tr
                      key={deposit.id}
                      className="transition hover:bg-white/[0.025]"
                    >
                      <td className="px-5 py-5">
                        <div>
                          <p className="font-bold !text-[#FFFFFF]">
                            {deposit.user.firstName}{" "}
                            {deposit.user.lastName}
                          </p>

                          <p className="mt-1 text-xs !text-[#FFFFFF]">
                            {deposit.user.email}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <span className="font-bold !text-[#FFFFFF]">
                          {formatAmount(
                            deposit.amount
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-5 text-sm !text-[#FFFFFF]">
                        {methodLabel(
                          deposit.method
                        )}
                      </td>

                      <td className="px-5 py-5">
                        <span className="block max-w-[180px] truncate text-sm !text-[#FFFFFF]">
                          {deposit.reference ||
                            "—"}
                        </span>
                      </td>

                      <td className="px-5 py-5 text-sm !text-[#FFFFFF]">
                        {formatDate(
                          deposit.createdAt
                        )}
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                            deposit.status
                          )}`}
                        >
                          {deposit.status}
                        </span>
                      </td>

                      <td className="px-5 py-5 text-right">
                        <Link
                          href={`/admin/deposits/${deposit.id}`}
                          className="inline-flex rounded-xl bg-gold px-4 py-2 text-sm font-bold !text-[#FFFFFF] transition hover:bg-gold"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
