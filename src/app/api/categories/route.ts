import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: "asc" },
    include: { _count: { select: { posts: true, components: true } } },
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { slug, name, description, iconEmoji, tags, displayOrder } = body;
  if (!slug || !name) {
    return NextResponse.json({ error: "slug and name are required." }, { status: 400 });
  }
  const category = await prisma.category.create({
    data: { slug, name, description, iconEmoji, tags: tags ?? [], displayOrder: displayOrder ?? 0 },
  });
  return NextResponse.json(category, { status: 201 });
}
