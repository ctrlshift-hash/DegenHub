import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/getUser";

// POST /api/voice/rooms/[id]/kick - Kick a participant from a room (host only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const { user, userId } = await getUserFromRequest(request);
    const body = await request.json();
    const { participantUserId } = body;

    if (!participantUserId) {
      return NextResponse.json(
        { error: "participantUserId is required" },
        { status: 400 }
      );
    }

    // Check if room exists and user is the host
    const room = await prisma.voiceRoom.findUnique({
      where: { id: roomId },
      include: {
        host: {
          select: { id: true },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Only host can kick participants
    if (room.hostId !== userId) {
      return NextResponse.json(
        { error: "Only the room host can kick participants" },
        { status: 403 }
      );
    }

    // Can't kick yourself
    if (participantUserId === userId) {
      return NextResponse.json(
        { error: "You cannot kick yourself" },
        { status: 400 }
      );
    }

    // Find and mark the participant as left
    const participant = await prisma.roomParticipant.findUnique({
      where: {
        roomId_userId: {
          roomId: roomId,
          userId: participantUserId,
        },
      },
    });

    if (!participant || participant.leftAt) {
      return NextResponse.json(
        { error: "Participant not found in room" },
        { status: 404 }
      );
    }

    // Mark participant as left (kicked)
    await prisma.roomParticipant.update({
      where: { id: participant.id },
      data: {
        leftAt: new Date(),
      },
    });

    // Note: We don't have direct access to Daily.co's participant removal API from here
    // The client-side will need to handle actually removing them from the Daily.co call
    // This marks them as removed in our database

    return NextResponse.json({
      success: true,
      message: "Participant kicked successfully",
    });
  } catch (error: any) {
    console.error("Error kicking participant:", error);
    return NextResponse.json(
      { error: "Failed to kick participant" },
      { status: 500 }
    );
  }
}

