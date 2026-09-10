import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import BudgetsPage from "@/app/dashboard/budgets/page";

export default async function WorkspaceBudgetsPage({ params }: { params: Promise<{ workspace: string }> }) {
  const { workspace } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");
  const org = await prisma.org.findUnique({ where: { slug: workspace } });
  if (!org) notFound();
  const mem = await prisma.membership.findUnique({ where: { userId_orgId: { userId: session.user.id, orgId: org.id } } as never });
  if (!mem) notFound();
  return <BudgetsPage />;
}
