"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

const markets = [
  ["BTC/USD", "$67,842.21", "+4.82%"],
  ["ETH/USD", "$3,842.17", "+3.41%"],
  ["EUR/USD", "1.16842", "+0.64%"],
  ["GBP/USD", "1.35481", "+0.51%"],
  ["AAPL", "$228.17", "+2.31%"],
  ["NVDA", "$181.92", "+3.87%"],
];

export default function MarketTicker() {
  return (
    <section className="relative overflow-hidden border-y border-white/5 bg-[#050505]">
      {/* Background image */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage:
            "url('/branding/new-background-mobile-1.jpg')",
        }}
      />

      {/* Dark overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[#050505]/80" />

      {/* Subtle cinematic gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#050505]/95 via-transparent to-[#050505]/95" />

      {/* Gold ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.05] blur-[100px]" />

      <div className="relative overflow-hidden">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex w-max"
        >
          {[...markets, ...markets].map(
            ([symbol, price, change], index) => (
              <div
                key={`${symbol}-${index}`}
                className="flex min-w-[190px] items-center gap-3 border-r border-white/5 px-6 py-4 backdrop-blur-[2px]"
              >
                <TrendingUp
                  className="h-3.5 w-3.5 shrink-0 text-gold"
                  strokeWidth={2}
                />

                <span className="text-xs font-bold !text-[#FFFFFF]">
                  {symbol}
                </span>

                <span className="text-xs !text-[#FFFFFF]">
                  {price}
                </span>

                <span className="text-xs font-bold text-gold">
                  {change}
                </span>
              </div>
            ),
          )}
        </motion.div>
      </div>
    </section>
  );
}