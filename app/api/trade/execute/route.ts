import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { executeTrade } from "@/lib/trading/engine";
import type { TradeSide } from "@/lib/trading/types";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required.",
        },
        {
          status: 401,
        },
      );
    }

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

    const execution = await executeTrade(
      user.id,
      instrumentId,
      side,
      quantity,
    );

    return NextResponse.json({
      success: true,
      execution,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Trade execution failed.";

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

