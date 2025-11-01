import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Validate file size (max 10MB for jeet cards)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "Image must be less than 10MB" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Save to database
    const card = await prisma.jeetCard.create({
      data: { imageUrl: dataUrl }
    });

    // Return short URL
    const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
    const origin = configured || new URL(request.url).origin;
    const absoluteUrl = `${origin}/jeet-cards/${card.id}`;
    
    return NextResponse.json({ url: absoluteUrl, path: null });
  } catch (e: any) {
    console.error("Jeet card upload error:", e);
    return NextResponse.json({ error: "Failed to save image", detail: e?.message }, { status: 500 });
  }
}


