import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/getUser";

// POST /api/voice/rooms/[id]/request-speak - Request to speak (for non-speakers in NOMINATED mode)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const { userId } = await getUserFromRequest(request);

    // Check if room exists and is in NOMINATED mode
    const room = await prisma.voiceRoom.findUnique({
      where: { id: roomId },
      include: {
        host: { select: { id: true } },
        coHosts: { select: { userId: true } },
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.speakerMode !== "NOMINATED") {
      return NextResponse.json(
        { error: "Room is not in nominated speaker mode" },
        { status: 400 }
      );
    }

    // Find participant
    const participant = await prisma.roomParticipant.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
    });

    if (!participant || participant.leftAt) {
      return NextResponse.json(
        { error: "You are not in this room" },
        { status: 400 }
      );
    }

    // If already a speaker, no need to request
    if (participant.isSpeaker) {
      return NextResponse.json({
        success: true,
        message: "You are already a speaker",
      });
    }

    // Get requesting user info
    const requestingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });

    // Log request to speak
    await prisma.roomHistory.create({
      data: {
        roomId,
        userId,
        action: "requested_to_speak",
      },
    });

    // Return user info so client can send app message to hosts/co-hosts
    return NextResponse.json({
      success: true,
      message: "Request to speak sent to room hosts",
      requestingUser: {
        userId,
        username: requestingUser?.username || "Guest",
      },
    });
  } catch (error: any) {
    console.error("Error requesting to speak:", error);
    return NextResponse.json(
      { error: "Failed to request to speak" },
      { status: 500 }
    );
  }
}

