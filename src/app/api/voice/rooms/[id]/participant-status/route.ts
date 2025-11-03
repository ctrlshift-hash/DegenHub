import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/getUser";

// GET /api/voice/rooms/[id]/participant-status - Get current user's participant status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get("userId");
    
    // If userId is provided in query, use it; otherwise get from request
    let userId: string;
    if (queryUserId) {
      userId = queryUserId;
    } else {
      const userData = await getUserFromRequest(request);
      userId = userData.userId;
    }

    const participant = await prisma.roomParticipant.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
      select: {
        isSpeaker: true,
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      isSpeaker: participant.isSpeaker,
    });
  } catch (error: any) {
    console.error("Error getting participant status:", error);
    return NextResponse.json(
      { error: "Failed to get participant status" },
      { status: 500 }
    );
  }
}

