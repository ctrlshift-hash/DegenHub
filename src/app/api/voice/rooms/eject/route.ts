import { NextRequest, NextResponse } from "next/server";
import { ejectParticipantFromDailyRoom } from "@/lib/daily";

// POST /api/voice/rooms/eject - Eject participant from Daily.co room
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomUrl, sessionId } = body;

    if (!roomUrl || !sessionId) {
      return NextResponse.json(
        { error: "roomUrl and sessionId are required" },
        { status: 400 }
      );
    }

    // Extract room name from URL (format: https://domain.daily.co/room-name)
    const urlParts = roomUrl.split("/");
    const roomName = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2] || "";

    if (!roomName) {
      return NextResponse.json(
        { error: "Invalid room URL" },
        { status: 400 }
      );
    }

    const success = await ejectParticipantFromDailyRoom(roomName, sessionId);

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Participant ejected from Daily.co room",
      });
    } else {
      return NextResponse.json(
        { error: "Failed to eject participant from Daily.co" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error ejecting participant:", error);
    return NextResponse.json(
      { error: "Failed to eject participant" },
      { status: 500 }
    );
  }
}

