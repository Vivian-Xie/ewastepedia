import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { componentId, content, authorId, summary } = await req.json();
    if (!componentId || !content || !authorId) {
      return NextResponse.json({ error: "componentId, content, authorId required." }, { status: 400 });
    }

    const existing = await prisma.wikiPage.findUnique({ where: { componentId } });

    if (existing) {
      // Save revision then update
      await prisma.wikiRevision.create({
        data: { wikiPageId: existing.id, content: existing.content, authorId, summary },
      });
      const updated = await prisma.wikiPage.update({
        where: { componentId },
        data: { content, authorId },
      });
      return NextResponse.json(updated);
    } else {
      const page = await prisma.wikiPage.create({
        data: { componentId, content, authorId },
      });
      return NextResponse.json(page, { status: 201 });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
