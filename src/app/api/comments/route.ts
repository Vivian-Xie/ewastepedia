import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { postId, parentId, authorId, body } = await req.json();

    if (!postId || !body?.trim()) {
      return NextResponse.json({ error: "postId and body are required." }, { status: 400 });
    }

    // For demo: use a fallback seed user if no auth
    let resolvedAuthorId = authorId;
    if (!resolvedAuthorId) {
      const anon = await prisma.user.findFirst({ where: { username: "maker_jay" } });
      resolvedAuthorId = anon?.id;
    }
    if (!resolvedAuthorId) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    // Check if commenter is OP
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });
    const isOp = post?.authorId === resolvedAuthorId;

    const comment = await prisma.comment.create({
      data: {
        postId,
        parentId: parentId ?? null,
        authorId: resolvedAuthorId,
        body: body.trim(),
        isOp,
      },
      include: { author: { select: { username: true } } },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
