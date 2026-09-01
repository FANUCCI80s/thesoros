import { NextRequest, NextResponse } from "next/server";

import { getQuote } from "@/lib/trading/engine";
import type { TradeSide } from "@/lib/trading/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const instrumentId = String(
      body?.instrumentId ?? "",
    );

    const side = String(
      body?.side ?? "",
    ) as TradeSide;

    const quantity = Number(
      body?.quantity,
    );

    const quote = await getQuote(
      instrumentId,
      side,
      quantity,
    );

    return NextResponse.json({
      success: true,
      quote,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to generate trade quote.";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: 400,
      },
    );
  }
}
