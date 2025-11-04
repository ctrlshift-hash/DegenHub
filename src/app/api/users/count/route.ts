import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/users/count - Get total user count (all users regardless of username)
// This endpoint works on Vercel production - it uses your production DATABASE_URL
export async function GET(request: NextRequest) {
  try {
    // Count ALL users - wallet or email, doesn't matter the username
    const count = await prisma.user.count({
      // No exclusions - all users count
    });
    
    const response = NextResponse.json({
      count,
      timestamp: new Date().toISOString(),
    });

    // Cache for 10 seconds to reduce database load while keeping it relatively fresh
    // Vercel will cache this at the edge
    response.headers.set('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=30');
    
    return response;
  } catch (error: any) {
    console.error("Error fetching user count:", error);
    return NextResponse.json(
      { error: "Failed to fetch user count" },
      { status: 500 }
    );
  }
}
