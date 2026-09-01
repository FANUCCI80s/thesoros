import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { getTradingInstruments } from "@/lib/trading/instruments";

export async function GET() {
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

    const instruments =
      await getTradingInstruments();

    return NextResponse.json({
      success: true,
      instruments,
    });
  } catch (error) {
    console.error(
      "Trading instruments error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load trading instruments.",
      },
      {
        status: 500,
      },
    );
  }
}