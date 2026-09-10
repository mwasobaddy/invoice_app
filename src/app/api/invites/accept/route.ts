import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const token = request.nextUrl.searchParams.get("token");
    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });
    const inv = await prisma.invitation.findUnique({ where: { token } });
    if (!inv || inv.expiresAt < new Date()) return NextResponse.json({ error: "Invalid or expired" }, { status: 400 });
    if (inv.email.toLowerCase() !== user.email?.toLowerCase()) {
      return NextResponse.json({ error: `Invite for ${inv.email}, but you are ${user.email}` }, { status: 403 });
    }
    const existing = await prisma.membership.findUnique({ where: { userId_orgId: { userId: user.id!, orgId: inv.orgId } } as never });
    if (existing) {
      await prisma.invitation.delete({ where: { id: inv.id } });
      return NextResponse.json({ message: "Already member", orgId: inv.orgId });
    }
    await prisma.membership.create({ data: { userId: user.id!, orgId: inv.orgId, role: inv.role } });
    await prisma.invitation.delete({ where: { id: inv.id } });
    const { writeAuditLog } = await import("@/lib/audit");
    await writeAuditLog({ userId: user.id!, action: "accept_invite", entity: "Org", entityId: inv.orgId, ip: request.headers.get("x-forwarded-for") });
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL || "https://invoice-app-omega-ten.vercel.app"}/dashboard?org=${inv.orgId}`);
  } catch (e) {
    if (e instanceof Error && e.message.includes("Unauthorized")) return NextResponse.redirect(new URL("/auth/signin", request.nextUrl));
    console.error("accept error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
