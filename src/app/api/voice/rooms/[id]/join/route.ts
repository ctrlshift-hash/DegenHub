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

    let participant;
    if (existingParticipant && existingParticipant.leftAt) {
      // Rejoin
      participant = await prisma.roomParticipant.update({
        where: { id: existingParticipant.id },
        data: {
          joinedAt: new Date(),
          leftAt: null,
          isSpeaker,
        },
      });
    } else if (!existingParticipant) {
      // First time joining
      participant = await prisma.roomParticipant.create({
        data: {
          roomId: id,
          userId: userId,
          isSpeaker,
        },
      });
    } else {
      participant = existingParticipant;
    }

    // Log to room history
    await prisma.roomHistory.create({
      data: {
        roomId: id,
        userId: userId,
        action: "joined",
        details: JSON.stringify({ speakerMode: room.speakerMode, isSpeaker }),
      },
    });

    // Generate Daily.co token
    let token: string | null = null;
    if (room.dailyRoomUrl) {
      // Extract room name from URL (format: https://domain.daily.co/room-name)
      const urlParts = room.dailyRoomUrl.split("/");
      const roomName = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2] || "";
      
      console.log("Generating token for room:", roomName, "URL:", room.dailyRoomUrl);
      
      const dailyToken = await generateDailyToken(
        roomName,
        userId,
        user.username
      );
      
      if (!dailyToken) {
        console.error("Failed to generate Daily.co token");
      } else {
        token = dailyToken.token;
      }
    } else {
      console.error("Room has no dailyRoomUrl:", room.id);
    }

    return NextResponse.json({
      room: {
        id: room.id,
        name: room.name,
        dailyRoomUrl: room.dailyRoomUrl,
      },
      participant: {
        id: participant.id,
        joinedAt: participant.joinedAt,
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
