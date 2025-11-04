import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/users/count - Get total user count (wallet or email users, exclude guest users)
// This endpoint works on Vercel production - it uses your production DATABASE_URL
export async function GET(request: NextRequest) {
  try {
    // Count users: ONLY wallet users (anon_*) and email users, exclude guest users
    // Guests don't count as users - that's what website visitors is for
    const count = await prisma.user.count({
      where: {
        AND: [
          // Exclude guest users (created for anonymous sessions without wallets)
          { username: { not: { startsWith: "guest_" } } },
          { username: { not: "guest" } },
          // Include anon_* (wallet users) and all email users
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
