import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedPage } from "@/lib/auth/guards";

export async function GET() {
  try {
    const user = await requireAuthenticatedPage();

    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        isRead: true,
        readAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount: notifications.filter(
        (notification) => !notification.isRead
      ).length,
      userId: user.id,
    });
  } catch (error) {
    console.error("GET /api/notifications error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuthenticatedPage();

    let body: {
      notificationId?: string;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    const notificationId = body.notificationId;

    if (
      typeof notificationId !== "string" ||
      !notificationId.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Notification ID is required.",
        },
        { status: 400 }
      );
    }

    const notification =
      await prisma.notification.findFirst({
        where: {
          id: notificationId.trim(),
          userId: user.id,
        },
        select: {
          id: true,
          isRead: true,
        },
      });

    if (!notification) {
      return NextResponse.json(
        {
          success: false,
          message: "Notification not found.",
        },
        { status: 404 }
      );
    }

    if (!notification.isRead) {
      await prisma.notification.update({
        where: {
          id: notification.id,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Notification marked as read.",
      notificationId: notification.id,
    });
  } catch (error) {
    console.error("PATCH /api/notifications error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update notification.",
      },
      { status: 500 }
    );
  }
}