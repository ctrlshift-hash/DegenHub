import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const apiKey = process.env.DAILY_API_KEY || "";
  
  return NextResponse.json({
    apiKeyExists: !!apiKey,
    apiKeyLength: apiKey.length,
    apiKeyPrefix: apiKey.substring(0, 10) + "...",
    allEnvKeys: Object.keys(process.env).filter(k => k.includes("DAILY") || k.includes("API")),
    message: apiKey ? "✅ API key is loaded!" : "❌ API key is NOT loaded!",
  });
}

