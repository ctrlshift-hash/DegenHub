import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Helper function to get user from request (supports email/wallet/guest)
 * Returns userId and user data
 * @param request - The NextRequest object
 * @param walletAddress - Optional wallet address from request body (if not in headers)
 */
export async function getUserFromRequest(request: NextRequest, walletAddress?: string | null) {
  const session = await getServerSession(authOptions);
  
  // Check for email-authenticated user
  if (session?.user?.id) {
    const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    return {
      userId: session.user.id,
      user: {
        id: session.user.id,
        username: session.user.username || "user",
        email: dbUser?.email ?? null,
        walletAddress: dbUser?.walletAddress ?? null,
        isVerified: session.user.isVerified || false,
        profileImage: dbUser?.profileImage ?? null,
      },
    };
  }
  
  // Check for wallet-authenticated user
  // Priority: provided walletAddress parameter > header > null
  const walletHeader = walletAddress || request.headers.get("x-wallet-address") || request.headers.get("X-Wallet-Address");
  if (walletHeader) {
    let walletUser = await prisma.user.findFirst({ where: { walletAddress: walletHeader } });
    if (!walletUser) {
      const anonName = `anon_${walletHeader.slice(0, 6)}`;
      walletUser = await prisma.user.create({
        data: { username: anonName, walletAddress: walletHeader, email: null, password: null, isVerified: true },
      });
    }
    return {
      userId: walletUser.id,
      user: {
        id: walletUser.id,
        username: walletUser.username,
        email: walletUser.email,
        walletAddress: walletUser.walletAddress,
        isVerified: walletUser.isVerified,
        profileImage: walletUser.profileImage ?? null,
      },
    };
  }
  
  // Guest user - create a unique guest user for each session
  // Use a unique identifier to ensure each guest gets their own account
  // We'll use a combination of timestamp and random string for uniqueness
  const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const guestUser = await prisma.user.create({
    data: { 
      username: guestId, 
      email: null, 
      password: null, 
      isVerified: false 
    },
  });
  
  return {
    userId: guestUser.id,
    user: {
      id: guestUser.id,
      username: guestUser.username,
      email: guestUser.email,
      walletAddress: guestUser.walletAddress,
      isVerified: guestUser.isVerified,
      profileImage: guestUser.profileImage ?? null,
    },
  };
}
