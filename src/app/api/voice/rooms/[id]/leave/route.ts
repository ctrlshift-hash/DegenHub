import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/getUser";

// POST /api/voice/rooms/[id]/leave - Leave a room
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await getUserFromRequest(request);

    const participant = await prisma.roomParticipant.findUnique({
      where: {
        roomId_userId: {
          roomId: id,
          userId: userId,
        },
      },
    });

    if (!participant || participant.leftAt) {
      return NextResponse.json(
        { error: "You are not in this room" },
        { status: 400 }
      );
    }

    await prisma.roomParticipant.update({
      where: { id: participant.id },
      data: {
        leftAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error leaving room:", error);
    return NextResponse.json(
      { error: "Failed to leave room" },
      { status: 500 }
    );
  }
}
