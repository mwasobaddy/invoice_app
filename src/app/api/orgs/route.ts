import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const OrgSchema = z.object({ name: z.string().min(1).max(80) });

export async function GET() {
  try {
    const user = await requireAuth();
    const orgs = await prisma.org.findMany({
      where: { members: { some: { userId: user.id! } } } as never,
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return NextResponse.json(orgs);
  } catch (e) {
    if (e instanceof Error && e.message.includes("Unauthorized")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const raw = await request.json().catch(() => ({}));
    const parsed = OrgSchema.safeParse(raw);
    if (!parsed.success) return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    const org = await prisma.org.create({ data: { name: parsed.data.name } });
    await prisma.membership.create({ data: { userId: user.id!, orgId: org.id, role: "owner" } });
    const { writeAuditLog } = await import("@/lib/audit");
    await writeAuditLog({ userId: user.id!, action: "create", entity: "Org", entityId: org.id, diff: parsed.data as Record<string, unknown>, ip: request.headers.get("x-forwarded-for") });
    return NextResponse.json(org, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message.includes("Unauthorized")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
