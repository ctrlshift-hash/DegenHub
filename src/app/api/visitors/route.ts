import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/visitors - Get unique visitor count
export async function GET(request: NextRequest) {
  try {
    // Count unique visitors (unique IP addresses)
    const count = await prisma.visitor.count();
    
    const response = NextResponse.json({
      count,
      timestamp: new Date().toISOString(),
    });

    // Cache for 10 seconds
    response.headers.set('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=30');
    
    return response;
  } catch (error: any) {
    console.error("Error fetching visitor count:", error);
    return NextResponse.json(
      { error: "Failed to fetch visitor count" },
      { status: 500 }
    );
  }
}

// POST /api/visitors - Track a visitor
export async function POST(request: NextRequest) {
  try {
    // Get IP address from request
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ipAddress = forwarded?.split(",")[0]?.trim() || realIp || request.ip || "unknown";
    
    // Get user agent
    const userAgent = request.headers.get("user-agent") || "unknown";
    
    // Check if this IP already exists
    const existing = await prisma.visitor.findUnique({
      where: { ipAddress },
    });
    
    if (!existing) {
      // New unique visitor - create record
      await prisma.visitor.create({
        data: {
          ipAddress,
          userAgent,
        },
      });
    } else {
      // Update visit timestamp for existing visitor
      await prisma.visitor.update({
        where: { ipAddress },
        data: { visitedAt: new Date() },
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error tracking visitor:", error);
    return NextResponse.json(
      { error: "Failed to track visitor" },
      { status: 500 }
    );
  }
}

