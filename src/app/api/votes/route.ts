import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { userId, postId, commentId, value } = await req.json();

    if (!userId || (!postId && !commentId) || (value !== 1 && value !== -1)) {
      return NextResponse.json({ error: "Invalid vote payload." }, { status: 400 });
    }

    if (postId) {
      const existing = await prisma.vote.findUnique({
        where: { userId_postId: { userId, postId } },
      });
      if (existing?.value === value) {
        // Undo vote
        await prisma.vote.delete({ where: { userId_postId: { userId, postId } } });
        await prisma.post.update({ where: { id: postId }, data: { voteScore: { increment: -value } } });
        return NextResponse.json({ action: "removed" });
      }
      const delta = existing ? value - existing.value : value;
      await prisma.vote.upsert({
        where: { userId_postId: { userId, postId } },
        create: { userId, postId, value },
        update: { value },
      });
      await prisma.post.update({ where: { id: postId }, data: { voteScore: { increment: delta } } });
      return NextResponse.json({ action: "voted", value });
    }

    if (commentId) {
      const existing = await prisma.vote.findUnique({
        where: { userId_commentId: { userId, commentId } },
      });
      if (existing?.value === value) {
        await prisma.vote.delete({ where: { userId_commentId: { userId, commentId } } });
        await prisma.comment.update({ where: { id: commentId }, data: { voteScore: { increment: -value } } });
        return NextResponse.json({ action: "removed" });
      }
      const delta = existing ? value - existing.value : value;
      await prisma.vote.upsert({
        where: { userId_commentId: { userId, commentId } },
        create: { userId, commentId, value },
        update: { value },
      });
      await prisma.comment.update({ where: { id: commentId }, data: { voteScore: { increment: delta } } });
      return NextResponse.json({ action: "voted", value });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
