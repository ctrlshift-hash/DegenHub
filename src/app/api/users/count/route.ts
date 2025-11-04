import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/users/count - Get total user count (excluding guests and anon users)
// This endpoint works on Vercel production - it uses your production DATABASE_URL
export async function GET(request: NextRequest) {
  try {
    // Count all registered users - include wallet users (anon_*), exclude only guest users
    const count = await prisma.user.count({
      where: {
        AND: [
          // Exclude guest users (created for anonymous sessions)
          { username: { not: { startsWith: "guest_" } } },
          // Exclude users named exactly "guest"
          { username: { not: "guest" } },
          // Include anon_* users (wallet-only users) - they are real members
        ],
      },
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
