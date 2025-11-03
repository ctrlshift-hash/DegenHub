import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/getUser";

// POST /api/voice/rooms/[id]/reaction - Send reaction (raise hand, emoji, etc.)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const { userId } = await getUserFromRequest(request);
    const body = await request.json();
    const { reaction } = body; // "👋", "👍", "👎", etc.

    if (!reaction) {
      return NextResponse.json(
        { error: "reaction is required" },
        { status: 400 }
      );
    }

    // Check if user is in the room
    const participant = await prisma.roomParticipant.findFirst({
      where: {
        roomId,
        userId,
        leftAt: null,
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "You are not in this room" },
        { status: 403 }
      );
    }

    // Log reaction to room history (temporary, could use Daily.co chat instead)
    await prisma.roomHistory.create({
      data: {
        roomId,
        userId,
        action: "reaction",
        details: JSON.stringify({ reaction }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Reaction sent",
    });
  } catch (error: any) {
    console.error("Error sending reaction:", error);
    return NextResponse.json(
      { error: "Failed to send reaction" },
      { status: 500 }
    );
  }
}

