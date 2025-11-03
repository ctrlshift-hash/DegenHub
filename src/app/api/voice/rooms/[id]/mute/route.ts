import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/getUser";

// POST /api/voice/rooms/[id]/mute - Mute/unmute a participant (host/co-host only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const { userId } = await getUserFromRequest(request);
    const body = await request.json();
    const { participantUserId, muted } = body;

    if (participantUserId === undefined || muted === undefined) {
      return NextResponse.json(
        { error: "participantUserId and muted are required" },
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
        { error: "Only host or co-host can mute participants" },
        { status: 403 }
      );
    }

    // Log to room history
    await prisma.roomHistory.create({
      data: {
        roomId,
        userId: participantUserId,
        action: muted ? "muted" : "unmuted",
        details: JSON.stringify({ mutedBy: userId }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Participant ${muted ? "muted" : "unmuted"} successfully`,
    });
  } catch (error: any) {
    console.error("Error muting participant:", error);
    return NextResponse.json(
      { error: "Failed to mute participant" },
      { status: 500 }
    );
  }
}

