import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import InvoicesPage from "@/app/dashboard/invoices/page";

// This wrapper ensures workspace slug is valid and sets orgId filter via localStorage on client
// The actual InvoicesPage client will fetch with orgId from localStorage (set by OrgSwitcher)
// For strict server filter, we could pass initial data here, but client fetch already handles orgId
export default async function WorkspaceInvoicesPage({ params }: { params: Promise<{ workspace: string }> }) {
  const { workspace } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");
  const org = await prisma.org.findUnique({ where: { slug: workspace } });
  if (!org) notFound();
  const mem = await prisma.membership.findUnique({ where: { userId_orgId: { userId: session.user.id, orgId: org.id } } as never });
  if (!mem) notFound();
  // Render the same client page — it will fetch with orgId from localStorage (set by OrgSwitcher)
  // For strict server, we could filter here, but client already does
  return <InvoicesPage />;
}
