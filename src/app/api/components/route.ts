import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categorySlug = searchParams.get("category");
  const q = searchParams.get("q");

  const where = {
    ...(categorySlug && { category: { slug: categorySlug } }),
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { description: { contains: q, mode: "insensitive" as const } },
      ],
    }),
  };

  const components = await prisma.component.findMany({
    where,
    include: { category: { select: { slug: true, name: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(components);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { categoryId, slug, name, description, specs, imageBase64, tags } = body;

    if (!categoryId || !slug || !name) {
      return NextResponse.json({ error: "categoryId, slug, and name are required." }, { status: 400 });
    }

    const component = await prisma.component.create({
      data: { categoryId, slug, name, description, specs, imageBase64, tags: tags ?? [] },
    });
    return NextResponse.json(component, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
