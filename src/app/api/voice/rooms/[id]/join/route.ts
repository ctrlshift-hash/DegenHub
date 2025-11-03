import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/getUser";
import { generateDailyToken } from "@/lib/daily";

// POST /api/voice/rooms/[id]/join - Join a room (get Daily.co token)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, userId } = await getUserFromRequest(request);

    // Check if room exists
    const room = await prisma.voiceRoom.findUnique({
      where: { id },
      include: {
        participants: {
          where: { leftAt: null },
        },
        bannedUsers: {
          where: { userId },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Check if room is closed (column may not exist yet if migration hasn't run)
    if ((room as any).isClosed === true) {
      return NextResponse.json(
        { error: "Room is closed - no new participants can join" },
        { status: 403 }
      );
    }

    // Check if user is banned
    if (room.bannedUsers.length > 0) {
      return NextResponse.json(
        { error: "You are banned from this room" },
        { status: 403 }
      );
    }

    // Check if room is full
    const activeParticipants = room.participants.filter((p) => !p.leftAt);
    if (activeParticipants.length >= room.maxParticipants) {
      return NextResponse.json(
        { error: "Room is full" },
        { status: 400 }
      );
    }

    // Check if user is already in the room
    const existingParticipant = await prisma.roomParticipant.findUnique({
      where: {
        roomId_userId: {
          roomId: id,
          userId: userId,
        },
      },
    });

    // Determine if user should be a speaker (OPEN mode = always true, NOMINATED = false by default)
    const isSpeaker = room.speakerMode === "OPEN" ? true : false;

    // Generate Daily.co token FIRST (before DB operations to speed up)
    let token: string | null = null;
    if (room.dailyRoomUrl) {
      const urlParts = room.dailyRoomUrl.split("/");
      const roomName = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2] || "";
      
      if (roomName) {
        const dailyToken = await generateDailyToken(roomName, userId, user.username);
        if (dailyToken) {
          token = dailyToken.token;
        }
      }
    }

    // Update/create participant in parallel with history (don't wait for history)
    let participant;
    const participantPromise = existingParticipant && existingParticipant.leftAt
      ? prisma.roomParticipant.update({
          where: { id: existingParticipant.id },
          data: {
            joinedAt: new Date(),
            leftAt: null,
            isSpeaker,
          },
        })
      : !existingParticipant
      ? prisma.roomParticipant.create({
          data: {
            roomId: id,
            userId: userId,
            isSpeaker,
          },
        })
      : Promise.resolve(existingParticipant);

    // Don't wait for history - fire and forget for speed
    const historyPromise = prisma.roomHistory.create({
      data: {
        roomId: id,
        userId: userId,
        action: "joined",
        details: JSON.stringify({ speakerMode: room.speakerMode, isSpeaker }),
      },
    }).catch(err => console.error("History log failed (non-critical):", err));

    participant = await participantPromise;

    return NextResponse.json({
      room: {
        id: room.id,
        name: room.name,
        dailyRoomUrl: room.dailyRoomUrl,
        speakerMode: room.speakerMode,
      },
      participant: {
        id: participant.id,
        joinedAt: participant.joinedAt,
        isSpeaker: participant.isSpeaker,
      },
      token: token,
    });
  } catch (error: any) {
    console.error("Error joining room:", error);
    return NextResponse.json(
      { error: "Failed to join room" },
      { status: 500 }
    );
  }
}
