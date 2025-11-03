import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: { user: { select: { id: true, username: true, walletAddress: true, isVerified: true, profileImage: true } } },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: postId } = await params;
    const { content, walletAddress } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Use getUserFromRequest for consistent user identification (supports email/wallet/unique guests)
    // Pass walletAddress from body if not in headers
    const { userId: resolvedUserId, user } = await getUserFromRequest(request, walletAddress || null);
    const userId = resolvedUserId;
    
    // Only set actorId for authenticated users (email or wallet), not for guests (for notifications)
    let actorId: string | null = null;
    if (session?.user?.id || request.headers.get("x-wallet-address") || walletAddress) {
      actorId = userId;
    }
    
    const userData = {
      id: user.id,
      username: user.username,
      walletAddress: user.walletAddress ?? walletAddress ?? null,
      isVerified: user.isVerified,
      profileImage: user.profileImage ?? null,
    };

    const comment = await prisma.comment.create({
      data: { content: content.trim(), postId, userId },
      include: { user: { select: { id: true, username: true, walletAddress: true, isVerified: true, profileImage: true } } },
    });

    // Get post owner
    const post = await prisma.post.findUnique({ where: { id: postId }, select: { userId: true } });
    
    // Create notification if authenticated (email or wallet) and not commenting on own post
    if (actorId && post && post.userId !== actorId) {
      await prisma.notification.create({
        data: {
          userId: post.userId,
          actorId: actorId,
          type: "COMMENT",
          postId,
          commentId: comment.id,
        },
      });
    }

    return NextResponse.json({ ...comment, user: userData });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: postId } = await params;
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("commentId");
    if (!commentId) return NextResponse.json({ error: "commentId required" }, { status: 400 });

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment || comment.postId !== postId) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let allowed = !!(session?.user?.id && session.user.id === comment.userId);
    if (!allowed) {
      const wallet = request.headers.get("x-wallet-address") || request.headers.get("X-Wallet-Address");
      if (wallet) {
        const owner = await prisma.user.findUnique({ where: { id: comment.userId }, select: { walletAddress: true } });
        if (owner?.walletAddress && owner.walletAddress === wallet) allowed = true;
      }
    }
    if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.comment.delete({ where: { id: commentId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete comment error:", error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
