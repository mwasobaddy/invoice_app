import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Invoice Atlas",
  description: "Overview of invoices, budgets and expenses",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
