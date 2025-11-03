import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/getUser";

function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[\w]+/g;
  const matches = text.match(hashtagRegex) || [];
  return [...new Set(matches.map(h => h.toLowerCase()))];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    const hashtag = searchParams.get("hashtag");

    // Bot usernames to exclude from feed
    const botUsernames = [
      "cryptodegen",
      "pumpsignal",
      "solbuilder",
      "nftcollector",
      "tradingalpha",
      "degenshark",
      "web3teacher",
      "memecoinking",
      "solstaker",
      "artblockchain",
    ];

    let whereClause: any = {
      user: {
        username: {
          notIn: botUsernames,
        },
      },
    };
    
    // Filter by hashtag if provided
    if (hashtag) {
      // Prisma doesn't support regex directly, so we'll filter after fetching
      // This is less efficient but works for now
      whereClause = {
        ...whereClause,
        content: { contains: "#" },
      };
    }

    // For hashtag filtering, fetch more posts to ensure we get enough after filtering
    // But cap at 200 to avoid huge queries
    const fetchLimit = hashtag ? Math.min(200, limit * 10) : limit;
    
    const posts = await prisma.post.findMany({
      skip: 0, // Always start from 0 for hashtag searches due to in-memory filtering
      take: fetchLimit,
      orderBy: { createdAt: "desc" },
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            walletAddress: true,
            isVerified: true,
            profileImage: true,
          },
        },
        _count: {
          select: {
            likes: true,
            reposts: true,
            comments: true,
          },
        },
      },
    });

    // Filter by hashtag in memory if needed
    let filteredPosts = posts;
    if (hashtag) {
      const normalizedHashtag = hashtag.toLowerCase().startsWith("#") 
        ? hashtag.toLowerCase() 
        : `#${hashtag.toLowerCase()}`;
      filteredPosts = posts.filter(post => {
        const postHashtags = extractHashtags(post.content);
        return postHashtags.includes(normalizedHashtag);
      });
      // Apply pagination after filtering
      filteredPosts = filteredPosts.slice(skip, skip + limit);
    }

    // Get user's likes and reposts if authenticated
    const session = await getServerSession(authOptions);
    let userLikes: string[] = [];
    let userReposts: string[] = [];
    let userDownvotes: string[] = [];

    if (session?.user?.id) {
      const userInteractions = await prisma.like.findMany({
        where: { userId: session.user.id },
        select: { postId: true },
      });
      userLikes = userInteractions.map(like => like.postId);

      const userRepostData = await prisma.repost.findMany({
        where: { userId: session.user.id },
        select: { postId: true },
      });
      userReposts = userRepostData.map(repost => repost.postId);

      try {
        const userDownvoteData = await prisma.downvote.findMany({
          where: { userId: session.user.id },
          select: { postId: true },
        });
        userDownvotes = userDownvoteData.map(d => d.postId);
      } catch {}
    }

    const postsWithInteractions = filteredPosts.map(post => ({
      ...post,
      likesCount: post._count.likes,
      repostsCount: post._count.reposts,
      commentsCount: post._count.comments,
      isLiked: userLikes.includes(post.id),
      isReposted: userReposts.includes(post.id),
      isDownvoted: userDownvotes.includes(post.id),
      _count: undefined,
    }));

    return NextResponse.json({
      posts: postsWithInteractions,
      pagination: {
        page,
        limit,
        hasMore: filteredPosts.length === limit,
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Parse body first to get walletAddress if provided
    const body = await request.json();
    const { content, imageUrl, imageUrls, walletAddress } = body;
    
    // Create a new request with walletAddress in headers if provided (for getUserFromRequest)
    const requestWithWallet = walletAddress ? new NextRequest(request.url, {
      method: request.method,
      headers: { ...Object.fromEntries(request.headers.entries()), "x-wallet-address": walletAddress },
      body: request.body,
    }) : request;
    
    // Use getUserFromRequest for consistent user identification (supports email/wallet/unique guests)
    const { userId, user } = await getUserFromRequest(requestWithWallet);

    // Support both single imageUrl (backwards compat) and array of imageUrls
    const images = imageUrls || (imageUrl ? [imageUrl] : []);
    
    // Allow posting with just images (no text required)
    const hasContent = content && content.trim().length > 0;
    const hasImages = images.length > 0;
    
    if (!hasContent && !hasImages) {
      return NextResponse.json(
        { error: "Post must have either content or images" },
        { status: 400 }
      );
    }

    if (hasContent && content.length > 500) {
      return NextResponse.json(
        { error: "Content must be 500 characters or less" },
        { status: 400 }
      );
    }

    if (images.length > 4) {
      return NextResponse.json(
        { error: "Maximum 4 images per post" },
        { status: 400 }
      );
    }
    
    const userData = {
      id: user.id,
      username: user.username,
      walletAddress: user.walletAddress ?? walletAddress ?? null,
      isVerified: user.isVerified,
      profileImage: user.profileImage ?? null,
    };

    const post = await prisma.post.create({
      data: {
        content: (content || "").trim(),
        imageUrls: images,
        userId: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            walletAddress: true,
            isVerified: true,
            profileImage: true,
          },
        },
      },
    });

    return NextResponse.json({
      ...post,
      user: userData,
      likesCount: 0,
      repostsCount: 0,
      commentsCount: 0,
      isLiked: false,
      isReposted: false,
    });
  } catch (error: any) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post", detail: (error?.message || String(error)) },
      { status: 500 }
    );
  }
}
