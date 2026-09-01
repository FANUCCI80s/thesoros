export type TradeSide = "BUY" | "SELL";

export type TradingAssetClass =
  | "CRYPTO"
  | "PRECIOUS_METAL"
  | "STOCK"
  | "ETF"
  | "BOND"
  | "COMMODITY"
  | "FOREX";

export type TradingProvider =
  | "COINGECKO"
  | "INTERNAL"
  | "MARKET_DATA";

export type TradingInstrument = {
  /**
   * Internal unique identifier.
   *
   * Examples:
   * bitcoin-usd
   * gold-usd
   * apple-usd
   */
  id: string;

  /**
   * Display/trading symbol.
   *
   * Examples:
   * BTC/USD
   * XAU/USD
   * AAPL/USD
   */
  symbol: string;

  /**
   * Human-readable asset name.
   */
  name: string;

  /**
   * CoinGecko ID when the instrument comes
   * from CoinGecko.
   *
   * Non-crypto instruments do not need one.
   */
  coingeckoId?: string;

  /**
   * Base asset.
   *
   * Examples:
   * BTC
   * XAU
   * AAPL
   * EUR
   */
  baseAsset: string;

  /**
   * Quote currency.
   *
   * Currently USD for the supported instruments.
   */
  quoteAsset: string;

  /**
   * Asset category.
   */
  assetClass: TradingAssetClass;

  /**
   * Source of market/instrument data.
   */
  provider: TradingProvider;

  /**
   * Whether users can currently trade
   * this instrument.
   */
  enabled: boolean;
};

export type TradeQuote = {
  instrument: TradingInstrument;
  side: TradeSide;
  price: number;
  quantity: number;
  notional: number;
  timestamp: number;
};

export type TradeExecution = {
  transactionId: string;
  reference: string;
  side: TradeSide;
  symbol: string;
  quantity: number;
  price: number;
  notional: number;
  currency: string;
};