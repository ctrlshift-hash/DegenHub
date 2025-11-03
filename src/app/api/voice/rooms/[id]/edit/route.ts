import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/getUser";

// PATCH /api/voice/rooms/[id]/edit - Edit room settings (host only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const { userId } = await getUserFromRequest(request);
    const body = await request.json();
    const { name, description, category, maxParticipants, speakerMode, voiceQuality, isPublic } = body;

    // Check if room exists and user is host
    const room = await prisma.voiceRoom.findUnique({
      where: { id: roomId },
      include: { host: { select: { id: true } } },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.hostId !== userId) {
      return NextResponse.json(
        { error: "Only the host can edit room settings" },
        { status: 403 }
      );
    }

    // Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (category !== undefined) updateData.category = category?.trim() || null;
    if (maxParticipants !== undefined) updateData.maxParticipants = maxParticipants;
    if (speakerMode !== undefined) updateData.speakerMode = speakerMode;
    if (voiceQuality !== undefined) updateData.voiceQuality = voiceQuality;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    await prisma.voiceRoom.update({
      where: { id: roomId },
      data: updateData,
    });

    // Log to room history
    await prisma.roomHistory.create({
      data: {
        roomId,
        userId,
        action: "room_edited",
        details: JSON.stringify(updateData),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Room updated successfully",
    });
  } catch (error: any) {
    console.error("Error editing room:", error);
    return NextResponse.json(
      { error: "Failed to edit room" },
      { status: 500 }
    );
  }
}

