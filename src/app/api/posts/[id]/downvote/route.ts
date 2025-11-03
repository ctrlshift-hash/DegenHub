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

    // Use getUserFromRequest for consistent user identification (supports email/wallet/unique guests)
    const { userId: resolvedUserId } = await getUserFromRequest(request);
    const userId = resolvedUserId;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const existing = await prisma.downvote.findUnique({ where: { postId_userId: { postId, userId: userId! } } });
    if (existing) {
      await prisma.downvote.delete({ where: { id: existing.id } });
      await prisma.post.update({ where: { id: postId }, data: { downvotesCount: { decrement: 1 } } });
      return NextResponse.json({ downvoted: false });
    } else {
      await prisma.downvote.create({ data: { postId, userId: userId! } });
      await prisma.post.update({ where: { id: postId }, data: { downvotesCount: { increment: 1 } } });
      return NextResponse.json({ downvoted: true });
    }
  } catch (e) {
    console.error("Downvote error", e);
    return NextResponse.json({ error: "Failed to toggle downvote" }, { status: 500 });
  }
}


