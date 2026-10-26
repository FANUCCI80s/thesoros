
"use client";

import type { ReactNode } from "react";

declare global {
  interface Window {
    Tawk_API?: {
      onLoad?: () => void;
      showWidget?: () => void;
      hideWidget?: () => void;
      maximize?: () => void;
    };
  }
}

type Props = {
  children?: ReactNode;
  variant?: "button" | "icon";
  className?: string;
};

export default function ChatWithSupport({
  children,
  variant = "button",
  className = "",
}: Props) {
  const openChat = () => {
    const api = window.Tawk_API;

    if (!api) return;

    api.showWidget?.();
    api.maximize?.();
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={openChat}
        aria-label="Open customer support chat"
        title="Chat with Support"
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:scale-105 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 ${className}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-7 w-7"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 10h8m-8 4h5m-9 6 1.8-4.5A8 8 0 1 1 12 20a8.1 8.1 0 0 1-4-.9L4 20Z"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={openChat}
      className={className}
    >
      {children ?? "Chat with Support"}
    </button>
  );
}
