import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

const InviteSchema = z.object({ email: z.string().email(), role: z.enum(["member", "admin"]).optional().default("member") });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id: orgId } = await params;
    const raw = await request.json();
    const parsed = InviteSchema.safeParse(raw);
    if (!parsed.success) return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });

    // Check owner/member of org
    const membership = await prisma.membership.findUnique({ where: { userId_orgId: { userId: user.id!, orgId } } as never });
    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      return NextResponse.json({ error: "Only owner/admin can invite" }, { status: 403 });
    }

    const { email, role } = parsed.data;
    const existing = await prisma.invitation.findUnique({ where: { orgId_email: { orgId, email } } as never });
    if (existing) return NextResponse.json({ error: "Already invited" }, { status: 409 });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const inv = await prisma.invitation.create({
      data: { orgId, email, role, token, invitedBy: user.id!, expiresAt },
    });

    const acceptUrl = `${process.env.NEXTAUTH_URL || "https://invoice-app-omega-ten.vercel.app"}/api/invites/accept?token=${token}`;

    // Send via resend if configured, else log
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "Invoice Atlas <onboarding@resend.dev>",
          to: email,
          subject: `You've been invited to Malimanager`,
          html: `<p>You've been invited to join <strong>Malimanager</strong> as ${role}.</p><p><a href="${acceptUrl}">Accept invitation</a></p><p>Expires in 7 days.</p>`,
        });
      } catch (e) {
        console.error("resend failed", e);
        // Fall through to return token for dev
      }
    } else {
      console.log(`Invite dev: ${email} -> ${acceptUrl}`);
    }

    const { writeAuditLog } = await import("@/lib/audit");
    await writeAuditLog({ userId: user.id!, action: "invite", entity: "Org", entityId: orgId, diff: { email, role } as Record<string, unknown>, ip: request.headers.get("x-forwarded-for") });

    return NextResponse.json({ message: "Invite sent", invitation: { id: inv.id, email, role, token: process.env.NODE_ENV === "development" ? token : undefined, acceptUrl: process.env.NODE_ENV === "development" ? acceptUrl : undefined } }, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message.includes("Unauthorized")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("invite error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
