import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const card = await prisma.jeetCard.findUnique({
      where: { id }
    });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Parse data URL and return as image
    const dataUrl = card.imageUrl;
    const matches = dataUrl.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
    
    if (!matches) {
      return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
    }

    const contentType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Return as PNG/JPEG image
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (e: any) {
    console.error("Error fetching jeet card:", e);
    return NextResponse.json({ error: "Failed to fetch card" }, { status: 500 });
  }
}

