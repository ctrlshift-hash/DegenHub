import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/getUser";
import { ejectParticipantFromDailyRoom } from "@/lib/daily";

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
        coHosts: {
          where: { userId },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Only host or co-host can kick participants
    const isHost = room.hostId === userId;
    const isCoHost = room.coHosts.length > 0;

    if (!isHost && !isCoHost) {
      return NextResponse.json(
        { error: "Only the room host or co-host can kick participants" },
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

    // Co-hosts cannot kick the host
    if (isCoHost && !isHost && participantUserId === room.hostId) {
      return NextResponse.json(
        { error: "Co-hosts cannot kick the room host" },
        { status: 403 }
      );
    }

    // Find the participant
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

    // Mark participant as left (kicked) in database
    await prisma.roomParticipant.update({
      where: { id: participant.id },
      data: {
        leftAt: new Date(),
      },
    });

    // Also eject from Daily.co room if we have the room URL
    if (room.dailyRoomUrl) {
      const urlParts = room.dailyRoomUrl.split("/");
      const roomName = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2] || "";
      
      if (roomName) {
        // We need the session_id to eject, but we don't have it here
        // The client will handle the actual Daily.co ejection
        // For now, we mark them as left and the client should handle removal
        console.log("⚠️ Cannot eject from Daily.co without session_id - client must handle");
      }
    }

    // Check kick count - if 2 or more, auto-ban
    const kickHistory = await prisma.roomHistory.findMany({
      where: {
        roomId,
        userId: participantUserId,
        action: "kicked",
      },
    });

    const kickCount = kickHistory.length + 1; // +1 for this kick

    // Log to room history
    await prisma.roomHistory.create({
      data: {
        roomId,
        userId: participantUserId,
        action: "kicked",
        details: JSON.stringify({ kickedBy: userId, kickCount }),
      },
    });

    // If kicked 2+ times, auto-ban
    if (kickCount >= 2) {
      await prisma.roomBannedUser.upsert({
        where: {
          roomId_userId: {
            roomId,
            userId: participantUserId,
          },
        },
        update: {},
        create: {
          roomId,
          userId: participantUserId,
          reason: `Kicked ${kickCount} times`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Participant kicked successfully",
      sessionId: null, // We don't have session_id here, client needs to provide it
      kickCount,
      banned: kickCount >= 2,
    });
  } catch (error: any) {
    console.error("Error kicking participant:", error);
    return NextResponse.json(
      { error: "Failed to kick participant" },
      { status: 500 }
    );
  }
}

