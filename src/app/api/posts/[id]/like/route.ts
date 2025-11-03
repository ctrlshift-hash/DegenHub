import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/getUser";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: postId } = await params;
    
    // Support both email and wallet authentication
    let userId: string | null = null;
    let actorId: string | null = null; // The user performing the action (for notifications)
    
    // Use getUserFromRequest for consistent user identification (supports email/wallet/unique guests)
    const { userId: resolvedUserId } = await getUserFromRequest(request);
    userId = resolvedUserId;
    
    // Only set actorId for authenticated users (email or wallet), not for guests (for notifications)
    if (session?.user?.id || request.headers.get("x-wallet-address")) {
      actorId = userId;
    } else {
      actorId = null; // Guests don't get notifications
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Check if user already liked the post
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: userId,
        },
      },
    });

    if (existingLike) {
      // Unlike the post
      await prisma.like.delete({
        where: { id: existingLike.id },
      });

      // Update like count
      await prisma.post.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } },
      });

      return NextResponse.json({ liked: false });
    } else {
      // Like the post
      await prisma.like.create({
        data: {
          postId,
          userId: userId,
        },
      });

      // Update like count
      await prisma.post.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
      });

      // Create notification if actor is authenticated (email or wallet) and not liking own post
      if (actorId) {
        const postOwner = post.userId;
        if (postOwner !== actorId) {
          await prisma.notification.create({
            data: {
              userId: postOwner,
              actorId: actorId,
              type: "LIKE",
              postId,
            },
          });
        }
      }

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}
