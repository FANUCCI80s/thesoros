import type {
  TradingInstrument,
} from "./types";

const COINGECKO_MARKETS_API =
  "https://api.coingecko.com/api/v3/coins/markets";

const MAX_CRYPTO_INSTRUMENTS = 500;
const PER_PAGE = 250;
const CACHE_DURATION = 60_000;

export type InstrumentCategory =
  | "CRYPTO"
  | "PRECIOUS_METAL"
  | "STOCK"
  | "ETF"
  | "BOND"
  | "COMMODITY"
  | "FOREX";

type CoinGeckoMarket = {
  id: string;
  symbol: string;
  name: string;
};

let cachedInstruments: TradingInstrument[] = [];
let cacheTimestamp = 0;

// Prevent multiple requests from simultaneously
// rebuilding the instrument cache.
let instrumentsPromise: Promise<
  TradingInstrument[]
> | null = null;

function normalizeSymbol(
  symbol: string,
): string {
  return symbol.trim().toUpperCase();
}

/**
 * Create a cryptocurrency instrument.
 *
 * CoinGecko is the market-data provider for crypto.
 */
function createCryptoInstrument(
  coin: CoinGeckoMarket,
): TradingInstrument {
  const id = coin.id.trim();
  const baseAsset = normalizeSymbol(
    coin.symbol,
  );
  const name = coin.name.trim();

  return {
    id: `${id}-usd`,
    symbol: `${baseAsset}/USD`,
    name,
    coingeckoId: id,
    baseAsset,
    quoteAsset: "USD",
    assetClass: "CRYPTO",
    provider: "COINGECKO",
    enabled: true,
  };
}

/**
 * Static traditional-market instruments.
 *
 * These do not use CoinGecko because CoinGecko is
 * primarily a cryptocurrency market-data provider.
 *
 * The provider can later be connected to a real
 * stock/forex/commodity/bond market-data provider.
 */
const NON_CRYPTO_INSTRUMENTS: TradingInstrument[] = [
  // =====================================================
  // PRECIOUS METALS
  // =====================================================

  {
    id: "gold-usd",
    symbol: "XAU/USD",
    name: "Gold",
    coingeckoId: "",
    baseAsset: "XAU",
    quoteAsset: "USD",
    assetClass: "PRECIOUS_METAL",
    provider: "MARKET_DATA",
    enabled: true,
  },

  {
    id: "silver-usd",
    symbol: "XAG/USD",
    name: "Silver",
    coingeckoId: "",
    baseAsset: "XAG",
    quoteAsset: "USD",
    assetClass: "PRECIOUS_METAL",
    provider: "MARKET_DATA",
    enabled: true,
  },

  {
    id: "platinum-usd",
    symbol: "XPT/USD",
    name: "Platinum",
    coingeckoId: "",
    baseAsset: "XPT",
    quoteAsset: "USD",
    assetClass: "PRECIOUS_METAL",
    provider: "MARKET_DATA",
    enabled: true,
  },

  {
    id: "palladium-usd",
    symbol: "XPD/USD",
    name: "Palladium",
    coingeckoId: "",
    baseAsset: "XPD",
    quoteAsset: "USD",
    assetClass: "PRECIOUS_METAL",
    provider: "MARKET_DATA",
    enabled: true,
  },

  // =====================================================
  // STOCKS
  // =====================================================

  {
    id: "apple-usd",
    symbol: "AAPL/USD",
    name: "Apple",
    coingeckoId: "",
    baseAsset: "AAPL",
    quoteAsset: "USD",
    assetClass: "STOCK",
    provider: "MARKET_DATA",
    enabled: true,
  },

  {
    id: "microsoft-usd",
    symbol: "MSFT/USD",
    name: "Microsoft",
    coingeckoId: "",
    baseAsset: "MSFT",
    quoteAsset: "USD",
    assetClass: "STOCK",
    provider: "MARKET_DATA",
    enabled: true,
  },

  {
    id: "nvidia-usd",
    symbol: "NVDA/USD",
    name: "NVIDIA",
    coingeckoId: "",
    baseAsset: "NVDA",
    quoteAsset: "USD",
    assetClass: "STOCK",
    provider: "MARKET_DATA",
    enabled: true,
  },

  {
    id: "amazon-usd",
    symbol: "AMZN/USD",
    name: "Amazon",
    coingeckoId: "",
    baseAsset: "AMZN",
    quoteAsset: "USD",
    assetClass: "STOCK",
    provider: "MARKET_DATA",
    enabled: true,
  },

  {
    id: "alphabet-usd",
    symbol: "GOOGL/USD",
    name: "Alphabet",
    coingeckoId: "",
    baseAsset: "GOOGL",
    quoteAsset: "USD",
    assetClass: "STOCK",
    provider: "MARKET_DATA",
    enabled: true,
  },

  {
    id: "meta-usd",
    symbol: "META/USD",
    name: "Meta Platforms",
    coingeckoId: "",
    baseAsset: "META",
    quoteAsset: "USD",
    assetClass: "STOCK",
    provider: "MARKET_DATA",
    enabled: true,
  },

  {
    id: "tesla-usd",
    symbol: "TSLA/USD",
    name: "Tesla",
    coingeckoId: "",
    baseAsset: "TSLA",
    quoteAsset: "USD",
    assetClass: "STOCK",
    provider: "MARKET_DATA",
    enabled: true,
  },

  {
    id: "berkshire-hathaway-usd",
    symbol: "BRK.B/USD",
    name: "Berkshire Hathaway",
    coingeckoId: "",
    baseAsset: "BRK.B",
    quoteAsset: "USD",
    assetClass: "STOCK",
    provider: "MARKET_DATA",
    enabled: true,
  },

  {
    id: "jpmorgan-usd",
    symbol: "JPM/USD",
    name: "JPMorgan Chase",
    coingeckoId: "",
    baseAsset: "JPM",
    quoteAsset: "USD",
    assetClass: "STOCK",
    provider: "MARKET_DATA",
    enabled: true,
  },

  {
    id: "visa-usd",
    symbol: "V/USD",
    name: "Visa",
    coingeckoId: "",
    baseAsset: "V",
    quoteAsset: "USD",
    assetClass: "STOCK",
    provider: "MARKET_DATA",
    enabled: true,
  },

  {
    id: "mastercard-usd",
    symbol: "MA/USD",
    name: "Mastercard",
    coingeckoId: "",
    baseAsset: "MA",
    quoteAsset: "USD",
    assetClass: "STOCK",
    provider: "MARKET_DATA",
    enabled: true,
  },

  {
    id: "walmart-usd",
    symbol: "WMT/USD",
    name: "Walmart",
    coingeckoId: "",
    baseAsset: "WMT",
    quoteAsset: "USD",
    assetClass: "STOCK",
    provider: "MARKET_DATA",
    enabled: true,
  },

  {
    id: "coca-cola-usd",
    symbol: "KO/USD",
    name: "Coca-Cola",
    coingeckoId: "",
    baseAsset: "KO",
    quoteAsset: "USD",
    assetClass: "STOCK",
    provider: "MARKET_DATA",
    enabled: true,
  },

  // =====================================================
  // ETFs
  // =====================================================

  {
    id: "spdr-sp500-etf-usd",
    symbol: "SPY/USD",
    name: "SPDR S&P 500 ETF",
    coingeckoId: "",
    baseAsset: "SPY",
    quoteAsset: "USD",
    assetClass: "ETF",
    provider: "MARKET_DATA",
    enabled: true,
  },

  {
    id: "invesco-qqq-usd",
    symbol: "QQQ/USD",
    name: "Invesco QQQ",
    coingeckoId: "",
    baseAsset: "QQQ",
    quoteAsset: "USD",
    assetClass: "ETF",
    provider: "MARKET_DATA",
    enabled: true,
  },

  {
    id: "ishares-core-sp500-usd",
    symbol: "IVV/USD",
    name: "iShares Core S&P 500 ETF",
    coingeckoId: "",
    baseAsset: "IVV",
    quoteAsset: "USD",
    assetClass: "ETF",
    provider: "MARKET_DATA",
    enabled: true,
  },

  {
    id: "vanguard-total-stock-market-usd",
    symbol: "VTI/USD",
    name: "Vanguard Total Stock Market ETF",
    coingeckoId: "",
    baseAsset: "VTI",
    quoteAsset: "USD",
    assetClass: "ETF",
    provider: "MARKET_DATA",
    enabled: true,
  },

  {
    id: "vanguard-s-and-p-500-usd",
    symbol: "VOO/USD",
    name: "Vanguard S&P 500 ETF",
    coingeckoId: "",
    baseAsset: "VOO",
    quoteAsset: "USD",
    assetClass: "ETF",
    provider: "MARKET_DATA",
    enabled: true,
  },

  // =====================================================
  // BONDS / TREASURIES
  // =====================================================

  {
    id: "us-2-year-treasury",
    symbol: "US2Y/USD",
    name: "U.S. 2-Year Treasury",
    coingeckoId: "",
    baseAsset: "US2Y",
    quoteAsset: "USD",
    assetClass: "BOND",
    provider: "MARKET_DATA",
    enabled: true,
  },

  {
    id: "us-5-year-treasury",
    symbol: "US5Y/USD",
    name: "U.S. 5-Year Treasury",
    coingeckoId: "",
    baseAsset: "US5Y",
    quoteAsset: "USD",
    assetClass: "BOND",
    provider: "MARKET_DATA",
    enabled: true,
  },

  {
    id: "us-10-year-treasury",
    symbol: "US10Y/USD",
    name: "U.S. 10-Year Treasury",
    coingeckoId: "",
    baseAsset: "US10Y",
    quoteAsset: "USD",
    assetClass: "BOND",
    provider: "MARKET_DATA",
    enabled: true,
  },

  {
    id: "us-30-year-treasury",
    symbol: "US30Y/USD",
    name: "U.S. 30-Year Treasury",
    coingeckoId: "",
    baseAsset: "US30Y",
    quoteAsset: "USD",
    assetClass: "BOND",
    provider: "MARKET_DATA",
    enabled: true,
  },

  // =====================================================
  // COMMODITIES
  // =====================================================

  {
    id: "wti-crude-oil-usd",
    symbol: "WTI/USD",
    name: "WTI Crude Oil",
    coingeckoId: "",
    baseAsset: "WTI",
    quoteAsset: "USD",
    assetClass: "COMMODITY",
    provider: "MARKET_DATA",
    enabled: true,
  },

  {
    id: "brent-crude-oil-usd",
    symbol: "BRENT/USD",
    name: "Brent Crude Oil",
    coingeckoId: "",
    baseAsset: "BRENT",
    quoteAsset: "USD",
    assetClass: "COMMODITY",
    provider: "MARKET_DATA",
    enabled: true,
  },

  {
    id: "natural-gas-usd",
    symbol: "NG/USD",
    name: "Natural Gas",
    coingeckoId: "",
    baseAsset: "NG",
    quoteAsset: "USD",
    assetClass: "COMMODITY",
    provider: "MARKET_DATA",
    enabled: true,
  },

  {
    id: "copper-usd",
    symbol: "COPPER/USD",
    name: "Copper",
    coingeckoId: "",
    baseAsset: "COPPER",
    quoteAsset: "USD",
    assetClass: "COMMODITY",
    provider: "MARKET_DATA",
    enabled: true,
  },

  // =====================================================
  // FOREX
  // =====================================================

  {
    id: "eur-usd",
    symbol: "EUR/USD",
    name: "Euro / U.S. Dollar",
    coingeckoId: "",
    baseAsset: "EUR",
    quoteAsset: "USD",
    assetClass: "FOREX",
    provider: "MARKET_DATA",
    enabled: true,
  },

  {
    id: "gbp-usd",
    symbol: "GBP/USD",
    name: "British Pound / U.S. Dollar",
    coingeckoId: "",
    baseAsset: "GBP",
    quoteAsset: "USD",
    assetClass: "FOREX",
    provider: "MARKET_DATA",
    enabled: true,
  },

  {
    id: "usd-jpy",
    symbol: "USD/JPY",
    name: "U.S. Dollar / Japanese Yen",
    coingeckoId: "",
    baseAsset: "USD",
    quoteAsset: "JPY",
    assetClass: "FOREX",
    provider: "MARKET_DATA",
    enabled: true,
  },

  {
    id: "usd-chf",
    symbol: "USD/CHF",
    name: "U.S. Dollar / Swiss Franc",
    coingeckoId: "",
    baseAsset: "USD",
    quoteAsset: "CHF",
    assetClass: "FOREX",
    provider: "MARKET_DATA",
    enabled: true,
  },

  {
    id: "aud-usd",
    symbol: "AUD/USD",
    name: "Australian Dollar / U.S. Dollar",
    coingeckoId: "",
    baseAsset: "AUD",
    quoteAsset: "USD",
    assetClass: "FOREX",
    provider: "MARKET_DATA",
    enabled: true,
  },

  {
    id: "usd-cad",
    symbol: "USD/CAD",
    name: "U.S. Dollar / Canadian Dollar",
    coingeckoId: "",
    baseAsset: "USD",
    quoteAsset: "CAD",
    assetClass: "FOREX",
    provider: "MARKET_DATA",
    enabled: true,
  },
];

/**
 * Fetch one CoinGecko page.
 */
async function fetchCoinGeckoPage(
  page: number,
): Promise<CoinGeckoMarket[]> {
  const url = new URL(
    COINGECKO_MARKETS_API,
  );

  url.searchParams.set(
    "vs_currency",
    "usd",
  );

  url.searchParams.set(
    "order",
    "market_cap_desc",
  );

  url.searchParams.set(
    "per_page",
    String(PER_PAGE),
  );

  url.searchParams.set(
    "page",
    String(page),
  );

  url.searchParams.set(
    "sparkline",
    "false",
  );

  const response = await fetch(
    url.toString(),
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Unable to retrieve crypto instruments. ` +
        `CoinGecko returned ${response.status}.`,
    );
  }

  const data =
    (await response.json()) as unknown;

  if (!Array.isArray(data)) {
    throw new Error(
      "Invalid CoinGecko instrument response.",
    );
  }

  return data.filter(
    (
      coin,
    ): coin is CoinGeckoMarket =>
      typeof coin === "object" &&
      coin !== null &&
      "id" in coin &&
      "symbol" in coin &&
      "name" in coin &&
      typeof coin.id === "string" &&
      typeof coin.symbol === "string" &&
      typeof coin.name === "string",
  );
}

/**
 * Load the complete trading universe.
 */
async function loadTradingInstruments(): Promise<
  TradingInstrument[]
> {
  let cryptoInstruments: TradingInstrument[] =
    [];

  try {
    const pages =
      await Promise.all([
        fetchCoinGeckoPage(1),
        fetchCoinGeckoPage(2),
      ]);

    const coins = [
      ...pages[0],
      ...pages[1],
    ];

    const seenCoinGeckoIds =
      new Set<string>();

    const seenSymbols =
      new Set<string>();

    for (const coin of coins) {
      if (
        cryptoInstruments.length >=
        MAX_CRYPTO_INSTRUMENTS
      ) {
        break;
      }

      const id =
        coin.id.trim();

      const symbol =
        normalizeSymbol(
          coin.symbol,
        );

      const name =
        coin.name.trim();

      if (
        !id ||
        !symbol ||
        !name
      ) {
        continue;
      }

      if (
        seenCoinGeckoIds.has(id)
      ) {
        continue;
      }

      seenCoinGeckoIds.add(id);

      /*
       * Prevent duplicate symbols from becoming
       * ambiguous holdings.
       *
       * CoinGecko is ordered by market cap, so
       * the first occurrence wins.
       */
      if (
        seenSymbols.has(symbol)
      ) {
        continue;
      }

      seenSymbols.add(symbol);

      cryptoInstruments.push(
        createCryptoInstrument({
          id,
          symbol,
          name,
        }),
      );
    }
  } catch (error) {
    /*
     * CoinGecko being unavailable should not remove
     * traditional instruments from the application.
     */
    console.error(
      "CoinGecko instrument loading failed:",
      error,
    );
  }

  const allInstruments = [
    ...cryptoInstruments,
    ...NON_CRYPTO_INSTRUMENTS,
  ];

  /*
   * Final deduplication by stable instrument ID.
   */
  const unique =
    new Map<
      string,
      TradingInstrument
    >();

  for (
    const instrument of allInstruments
  ) {
    if (
      !unique.has(
        instrument.id,
      )
    ) {
      unique.set(
        instrument.id,
        instrument,
      );
    }
  }

  const instruments =
    Array.from(
      unique.values(),
    );

  if (
    instruments.length === 0
  ) {
    throw new Error(
      "No trading instruments are currently available.",
    );
  }

  return instruments;
}

/**
 * Return all supported trading instruments.
 */
export async function getTradingInstruments(): Promise<
  TradingInstrument[]
> {
  const now = Date.now();

  if (
    cachedInstruments.length >
      0 &&
    now - cacheTimestamp <
      CACHE_DURATION
  ) {
    return cachedInstruments;
  }

  if (instrumentsPromise) {
    return instrumentsPromise;
  }

  instrumentsPromise =
    loadTradingInstruments()
      .then(
        (
          instruments,
        ) => {
          cachedInstruments =
            instruments;

          cacheTimestamp =
            Date.now();

          return instruments;
        },
      )
      .finally(() => {
        instrumentsPromise =
          null;
      });

  return instrumentsPromise;
}

/**
 * Find an instrument by its stable ID.
 */
export async function getInstrument(
  id: string,
): Promise<
  TradingInstrument | undefined
> {
  if (
    !id ||
    typeof id !== "string"
  ) {
    return undefined;
  }

  const instruments =
    await getTradingInstruments();

  return instruments.find(
    (instrument) =>
      instrument.id === id &&
      instrument.enabled,
  );
}

/**
 * Find an instrument by base asset.
 */
export async function getInstrumentBySymbol(
  symbol: string,
): Promise<
  TradingInstrument | undefined
> {
  if (
    !symbol ||
    typeof symbol !== "string"
  ) {
    return undefined;
  }

  const normalizedSymbol =
    normalizeSymbol(symbol);

  const instruments =
    await getTradingInstruments();

  return instruments.find(
    (instrument) =>
      instrument.baseAsset ===
        normalizedSymbol &&
      instrument.enabled,
  );
}

/**
 * Find instruments by asset class.
 *
 * This now uses the actual assetClass field
 * instead of maintaining a separate symbol map.
 */
export async function getInstrumentsByCategory(
  category: InstrumentCategory,
): Promise<
  TradingInstrument[]
> {
  const instruments =
    await getTradingInstruments();

  return instruments.filter(
    (instrument) =>
      instrument.assetClass ===
        category &&
      instrument.enabled,
  );
}

/**
 * Clear the in-memory instrument cache.
 */
export function clearTradingInstrumentCache(): void {
  cachedInstruments = [];
  cacheTimestamp = 0;
  instrumentsPromise = null;
}