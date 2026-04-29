import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signToken, verifyPassword, hashPassword } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { action, username, email, password } = await req.json();

  if (action === "login") {
    const user = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }
    const token = await signToken({ userId: user.id, username: user.username, role: user.role });
    const cookieStore = await cookies();
    cookieStore.set("session", token, { httpOnly: true, sameSite: "lax", maxAge: 30 * 86400 });
    return NextResponse.json({ id: user.id, username: user.username, role: user.role });
  }

  if (action === "register") {
    const exists = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (exists) return NextResponse.json({ error: "Username or email already taken." }, { status: 409 });

    const user = await prisma.user.create({
      data: { username, email, passwordHash: await hashPassword(password) },
    });
    const token = await signToken({ userId: user.id, username: user.username, role: user.role });
    const cookieStore = await cookies();
    cookieStore.set("session", token, { httpOnly: true, sameSite: "lax", maxAge: 30 * 86400 });
    return NextResponse.json({ id: user.id, username: user.username, role: user.role });
  }

  if (action === "logout") {
    const cookieStore = await cookies();
    cookieStore.delete("session");
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
