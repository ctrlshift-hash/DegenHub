import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/getUser";

// POST /api/voice/rooms/[id]/recording - Start/stop recording (host/co-host only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const { userId } = await getUserFromRequest(request);
    const body = await request.json();
    const { action } = body; // "start" or "stop"

    if (!action) {
      return NextResponse.json(
        { error: "action (start/stop) is required" },
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
        { error: "Only host or co-host can control recording" },
        { status: 403 }
      );
    }

    if (action === "start") {
      await prisma.voiceRoom.update({
        where: { id: roomId },
        data: { isRecording: true },
      });

      // Log to room history
      await prisma.roomHistory.create({
        data: {
          roomId,
          userId,
          action: "recording_started",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Recording started",
      });
    } else if (action === "stop") {
      await prisma.voiceRoom.update({
        where: { id: roomId },
        data: { isRecording: false },
      });

      // Log to room history
      await prisma.roomHistory.create({
        data: {
          roomId,
          userId,
          action: "recording_stopped",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Recording stopped",
      });
    } else {
      return NextResponse.json(
        { error: "Action must be 'start' or 'stop'" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error managing recording:", error);
    return NextResponse.json(
      { error: "Failed to manage recording" },
      { status: 500 }
    );
  }
}

