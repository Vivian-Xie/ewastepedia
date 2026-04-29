import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const component = await prisma.component.findUnique({
    where: { slug },
    include: {
      category: { select: { slug: true, name: true } },
      wikiPage: { include: { author: { select: { username: true } } } },
    },
  });
  if (!component) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json(component);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await req.json();
  const { name, description, specs, imageBase64, tags } = body;

  const component = await prisma.component.update({
    where: { slug },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(specs !== undefined && { specs }),
      ...(imageBase64 !== undefined && { imageBase64 }),
      ...(tags !== undefined && { tags }),
    },
  });
  return NextResponse.json(component);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await prisma.component.delete({ where: { slug } });
  return NextResponse.json({ ok: true });
}
