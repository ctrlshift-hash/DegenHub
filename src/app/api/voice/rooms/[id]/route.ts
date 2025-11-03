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

    // Check if room exists and user is the host - use select to avoid isClosed column
    const room = await prisma.voiceRoom.findUnique({
      where: { id },
      select: {
        id: true,
        hostId: true,
        participants: {
          where: { leftAt: null },
          select: {
            id: true,
            userId: true,
            roomId: true,
            leftAt: true,
          },
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

    // Mark all active participants as left (host can always delete, even with participants)
    const activeParticipants = room.participants.filter((p) => !p.leftAt);
    if (activeParticipants.length > 0) {
      await prisma.roomParticipant.updateMany({
        where: {
          roomId: id,
          leftAt: null,
        },
        data: {
          leftAt: new Date(),
        },
      });
    }

    // Delete the room using raw SQL to avoid isClosed column issues
    // Cascades will still work via database foreign key constraints
    try {
      await prisma.$executeRaw`DELETE FROM voice_rooms WHERE id = ${id}`;
    } catch (rawError: any) {
      // If raw SQL fails, try Prisma delete as fallback
      console.warn("Raw SQL delete failed, trying Prisma delete:", rawError);
      await prisma.voiceRoom.delete({
        where: { id },
      });
    }

    // Note: We don't delete the Daily.co room via API
    // Daily.co rooms expire automatically after inactivity
    // If you want to force delete, you'd need to call Daily.co's DELETE /rooms/{room_name} endpoint

    return NextResponse.json({ success: true, message: "Room deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting room:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });
    return NextResponse.json(
      { 
        error: "Failed to delete room",
        details: error.message || String(error),
        ...(process.env.NODE_ENV === "development" && {
          code: error.code,
          meta: error.meta,
        }),
      },
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
        coHosts: {
          select: {
            userId: true,
            user: {
              select: {
                id: true,
                username: true,
                walletAddress: true,
              },
            },
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
        isClosed: (room as any).isClosed ?? false, // Default to false if column doesn't exist yet
        maxParticipants: room.maxParticipants,
        speakerMode: room.speakerMode,
        createdAt: room.createdAt,
        host: room.host,
        coHosts: room.coHosts || [],
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
