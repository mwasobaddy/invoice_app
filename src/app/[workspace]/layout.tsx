import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspace: string }>;
}) {
  const { workspace } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  // Validate workspace slug belongs to user
  const org = await prisma.org.findUnique({ where: { slug: workspace } });
  if (!org) notFound();
  const membership = await prisma.membership.findUnique({
    where: { userId_orgId: { userId: session.user.id, orgId: org.id } } as never,
  });
  if (!membership) notFound();

  // Strict filter: this layout ensures all child pages are scoped to this workspace
  // Child pages should read params.workspace and filter by orgId
  return <DashboardShell>{children}</DashboardShell>;
}
