import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/getUser";

// POST /api/voice/rooms/[id]/close - Toggle room closed/open (host/co-host only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const { userId } = await getUserFromRequest(request);
    const body = await request.json();
    const { isClosed } = body;

    if (typeof isClosed !== "boolean") {
      return NextResponse.json(
        { error: "isClosed must be a boolean" },
        { status: 400 }
      );
    }

    // Check if room exists and user is host or co-host
    const room = await prisma.voiceRoom.findUnique({
      where: { id: roomId },
      include: {
        host: { 
          select: { 
            id: true,
            username: true 
          } 
        },
        coHosts: {
          where: { userId },
        },
        participants: {
          orderBy: { joinedAt: "asc" },
          select: {
            userId: true,
            joinedAt: true,
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    let isHost = room.hostId === userId;
    let isCoHost = room.coHosts.length > 0;

    // For guest hosts, check if they're the first participant (fallback)
    // Since getUserFromRequest creates a new guest userId each time, we need to check differently
    // If the host is a guest and the requesting user is also a guest (no session/wallet),
    // we'll check if they're the first participant by seeing if there's only one participant
    // or by checking if the first participant is a guest user
    if (!isHost && !isCoHost && room.host.username?.startsWith("guest_")) {
      // Check if current user is the first participant (guest hosts are usually first)
      if (room.participants.length > 0) {
        const firstParticipant = room.participants[0];
        // If userId matches first participant, they're the host
        if (firstParticipant.userId === userId) {
          isHost = true;
        } else {
          // If getUserFromRequest created a new guest user, we need another way to verify
          // Check if the requesting user has no session/wallet (is a guest)
          // and if there's only one participant or the first participant is a guest
          const session = await getServerSession(authOptions);
          const walletHeader = request.headers.get("x-wallet-address") || request.headers.get("X-Wallet-Address");
          const isGuestRequest = !session?.user && !walletHeader;
          
          if (isGuestRequest && room.participants.length > 0) {
            // For guest requests, check if first participant's user is also a guest
            const firstParticipantUser = await prisma.user.findUnique({
              where: { id: firstParticipant.userId },
              select: { username: true },
            });
            
            // If first participant is a guest and requesting user is also a guest,
            // allow them to close ONLY if there's only one participant (they're likely the host)
            // This is more secure than allowing any guest to close
            if (firstParticipantUser?.username?.startsWith("guest_") && room.participants.length === 1) {
              // Only allow if there's a single participant (likely the host)
              isHost = true;
            }
          }
        }
      }
    }

    if (!isHost && !isCoHost) {
      return NextResponse.json(
        { error: "Only host or co-host can close/open the room" },
        { status: 403 }
      );
    }

    // Update room (isClosed column may not exist yet if migration hasn't run)
    // Try to update, but handle gracefully if column doesn't exist
    let updatedRoom;
    try {
      updatedRoom = await prisma.voiceRoom.update({
        where: { id: roomId },
        data: { isClosed } as any, // Type assertion to allow missing column
      });
    } catch (error: any) {
      // If column doesn't exist, return success but with a warning
      if (error.message?.includes("isClosed") || error.code === "P2025") {
        return NextResponse.json({
          success: true,
          isClosed: isClosed,
          message: isClosed ? "Room closed feature not yet available (migration pending)" : "Room opened",
          warning: "Database migration needed for full functionality",
        });
      }
      throw error;
    }

    // Log to history
    await prisma.roomHistory.create({
      data: {
        roomId,
        userId,
        action: isClosed ? "room_closed" : "room_opened",
      },
    }).catch(err => console.error("History log failed (non-critical):", err));

    return NextResponse.json({
      success: true,
      isClosed: updatedRoom.isClosed,
      message: isClosed ? "Room closed - no new participants can join" : "Room opened - new participants can join",
    });
  } catch (error: any) {
    console.error("Error toggling room closed/open:", error);
    return NextResponse.json(
      { error: "Failed to toggle room status" },
      { status: 500 }
    );
  }
}

