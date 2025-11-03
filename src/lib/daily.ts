/**
 * Daily.co API helper functions
 * You'll need to set DAILY_API_KEY in your .env file
 */

// Get API key directly from process.env (works with both .env and .env.local)
const DAILY_API_URL = "https://api.daily.co/v1";

// Don't cache at module level - read fresh each time
export function getDailyApiKey(): string {
  return process.env.DAILY_API_KEY || "";
}

export interface DailyRoom {
  id: string;
  name: string;
  url: string;
  config: {
    max_participants: number;
    enable_chat: boolean;
    enable_prejoin_ui: boolean;
  };
}

export interface DailyToken {
  token: string;
  room: string;
}

/**
 * Create a Daily.co room
 */
/**
 * Sanitize room name for Daily.co API
 * Daily.co requires URL-safe room names (no spaces, special chars)
 */
function sanitizeRoomName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")           // Replace spaces with hyphens
    .replace(/[^a-z0-9\-]/g, "")      // Remove special characters except hyphens
    .replace(/-+/g, "-")              // Replace multiple hyphens with one
    .replace(/^-|-$/g, "")            // Remove leading/trailing hyphens
    || "room-" + Date.now();         // Fallback if name becomes empty
}

export async function createDailyRoom(name: string, maxParticipants: number = 50): Promise<DailyRoom | null> {
  // Read fresh from process.env each time
  const apiKey = getDailyApiKey();
  
  if (!apiKey || apiKey.length === 0) {
    console.error("❌ DAILY_API_KEY not found in createDailyRoom!");
    throw new Error("DAILY_API_KEY not found in environment. Check .env.local file format: DAILY_API_KEY=your_key (no quotes, no spaces)");
  }
  
  // Sanitize the room name for Daily.co (must be URL-safe)
  const sanitizedName = sanitizeRoomName(name);
  console.log(`✅ Creating Daily.co room: "${name}" -> "${sanitizedName}"`);

  try {
    const response = await fetch(`${DAILY_API_URL}/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        name: sanitizedName,
        properties: {
          max_participants: maxParticipants || 50, // Use requested limit or default to 50
          enable_chat: true,
          enable_prejoin_ui: false, // Disable prejoin UI to avoid camera prompts
          start_video_off: true,
          enable_screenshare: false,
          // Enable aggressive echo cancellation (like Discord)
          enable_echo_cancellation: true,
          enable_noise_suppression: true,
          enable_automatic_gain_control: true,
        },
      }),
    });

    const responseText = await response.text();
    console.log("📥 Daily.co API Response Status:", response.status);
    console.log("📥 Daily.co API Response Body (first 500 chars):", responseText.substring(0, 500));

    if (!response.ok) {
      let error: any;
      try {
        error = JSON.parse(responseText);
      } catch {
        error = { message: responseText || "Unknown error" };
      }
      
      const errorMsg = error.error || error.message || error.info?.msg || JSON.stringify(error);
      console.error("❌ Daily.co API Error:", {
        status: response.status,
        statusText: response.statusText,
        error: error,
        errorMessage: errorMsg,
        roomName: sanitizedName,
        originalName: name,
        fullResponse: responseText,
      });
      
      // Return more detailed error info
      throw new Error(`Daily.co API error (${response.status}): ${errorMsg}`);
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error("❌ Failed to parse Daily.co response as JSON:", responseText);
      throw new Error("Daily.co returned invalid JSON response");
    }

    if (!result || !result.url) {
      console.error("❌ Daily.co response missing URL:", result);
      throw new Error("Daily.co response missing room URL");
    }

    console.log("✅ Daily.co room created successfully:", result.url);
    return result;
  } catch (error: any) {
    console.error("❌ Exception creating Daily.co room:", error);
    console.error("Error message:", error?.message || error);
    console.error("Error stack:", error?.stack);
    console.error("Error cause:", error?.cause);
    
    // Re-throw with more context so the route handler can see it
    throw new Error(`Daily.co room creation failed: ${error?.message || String(error)}`);
  }
}

/**
 * Generate a Daily.co meeting token for a user
 */
export async function generateDailyToken(
  roomName: string,
  userId: string,
  username: string
): Promise<DailyToken | null> {
  const apiKey = process.env.DAILY_API_KEY || "";
  
  if (!apiKey || apiKey.length === 0) {
    console.error("❌ DAILY_API_KEY not found in generateDailyToken!");
    return null;
  }

  try {
    const response = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_id: userId,
          user_name: username,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to generate Daily.co token:", error);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating Daily.co token:", error);
    return null;
  }
}
