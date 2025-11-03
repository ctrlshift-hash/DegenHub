import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/getUser";

// DELETE /api/voice/rooms/[id] - Delete a room (host only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, userId } = await getUserFromRequest(request);

    // Check if room exists and user is the host
    const room = await prisma.voiceRoom.findUnique({
      where: { id },
      include: {
        host: {
          select: { id: true },
        },
        participants: {
          where: { leftAt: null },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Only host can delete the room
    if (room.hostId !== userId) {
      return NextResponse.json(
        { error: "Only the room host can delete this room" },
        { status: 403 }
      );
    }

    // Check if there are active participants
    const activeParticipants = room.participants.filter((p) => !p.leftAt);
    if (activeParticipants.length > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete room. There are ${activeParticipants.length} active participant(s). Ask them to leave first.`,
        },
        { status: 400 }
      );
    }

    // Delete the room (cascades to participants via Prisma schema)
    await prisma.voiceRoom.delete({
      where: { id },
    });

    // Note: We don't delete the Daily.co room via API
    // Daily.co rooms expire automatically after inactivity
    // If you want to force delete, you'd need to call Daily.co's DELETE /rooms/{room_name} endpoint

    return NextResponse.json({ success: true, message: "Room deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting room:", error);
    return NextResponse.json(
      { error: "Failed to delete room" },
      { status: 500 }
    );
  }
}

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
