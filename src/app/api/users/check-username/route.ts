import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/users/check-username?username=xxx - Check if username is available
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username parameter is required" },
        { status: 400 }
      );
    }

    // Validate username format
    if (username.length < 3) {
      return NextResponse.json({
        available: false,
        reason: "Username must be at least 3 characters",
      });
    }

    if (username.length > 30) {
      return NextResponse.json({
        available: false,
        reason: "Username must be 30 characters or less",
      });
    }

    // Check for invalid characters (alphanumeric and underscores only)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({
        available: false,
        reason: "Username can only contain letters, numbers, and underscores",
      });
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: username },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json({
        available: false,
        username: username,
        reason: `The username "${username}" is already taken. Please choose a different username.`,
      });
    }

    return NextResponse.json({
      available: true,
      username: username,
    });
  } catch (error: any) {
    console.error("Error checking username:", error);
    return NextResponse.json(
      { error: "Failed to check username availability" },
      { status: 500 }
    );
  }
}
