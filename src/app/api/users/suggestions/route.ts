import { NextRequest, NextResponse } from "next/server";
import { FEATURED_SUGGESTIONS } from "@/lib/featured-users";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const walletHeader = request.headers.get("x-wallet-address") || request.headers.get("X-Wallet-Address");

    // Support both email and wallet authentication
    let userId: string | null = null;

    if (session?.user?.id) {
      userId = session.user.id;
    } else if (walletHeader) {
      const walletUser = await prisma.user.findFirst({ where: { walletAddress: walletHeader } });
      if (walletUser) {
        userId = walletUser.id;
      }
    }

    // Get users that the current user is already following
    const followingIds = userId
      ? (
          await prisma.follow.findMany({
            where: { followerId: userId },
            select: { followingId: true },
          })
        ).map((f) => f.followingId)
      : [];

    // Get suggested users:
    // 1. Users not followed by current user
    // 2. Exclude current user and guest/anonymous users
    // 3. ONLY VERIFIED USERS (isVerified = true)
    // 4. Order by activity (most posts) and recent activity
    // LIMIT: Only fetch 30 candidates (enough for random selection of 3)
    const candidateSuggestions = await prisma.user.findMany({
      where: {
        AND: [
          { id: { notIn: [...followingIds, userId].filter(Boolean) as string[] } },
          { username: { not: { startsWith: "anon_" } } }, // Exclude anonymous users
          { username: { not: "guest" } }, // Exclude guest user
          { username: { not: { startsWith: "anon" } } }, // Exclude anon users
          { isVerified: true }, // ONLY VERIFIED USERS
          // Only show verified (wallet OR email present)
          { OR: [ { walletAddress: { not: null } }, { email: { not: null } } ] },
        ],
      },
      select: {
        id: true,
        username: true,
        bio: true,
        profileImage: true,
        isVerified: true,
        email: true,
        walletAddress: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
          },
        },
      },
      orderBy: [
        { posts: { _count: "desc" } },
        { createdAt: "desc" },
      ],
      take: 30, // Only fetch 30 candidates for performance
    });

    // Randomly select 3 users from the candidates
    const shuffled = candidateSuggestions.sort(() => 0.5 - Math.random());
    const suggestions = shuffled.slice(0, 3);

    // Batch get follow status for all suggestions (much faster than N queries)
    let followingMap: Record<string, boolean> = {};
    if (userId && suggestions.length > 0) {
      const suggestionIds = suggestions.map(u => u.id);
      const followRecords = await prisma.follow.findMany({
        where: {
          followerId: userId,
          followingId: { in: suggestionIds },
        },
        select: { followingId: true },
      });
      followRecords.forEach(f => followingMap[f.followingId] = true);
    }

    // Map suggestions with follow status
    let suggestionsWithFollowStatus = suggestions.map((user) => {
      const isFollowing = followingMap[user.id] || false;

      return {
        id: user.id,
        username: user.username,
        bio: user.bio,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        email: user.email,
        walletAddress: user.walletAddress,
        followersCount: user._count?.followers || 0,
        postsCount: user._count?.posts || 0,
        isFollowing,
      };
    });

    // Prepend featured suggestions (e.g., gold-verified accounts) if not duplicates
    for (const featured of FEATURED_SUGGESTIONS) {
      const exists = suggestionsWithFollowStatus.some(
        (u) => u.username.toLowerCase() === featured.username.toLowerCase()
      );
      if (!exists) {
        suggestionsWithFollowStatus.unshift({
          id: featured.id,
          username: featured.username,
          bio: featured.bio || null,
          profileImage: featured.profileImage,
          isVerified: true,
          email: featured.email || "featured@degenhub.local",
          walletAddress: featured.walletAddress || null,
          followersCount: featured.followersCount || 0,
          postsCount: 0,
          isFollowing: false,
          // extra flag for UI
          isGoldVerified: true as unknown as any,
        } as any);
      }
    }

    const response = NextResponse.json({ suggestions: suggestionsWithFollowStatus });
    
    // Cache for 30 seconds to reduce database load (who to follow doesn't need to be super fresh)
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
    
    return response;
  } catch (error: any) {
    console.error("Suggestions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions", detail: error.message },
      { status: 500 }
    );
  }
}

