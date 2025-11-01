import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

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

    // Try to write to file system (works on Railway, not on Vercel)
    try {
      const dir = path.join(process.cwd(), "public", "jeet-cards");
      await fs.mkdir(dir, { recursive: true });
      const ext = file.type === "image/jpeg" ? ".jpg" : ".png";
      const filename = `card-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
      const filepath = path.join(dir, filename);
      await fs.writeFile(filepath, buffer);

      const publicPath = `/jeet-cards/${filename}`;
      const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
      const origin = configured || new URL(request.url).origin;
      const absoluteUrl = `${origin}${publicPath}`;
      return NextResponse.json({ url: absoluteUrl, path: publicPath });
    } catch (fsError) {
      // File system write failed (Vercel) - upload to Imgur for short link
      console.log("Filesystem write failed, trying Imgur upload");
      
      try {
        const base64 = buffer.toString("base64");
        const imgurResponse = await fetch('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            'Authorization': 'Client-ID 546c25a59c58ad7',
          },
          body: JSON.stringify({ image: base64 }),
        });

        if (imgurResponse.ok) {
          const imgurData = await imgurResponse.json();
          if (imgurData.success && imgurData.data?.link) {
            return NextResponse.json({ url: imgurData.data.link, path: null });
          }
        }
        console.error("Imgur upload failed:", await imgurResponse.text());
      } catch (imgurError) {
        console.error("Imgur error:", imgurError);
      }

      // Final fallback: return error
      return NextResponse.json({ 
        error: "Share not supported on this platform. Please use Download instead." 
      }, { status: 400 });
    }
  } catch (e: any) {
    console.error("Jeet card upload error:", e);
    return NextResponse.json({ error: "Failed to save image", detail: e?.message }, { status: 500 });
  }
}


