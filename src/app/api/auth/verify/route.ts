import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/auth/verify — create VerificationToken and (in prod) send email via resend
// Body: { email }
export async function POST(request: NextRequest) {
  const { email } = await request.json().catch(() => ({}));
  if (!email || typeof email !== "string") return NextResponse.json({ error: "Email required" }, { status: 400 });
  const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);
  await prisma.verificationToken.create({ data: { identifier: email, token, expires } });
  // In prod: await resend.emails.send({ to: email, subject: "Verify your email", html: `Token: ${token}` })
  // Block dashboard until emailVerified — middleware can check emailVerified
  return NextResponse.json({ message: "Verification email sent (dev: token returned)", token: process.env.NODE_ENV === "development" ? token : undefined });
}

// GET /api/auth/verify?token=xxx&email=xxx — verify
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const email = request.nextUrl.searchParams.get("email");
  if (!token || !email) return NextResponse.json({ error: "Missing token/email" }, { status: 400 });
  const vt = await prisma.verificationToken.findUnique({ where: { token } });
  if (!vt || vt.identifier !== email || vt.expires < new Date()) return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  await prisma.user.update({ where: { email }, data: { emailVerified: new Date() } });
  await prisma.verificationToken.delete({ where: { token } });
  return NextResponse.json({ message: "Email verified" });
}
