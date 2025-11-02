import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/getUser";
import { createDailyRoom } from "@/lib/daily";

// GET /api/voice/rooms - List all public rooms
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const rooms = await prisma.voiceRoom.findMany({
      where: { isPublic: true },
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
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    const formattedRooms = rooms.map((room) => ({
      id: room.id,
      name: room.name,
      description: room.description,
      isPublic: room.isPublic,
      maxParticipants: room.maxParticipants,
      createdAt: room.createdAt,
      host: room.host,
      participantCount: room.participants.filter((p) => !p.leftAt).length,
    }));

    return NextResponse.json({
      rooms: formattedRooms,
      pagination: {
        limit,
        offset,
        total: await prisma.voiceRoom.count({ where: { isPublic: true } }),
      },
    });
  } catch (error: any) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}

// POST /api/voice/rooms - Create a new room
export async function POST(request: NextRequest) {
  try {
    // DEBUG: Check if API key is loaded
    const apiKeyCheck = process.env.DAILY_API_KEY || "";
    console.log("🔍 API Key Check in route handler:");
    console.log("- apiKeyExists:", !!apiKeyCheck);
    console.log("- apiKeyLength:", apiKeyCheck.length);
    console.log("- apiKeyPrefix:", apiKeyCheck.substring(0, 10) + "...");
    console.log("- All DAILY keys:", Object.keys(process.env).filter(k => k.includes("DAILY")));
    
    if (!apiKeyCheck || apiKeyCheck.length === 0) {
      return NextResponse.json(
        { 
          error: "DAILY_API_KEY not found. Make sure .env.local exists in project root (same folder as package.json) with DAILY_API_KEY=your_key (no quotes, no spaces around =)",
          debug: {
            envKeys: Object.keys(process.env).filter(k => k.includes("DAILY") || k.includes("API")),
            processEnv: typeof process.env,
          }
        },
        { status: 500 }
      );
    }
    
    const { user, userId } = await getUserFromRequest(request);
    const body = await request.json();
    const { name, description, isPublic, maxParticipants } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Room name is required" },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: "Room name must be 100 characters or less" },
        { status: 400 }
      );
    }

    // Create Daily.co room
    const dailyRoom = await createDailyRoom(name.trim(), maxParticipants || 50);
    
    if (!dailyRoom || !dailyRoom.url) {
      // Check if API key is loaded
      const apiKeyCheck = process.env.DAILY_API_KEY || "";
      const errorMessage = !apiKeyCheck 
        ? "DAILY_API_KEY not found in environment. Make sure it's in .env.local and you restarted the server."
        : "Daily.co API returned null. Check server console for API error (HTTP status code and error message).";
      
      return NextResponse.json(
        { 
          error: errorMessage,
          debug: {
            apiKeyLoaded: !!apiKeyCheck,
            apiKeyLength: apiKeyCheck.length,
          }
        },
        { status: 500 }
      );
    }
    
    const room = await prisma.voiceRoom.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        isPublic: isPublic !== false,
        maxParticipants: maxParticipants || 50,
        hostId: userId,
        dailyRoomUrl: dailyRoom.url,
      },
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
      },
    });

    return NextResponse.json({
      room: {
        id: room.id,
        name: room.name,
        description: room.description,
        isPublic: room.isPublic,
        maxParticipants: room.maxParticipants,
        createdAt: room.createdAt,
        host: room.host,
        participantCount: 0,
      },
    });
  } catch (error: any) {
    console.error("❌ Error creating room:", error);
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      cause: error?.cause,
    });
    return NextResponse.json(
      { 
        error: error?.message || "Failed to create room",
        details: process.env.NODE_ENV === "development" ? error?.stack : undefined,
      },
      { status: 500 }
    );
  }
}
