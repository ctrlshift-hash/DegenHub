import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/voice/rooms/[id]/history - Get room history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    const history = await prisma.roomHistory.findMany({
      where: { roomId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({
      history: history.map((h) => ({
        id: h.id,
        action: h.action,
        details: h.details ? JSON.parse(h.details) : null,
        createdAt: h.createdAt,
        user: h.user ? {
          id: h.user.id,
          username: h.user.username,
          profileImage: h.user.profileImage,
        } : null,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching room history:", error);
    return NextResponse.json(
      { error: "Failed to fetch room history" },
      { status: 500 }
    );
  }
}

