import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categorySlug = searchParams.get("category");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const skip = (page - 1) * limit;

  const where = categorySlug
    ? { category: { slug: categorySlug } }
    : {};

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      include: {
        author: { select: { id: true, username: true } },
        category: { select: { id: true, slug: true, name: true } },
        _count: { select: { comments: true } },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return NextResponse.json({ posts, total, page, limit });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { categoryId, authorId, title, content, tags, componentIds } = body;

    if (!categoryId || !authorId || !title || !content) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        categoryId,
        authorId,
        title,
        body: content,
        tags: tags ?? [],
        components: componentIds?.length
          ? { create: componentIds.map((cid: string) => ({ componentId: cid })) }
          : undefined,
      },
      include: {
        author: { select: { id: true, username: true } },
        category: { select: { id: true, slug: true, name: true } },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
