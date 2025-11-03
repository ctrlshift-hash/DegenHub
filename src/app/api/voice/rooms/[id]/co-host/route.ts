import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/getUser";

// POST /api/voice/rooms/[id]/co-host - Add/remove co-host (host only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const { userId } = await getUserFromRequest(request);
    const body = await request.json();
    const { coHostUserId, action } = body; // action: "add" or "remove"

    if (!coHostUserId || !action) {
      return NextResponse.json(
        { error: "coHostUserId and action (add/remove) are required" },
        { status: 400 }
      );
    }

    // Check if room exists and user is host
    const room = await prisma.voiceRoom.findUnique({
      where: { id: roomId },
      include: { host: { select: { id: true } } },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.hostId !== userId) {
      return NextResponse.json(
        { error: "Only the host can manage co-hosts" },
        { status: 403 }
      );
    }

    // Can't add yourself as co-host
    if (coHostUserId === userId) {
      return NextResponse.json(
        { error: "You cannot add yourself as co-host" },
        { status: 400 }
      );
    }

    if (action === "add") {
      // Check if already a co-host
      const existing = await prisma.roomCoHost.findUnique({
        where: {
          roomId_userId: {
            roomId,
            userId: coHostUserId,
          },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "User is already a co-host" },
          { status: 400 }
        );
      }

      await prisma.roomCoHost.create({
        data: {
          roomId,
          userId: coHostUserId,
        },
      });

      // Log to room history
      await prisma.roomHistory.create({
        data: {
          roomId,
          userId: coHostUserId,
          action: "co_host_added",
          details: JSON.stringify({ addedBy: userId }),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Co-host added successfully",
      });
    } else if (action === "remove") {
      await prisma.roomCoHost.deleteMany({
        where: {
          roomId,
          userId: coHostUserId,
        },
      });

      // Log to room history
      await prisma.roomHistory.create({
        data: {
          roomId,
          userId: coHostUserId,
          action: "co_host_removed",
          details: JSON.stringify({ removedBy: userId }),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Co-host removed successfully",
      });
    } else {
      return NextResponse.json(
        { error: "Action must be 'add' or 'remove'" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error managing co-host:", error);
    return NextResponse.json(
      { error: "Failed to manage co-host" },
      { status: 500 }
    );
  }
}

