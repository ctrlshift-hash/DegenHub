import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/getUser";

// POST /api/voice/rooms/admin-delete - Admin delete rooms by name
export async function POST(request: NextRequest) {
  try {
    const { user } = await getUserFromRequest(request);
    
    // Check admin status
    const isAdmin = process.env.ADMIN_EMAIL && (
      user?.email === process.env.ADMIN_EMAIL ||
      user?.walletAddress === process.env.ADMIN_WALLET_ADDRESS
    );
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { roomNames } = body; // Array of room names to delete
    
    if (!roomNames || !Array.isArray(roomNames)) {
      return NextResponse.json(
        { error: "roomNames array is required" },
        { status: 400 }
      );
    }

    const deletedRooms = [];
    const errors = [];

    for (const roomName of roomNames) {
      try {
        // Find rooms by name
        const rooms = await prisma.voiceRoom.findMany({
          where: { name: roomName },
          select: {
            id: true,
            name: true,
            hostId: true,
          },
        });

        for (const room of rooms) {
          // Mark all participants as left
          await prisma.roomParticipant.updateMany({
            where: {
              roomId: room.id,
              leftAt: null,
            },
            data: {
              leftAt: new Date(),
            },
          });

          // Delete the room
          try {
            await prisma.$executeRaw`DELETE FROM voice_rooms WHERE id = ${room.id}`;
            deletedRooms.push({ id: room.id, name: room.name });
          } catch (rawError: any) {
            await prisma.voiceRoom.delete({
              where: { id: room.id },
            });
            deletedRooms.push({ id: room.id, name: room.name });
          }
        }
      } catch (error: any) {
        errors.push({ roomName, error: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      deleted: deletedRooms,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Error in admin delete:", error);
    return NextResponse.json(
      { error: "Failed to delete rooms", details: error.message },
      { status: 500 }
    );
  }
}
