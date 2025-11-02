import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/getUser";

// GET /api/voice/rooms/[id] - Get room details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const room = await prisma.voiceRoom.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            username: true,
            profileImage: true,
            walletAddress: true,
            isVerified: true,
          },
        },
        participants: {
          where: { leftAt: null },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                profileImage: true,
                walletAddress: true,
                isVerified: true,
              },
            },
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json({
      room: {
        id: room.id,
        name: room.name,
        description: room.description,
        isPublic: room.isPublic,
        maxParticipants: room.maxParticipants,
        createdAt: room.createdAt,
        host: room.host,
        participants: room.participants.map((p) => ({
          id: p.id,
          user: p.user,
          joinedAt: p.joinedAt,
        })),
        participantCount: room.participants.length,
      },
    });
  } catch (error: any) {
    console.error("Error fetching room:", error);
    return NextResponse.json(
      { error: "Failed to fetch room" },
      { status: 500 }
    );
  }
}
