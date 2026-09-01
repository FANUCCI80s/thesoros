import { randomUUID } from "crypto";
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  getInstrument,
  getTradingInstruments,
} from "./instruments";

import type {
  TradeExecution,
  TradeQuote,
  TradeSide,
} from "./types";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not configured.",
  );
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

const COINGECKO_API =
  "https://api.coingecko.com/api/v3/simple/price";

const MAX_TRADE_NOTIONAL = 1_000_000;
const MIN_TRADE_NOTIONAL = 1;

const QUANTITY_SCALE = 12;
const MONEY_SCALE = 8;

/**
 * Retrieve a cryptocurrency market price from CoinGecko.
 *
 * Only instruments with a CoinGecko ID should reach
 * this function.
 */
async function getCoinGeckoMarketPrice(
  coingeckoId: string,
): Promise<number> {
  if (!coingeckoId) {
    throw new Error(
      "This instrument does not have a CoinGecko market-data identifier.",
    );
  }

  const url =
    `${COINGECKO_API}?ids=${encodeURIComponent(
      coingeckoId,
    )}&vs_currencies=usd`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      "Unable to retrieve the current crypto market price.",
    );
  }

  const data = (await response.json()) as Record<
    string,
    {
      usd?: number;
    }
  >;

  const price =
    data?.[coingeckoId]?.usd;

  if (
    typeof price !== "number" ||
    !Number.isFinite(price) ||
    price <= 0
  ) {
    throw new Error(
      "Invalid crypto market price received.",
    );
  }

  return price;
}

/**
 * Retrieve the current market price for an instrument.
 *
 * At the moment:
 *
 * CRYPTO
 *   -> CoinGecko
 *
 * NON-CRYPTO
 *   -> Requires the configured market-data provider.
 *
 * We deliberately do not create fake prices for stocks,
 * gold, ETFs, bonds, commodities, or forex.
 */
async function getMarketPrice(
  instrument: Awaited<
    ReturnType<typeof getInstrument>
  >,
): Promise<number> {
  if (!instrument) {
    throw new Error(
      "Trading instrument is not available.",
    );
  }

  if (
    instrument.assetClass === "CRYPTO"
  ) {
    if (!instrument.coingeckoId) {
      throw new Error(
        "Crypto instrument is missing its CoinGecko identifier.",
      );
    }

    return getCoinGeckoMarketPrice(
      instrument.coingeckoId,
    );
  }

  /*
   * Non-crypto instruments currently use the
   * MARKET_DATA provider placeholder.
   *
   * Do not execute a trade without a real market
   * price because doing so would create false
   * portfolio valuations.
   */
  throw new Error(
    `${instrument.name} market pricing is not connected yet.`,
  );
}

function validateTradeQuantity(
  quantity: number,
): void {
  if (
    !Number.isFinite(quantity) ||
    quantity <= 0
  ) {
    throw new Error(
      "Quantity must be greater than zero.",
    );
  }
}

function validateTradeSide(
  side: TradeSide,
): void {
  if (
    side !== "BUY" &&
    side !== "SELL"
  ) {
    throw new Error(
      "Invalid trade side.",
    );
  }
}

function decimalFromNumber(
  value: number,
  scale: number,
): Prisma.Decimal {
  if (
    !Number.isFinite(value)
  ) {
    throw new Error(
      "Invalid numeric value.",
    );
  }

  return new Prisma.Decimal(
    value.toFixed(scale),
  );
}

/**
 * Calculate the new weighted-average entry price.
 *
 * Example:
 *
 * Existing:
 *   1 BTC @ $50,000
 *
 * New:
 *   1 BTC @ $60,000
 *
 * Result:
 *   2 BTC @ $55,000 average
 */
function calculateWeightedAveragePrice(
  existingQuantity: Prisma.Decimal,
  existingAveragePrice: Prisma.Decimal,
  newQuantity: Prisma.Decimal,
  newPrice: Prisma.Decimal,
): Prisma.Decimal {
  const existingCost =
    existingQuantity.mul(
      existingAveragePrice,
    );

  const newCost =
    newQuantity.mul(
      newPrice,
    );

  const totalQuantity =
    existingQuantity.add(
      newQuantity,
    );

  if (totalQuantity.isZero()) {
    return new Prisma.Decimal(0);
  }

  return existingCost
    .add(newCost)
    .div(totalQuantity);
}

export async function getQuote(
  instrumentId: string,
  side: TradeSide,
  quantity: number,
): Promise<TradeQuote> {
  const instrument =
    await getInstrument(
      instrumentId,
    );

  if (!instrument) {
    throw new Error(
      "Trading instrument is not available.",
    );
  }

  validateTradeSide(side);
  validateTradeQuantity(quantity);

  const price =
    await getMarketPrice(
      instrument,
    );

  const notional =
    price * quantity;

  if (
    !Number.isFinite(notional) ||
    notional <= 0
  ) {
    throw new Error(
      "Invalid trade value.",
    );
  }

  if (
    notional <
    MIN_TRADE_NOTIONAL
  ) {
    throw new Error(
      `Minimum trade value is $${MIN_TRADE_NOTIONAL.toFixed(
        2,
      )}.`,
    );
  }

  if (
    notional >
    MAX_TRADE_NOTIONAL
  ) {
    throw new Error(
      `Maximum trade value is $${MAX_TRADE_NOTIONAL.toLocaleString()}.`,
    );
  }

  return {
    instrument,
    side,
    price,
    quantity,
    notional,
    timestamp: Date.now(),
  };
}

export async function executeTrade(
  userId: string,
  instrumentId: string,
  side: TradeSide,
  quantity: number,
): Promise<TradeExecution> {
  if (!userId) {
    throw new Error(
      "Authentication required.",
    );
  }

  const quote =
    await getQuote(
      instrumentId,
      side,
      quantity,
    );

  const reference =
    `TRD-${Date.now()}-${randomUUID()
      .replace(/-/g, "")
      .slice(0, 10)
      .toUpperCase()}`;

  const notional =
    decimalFromNumber(
      quote.notional,
      MONEY_SCALE,
    );

  const tradeQuantity =
    decimalFromNumber(
      quote.quantity,
      QUANTITY_SCALE,
    );

  const tradePrice =
    decimalFromNumber(
      quote.price,
      QUANTITY_SCALE,
    );

  const result =
    await prisma.$transaction(
      async (tx) => {
        const balance =
          await tx.balance.findUnique({
            where: {
              userId,
            },
          });

        if (!balance) {
          throw new Error(
            "Trading balance has not been initialized.",
          );
        }

        const available =
          new Prisma.Decimal(
            balance.available,
          );

        const symbol =
          quote.instrument.baseAsset;

        /*
         * =================================================
         * BUY
         * =================================================
         *
         * USD is removed from available balance.
         *
         * The purchased asset is then recorded in Holding.
         */
        if (side === "BUY") {
          if (
            available.lessThan(
              notional,
            )
          ) {
            throw new Error(
              "Insufficient available balance.",
            );
          }

          await tx.balance.update({
            where: {
              userId,
            },
            data: {
              available: {
                decrement: notional,
              },
            },
          });

          const existingHolding =
            await tx.holding.findUnique({
              where: {
                userId_symbol: {
                  userId,
                  symbol,
                },
              },
            });

          if (existingHolding) {
            const existingQuantity =
              new Prisma.Decimal(
                existingHolding.quantity,
              );

            const existingAveragePrice =
              new Prisma.Decimal(
                existingHolding.averagePrice,
              );

            const newQuantity =
              existingQuantity.add(
                tradeQuantity,
              );

            const newAveragePrice =
              calculateWeightedAveragePrice(
                existingQuantity,
                existingAveragePrice,
                tradeQuantity,
                tradePrice,
              );

            await tx.holding.update({
              where: {
                id: existingHolding.id,
              },
              data: {
                quantity: newQuantity,
                averagePrice:
                  newAveragePrice,
                assetName:
                  quote.instrument.name,
              },
            });
          } else {
            await tx.holding.create({
              data: {
                userId,
                symbol,
                assetName:
                  quote.instrument.name,
                quantity:
                  tradeQuantity,
                averagePrice:
                  tradePrice,
              },
            });
          }
        }

        /*
         * =================================================
         * SELL
         * =================================================
         *
         * The user must actually own the asset.
         *
         * We reduce the Holding and credit the USD
         * proceeds to available balance.
         */
        if (side === "SELL") {
          const holding =
            await tx.holding.findUnique({
              where: {
                userId_symbol: {
                  userId,
                  symbol,
                },
              },
            });

          if (!holding) {
            throw new Error(
              `You do not own any ${symbol}.`,
            );
          }

          const currentQuantity =
            new Prisma.Decimal(
              holding.quantity,
            );

          if (
            currentQuantity.lessThan(
              tradeQuantity,
            )
          ) {
            throw new Error(
              `Insufficient ${symbol} position. You currently own ${currentQuantity.toFixed(
                QUANTITY_SCALE,
              )} ${symbol}.`,
            );
          }

          const remainingQuantity =
            currentQuantity.sub(
              tradeQuantity,
            );

          /*
           * Credit the USD proceeds.
           */
          await tx.balance.update({
            where: {
              userId,
            },
            data: {
              available: {
                increment: notional,
              },
            },
          });

          /*
           * If the entire position was sold,
           * remove the holding.
           *
           * Otherwise preserve the remaining
           * position and its original weighted
           * average purchase price.
           */
          if (
            remainingQuantity.isZero()
          ) {
            await tx.holding.delete({
              where: {
                id: holding.id,
              },
            });
          } else {
            await tx.holding.update({
              where: {
                id: holding.id,
              },
              data: {
                quantity:
                  remainingQuantity,
              },
            });
          }
        }

        /*
         * =================================================
         * TRANSACTION RECORD
         * =================================================
         */
        const transaction =
          await tx.transaction.create({
            data: {
              userId,
              type: "TRADE",
              status: "COMPLETED",
              amount: notional,
              currency: "USD",
              description:
                `${side} ${quote.quantity} ` +
                `${quote.instrument.baseAsset} ` +
                `at $${quote.price.toFixed(2)}`,
              reference,
              completedAt:
                new Date(),
            },
          });

        /*
         * =================================================
         * TRADE RECORD
         * =================================================
         *
         * This keeps the existing Trade table as the
         * execution history while Holding represents
         * the current asset position.
         */
        await tx.trade.create({
          data: {
            userId,
            symbol:
              quote.instrument.baseAsset,
            assetName:
              quote.instrument.name,
            side,
            status: "COMPLETED",
            quantity:
              tradeQuantity,
            price:
              tradePrice,
            total:
              notional,
            currency: "USD",
            reference,
            executedAt:
              new Date(),
          },
        });

        /*
         * =================================================
         * ACCOUNT ACTIVITY
         * =================================================
         */
        await tx.accountActivity.create({
          data: {
            userId,
            type:
              side === "BUY"
                ? "TRADE_OPENED"
                : "TRADE_CLOSED",
            description:
              `${side} ${quote.quantity} ` +
              `${quote.instrument.symbol} ` +
              `at $${quote.price.toFixed(2)}`,
            metadata: {
              transactionId:
                transaction.id,
              reference,
              side,
              symbol:
                quote.instrument.symbol,
              asset:
                quote.instrument.baseAsset,
              assetClass:
                quote.instrument.assetClass,
              provider:
                quote.instrument.provider,
              quantity:
                quote.quantity,
              price:
                quote.price,
              notional:
                quote.notional,
            },
          },
        });

        /*
         * =================================================
         * NOTIFICATION
         * =================================================
         */
        await tx.notification.create({
          data: {
            userId,
            type: "TRADE",
            title:
              side === "BUY"
                ? "Buy Order Executed"
                : "Sell Order Executed",
            message:
              `${side} order executed: ` +
              `${quote.quantity} ` +
              `${quote.instrument.baseAsset} ` +
              `at $${quote.price.toFixed(2)} ` +
              `for $${quote.notional.toFixed(2)}.`,
          },
        });

        return transaction;
      },
    );

  return {
    transactionId:
      result.id,
    reference,
    side,
    symbol:
      quote.instrument.symbol,
    quantity:
      quote.quantity,
    price:
      quote.price,
    notional:
      quote.notional,
    currency: "USD",
  };
}

/**
 * Returns all currently available trading instruments.
 */
export async function getAvailableTradingInstruments(): Promise<
  Awaited<
    ReturnType<
      typeof getTradingInstruments
    >
  >
> {
  return getTradingInstruments();
}