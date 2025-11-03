import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/getUser";

// POST /api/voice/rooms/bulk-delete - Delete all rooms except specified ones
// This is a cleanup endpoint to remove test rooms
export async function POST(request: NextRequest) {
  try {
    const { user, userId } = await getUserFromRequest(request);
    const body = await request.json();
    const { keepRoomNames = [] } = body; // Array of room names to keep

    // Find all rooms
    const allRooms = await prisma.voiceRoom.findMany({
      select: {
        id: true,
        name: true,
        hostId: true,
      },
    });

    // Filter rooms to delete (all except those in keepRoomNames)
    const roomsToDelete = allRooms.filter(
      (room) => !keepRoomNames.includes(room.name)
    );

    if (roomsToDelete.length === 0) {
      return NextResponse.json({
        message: "No rooms to delete",
        deleted: 0,
      });
    }

    // Mark all participants as left for rooms being deleted
    const roomIdsToDelete = roomsToDelete.map((r) => r.id);
    await prisma.roomParticipant.updateMany({
      where: {
        roomId: { in: roomIdsToDelete },
        leftAt: null,
      },
      data: {
        leftAt: new Date(),
      },
    });

    // Delete all rooms except the ones to keep
    const deleteResult = await prisma.voiceRoom.deleteMany({
      where: {
        id: { in: roomIdsToDelete },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Deleted ${deleteResult.count} room(s)`,
      deleted: deleteResult.count,
      kept: keepRoomNames,
    });
  } catch (error: any) {
    console.error("Error in bulk delete:", error);
    return NextResponse.json(
      { error: "Failed to delete rooms" },
      { status: 500 }
    );
  }
}

