import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const keepEmail = "kelvinramsiel@gmail.com";
  const keepUser = await prisma.user.findUnique({ where: { email: keepEmail } });
  if (!keepUser) {
    console.error("Keep user not found");
    process.exit(1);
  }
  console.log(`Keeping ${keepUser.id} ${keepEmail}`);

  // Find orgs to keep: those where keepUser is member (Personal + Malimanager)
  const keepMemberships = await prisma.membership.findMany({ where: { userId: keepUser.id } });
  const keepOrgIds = keepMemberships.map((m) => m.orgId);
  console.log(`Keep orgs:`, keepOrgIds);

  // Delete invitations for other orgs
  const delInv = await prisma.invitation.deleteMany({ where: { orgId: { notIn: keepOrgIds } } });
  console.log(`Deleted ${delInv.count} invitations for other orgs`);

  // Delete memberships for other users
  const delMem = await prisma.membership.deleteMany({ where: { userId: { not: keepUser.id } } });
  console.log(`Deleted ${delMem.count} memberships for other users`);

  // Delete orgs not in keepOrgIds (like Test, Personal generic, Nathan's Personal)
  const delOrgs = await prisma.org.deleteMany({ where: { id: { notIn: keepOrgIds } } });
  console.log(`Deleted ${delOrgs.count} orgs not in keep list`);

  // Delete all other users (cascade will delete their invoices/budgets/expenses/clients via userId? But we have already deleted orgs, need to handle)
  // First delete data for other users directly
  const delInvoicesOther = await prisma.invoice.deleteMany({ where: { userId: { not: keepUser.id } } });
  console.log(`Deleted ${delInvoicesOther.count} invoices for other users`);
  const delBudgetsOther = await prisma.budget.deleteMany({ where: { userId: { not: keepUser.id } } });
  console.log(`Deleted ${delBudgetsOther.count} budgets for other users`);
  const delExpensesOther = await prisma.expense.deleteMany({ where: { userId: { not: keepUser.id } } });
  console.log(`Deleted ${delExpensesOther.count} expenses for other users`);
  const delClientsOther = await prisma.client.deleteMany({ where: { userId: { not: keepUser.id } } });
  console.log(`Deleted ${delClientsOther.count} clients for other users`);
  const delAuditOther = await prisma.auditLog.deleteMany({ where: { userId: { not: keepUser.id } } });
  console.log(`Deleted ${delAuditOther.count} audit logs for other users`);

  // Delete other users (keep only kelvin)
  const delUsers = await prisma.user.deleteMany({ where: { id: { not: keepUser.id } } });
  console.log(`Deleted ${delUsers.count} other users`);

  // Verify
  const remainingOrgs = await prisma.org.findMany({ include: { members: true } });
  console.log(`Remaining orgs:`, remainingOrgs.map((o) => ({ id: o.id, name: o.name, members: o.members.length })));
  const remainingInv = await prisma.invoice.count({ where: { userId: keepUser.id } });
  console.log(`Remaining invoices for kelvin: ${remainingInv}`);

  await prisma.$disconnect();
  console.log("Clean done — only kelvin and his Personal + Malimanager remain");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
