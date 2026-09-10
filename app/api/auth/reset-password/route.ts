import { domainToASCII } from "node:url";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { verifyPasswordResetOtp } from "@/lib/auth/otp";

function normalizeEmail(email: string): string {
  const value = email.trim().toLowerCase();

  const atIndex = value.lastIndexOf("@");

  if (
    atIndex <= 0 ||
    atIndex === value.length - 1
  ) {
    return value;
  }

  const localPart = value.slice(0, atIndex);

  const domain = value.slice(atIndex + 1);

  const asciiDomain = domainToASCII(domain);

  if (!asciiDomain) {
    return value;
  }

  return `${localPart}@${asciiDomain}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? normalizeEmail(body.email)
        : "";

    const code =
      typeof body.code === "string"
        ? body.code.trim()
        : "";

    const newPassword =
      typeof body.newPassword === "string"
        ? body.newPassword
        : "";

    const confirmPassword =
      typeof body.confirmPassword === "string"
        ? body.confirmPassword
        : "";

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email, verification code, and new password are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Enter the 6-digit verification code.",
        },
        {
          status: 400,
        }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your new password must be at least 8 characters.",
        },
        {
          status: 400,
        }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your passwords do not match.",
        },
        {
          status: 400,
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        role: true,
        status: true,
      },
    });

    if (!user || user.role !== "USER") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to reset the password.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      user.status === "BLOCKED" ||
      user.status === "SUSPENDED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to reset the password for this account.",
        },
        {
          status: 403,
        }
      );
    }

    const otpResult =
      await verifyPasswordResetOtp(
        user.id,
        code
      );

    if (!otpResult.success) {
      let message =
        "Unable to verify the password reset code.";

      if (
        otpResult.reason === "OTP_NOT_FOUND"
      ) {
        message =
          "The password reset code is invalid or has expired.";
      }

      if (
        otpResult.reason === "OTP_EXPIRED"
      ) {
        message =
          "The password reset code has expired. Please request a new code.";
      }

      if (
        otpResult.reason === "TOO_MANY_ATTEMPTS"
      ) {
        message =
          "Too many incorrect attempts. Please request a new code.";
      }

      if (
        otpResult.reason === "INVALID_OTP"
      ) {
        message =
          "The password reset code is incorrect.";
      }

      return NextResponse.json(
        {
          success: false,
          message,
        },
        {
          status: 400,
        }
      );
    }

    const passwordHash =
      await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          passwordHash,
        },
      }),

      prisma.otpCode.update({
        where: {
          id: otpResult.otpId,
        },
        data: {
          status: "USED",
          usedAt: new Date(),
        },
      }),

      prisma.otpCode.updateMany({
        where: {
          userId: user.id,
          purpose: "PASSWORD_RESET",
          status: "PENDING",
          id: {
            not: otpResult.otpId,
          },
        },
        data: {
          status: "EXPIRED",
        },
      }),

      prisma.session.deleteMany({
        where: {
          userId: user.id,
        },
      }),

      prisma.accountActivity.create({
        data: {
          userId: user.id,
          type: "PASSWORD_CHANGED",
          description:
            "Password reset completed successfully.",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message:
        "Your password has been updated successfully.",
      redirectTo: "/login",
    });
  } catch (error) {
    console.error(
      "Password reset error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to reset your password. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}