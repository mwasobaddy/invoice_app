import { prisma } from "@/lib/prisma";

export async function writeAuditLog(params: {
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  diff?: Record<string, unknown>;
  ip?: string | null;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        diff: params.diff as never,
        ip: params.ip || null,
      },
    });
  } catch (e) {
    // Audit failure should not block main flow — log only
    console.error("audit log failed", e);
  }
}
