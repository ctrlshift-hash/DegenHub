import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/getUser";

// POST /api/voice/rooms/[id]/ban - Ban/unban a user (host/co-host only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const { userId } = await getUserFromRequest(request);
    const body = await request.json();
    const { bannedUserId, action, reason } = body; // action: "ban" or "unban"

    if (!bannedUserId || !action) {
      return NextResponse.json(
        { error: "bannedUserId and action (ban/unban) are required" },
        { status: 400 }
      );
    }

    // Check if room exists and user is host or co-host
    const room = await prisma.voiceRoom.findUnique({
      where: { id: roomId },
      include: {
        host: { select: { id: true } },
        coHosts: { where: { userId } },
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const isHost = room.hostId === userId;
    const isCoHost = room.coHosts.length > 0;

    if (!isHost && !isCoHost) {
      return NextResponse.json(
        { error: "Only host or co-host can ban users" },
        { status: 403 }
      );
    }

    // Can't ban yourself
    if (bannedUserId === userId) {
      return NextResponse.json(
        { error: "You cannot ban yourself" },
        { status: 400 }
      );
    }

    if (action === "ban") {
      // Check if already banned
      const existing = await prisma.roomBannedUser.findUnique({
        where: {
          roomId_userId: {
            roomId,
            userId: bannedUserId,
          },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "User is already banned" },
          { status: 400 }
        );
      }

      // Mark participant as left if they're in the room
      await prisma.roomParticipant.updateMany({
        where: {
          roomId,
          userId: bannedUserId,
          leftAt: null,
        },
        data: {
          leftAt: new Date(),
        },
      });

      await prisma.roomBannedUser.create({
        data: {
          roomId,
          userId: bannedUserId,
          reason: reason || null,
        },
      });

      // Log to room history
      await prisma.roomHistory.create({
        data: {
          roomId,
          userId: bannedUserId,
          action: "banned",
          details: JSON.stringify({ bannedBy: userId, reason }),
        },
      });

      return NextResponse.json({
        success: true,
        message: "User banned successfully",
      });
    } else if (action === "unban") {
      await prisma.roomBannedUser.deleteMany({
        where: {
          roomId,
          userId: bannedUserId,
        },
      });

      // Log to room history
      await prisma.roomHistory.create({
        data: {
          roomId,
          userId: bannedUserId,
          action: "unbanned",
          details: JSON.stringify({ unbannedBy: userId }),
        },
      });

      return NextResponse.json({
        success: true,
        message: "User unbanned successfully",
      });
    } else {
      return NextResponse.json(
        { error: "Action must be 'ban' or 'unban'" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error banning user:", error);
    return NextResponse.json(
      { error: "Failed to ban user" },
      { status: 500 }
    );
  }
}

