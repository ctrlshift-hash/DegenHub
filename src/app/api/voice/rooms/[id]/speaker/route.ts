import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/getUser";

// POST /api/voice/rooms/[id]/speaker - Nominate/remove speaker (host/co-host only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const { userId } = await getUserFromRequest(request);
    const body = await request.json();
    const { participantUserId, isSpeaker } = body;

    if (participantUserId === undefined || isSpeaker === undefined) {
      return NextResponse.json(
        { error: "participantUserId and isSpeaker are required" },
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

    // Check if room is in NOMINATED mode
    if (room.speakerMode !== "NOMINATED") {
      return NextResponse.json(
        { error: "Room is not in nominated speaker mode" },
        { status: 400 }
      );
    }

    const isHost = room.hostId === userId;
    const isCoHost = room.coHosts.length > 0;

    if (!isHost && !isCoHost) {
      return NextResponse.json(
        { error: "Only host or co-host can manage speakers" },
        { status: 403 }
      );
    }

    // Update participant speaker status
    await prisma.roomParticipant.updateMany({
      where: {
        roomId,
        userId: participantUserId,
        leftAt: null,
      },
      data: {
        isSpeaker,
      },
    });

    // Log to room history
    await prisma.roomHistory.create({
      data: {
        roomId,
        userId: participantUserId,
        action: isSpeaker ? "speaker_nominated" : "speaker_removed",
        details: JSON.stringify({ managedBy: userId }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Speaker ${isSpeaker ? "nominated" : "removed"} successfully`,
    });
  } catch (error: any) {
    console.error("Error managing speaker:", error);
    return NextResponse.json(
      { error: "Failed to manage speaker" },
      { status: 500 }
    );
  }
}

