import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const email = "kelvinramsiel@gmail.com";
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`User ${email} not found`);
    process.exit(1);
  }
  console.log(`Found user ${user.id} ${user.email}`);

  let org = await prisma.org.findFirst({ where: { name: "Malimanager" } });
  if (!org) {
    org = await prisma.org.create({ data: { name: "Malimanager" } });
    console.log(`Created org ${org.id} Malimanager`);
  } else {
    console.log(`Org Malimanager already exists ${org.id}`);
  }

  const membership = await prisma.membership.findUnique({ where: { userId_orgId: { userId: user.id, orgId: org.id } } as never });
  if (!membership) {
    await prisma.membership.create({ data: { userId: user.id, orgId: org.id, role: "owner" } });
    console.log(`Made ${email} owner of Malimanager`);
  } else {
    console.log(`Already member role=${membership.role}`);
    if (membership.role !== "owner") {
      await prisma.membership.update({ where: { id: membership.id }, data: { role: "owner" } });
      console.log(`Updated to owner`);
    }
  }

  // Move existing data where orgId is null
  const inv = await prisma.invoice.updateMany({ where: { userId: user.id, orgId: null } as never, data: { orgId: org.id } });
  console.log(`Migrated ${inv.count} invoices to Malimanager`);
  const bud = await prisma.budget.updateMany({ where: { userId: user.id, orgId: null } as never, data: { orgId: org.id } });
  console.log(`Migrated ${bud.count} budgets`);
  const exp = await prisma.expense.updateMany({ where: { userId: user.id, orgId: null } as never, data: { orgId: org.id } });
  console.log(`Migrated ${exp.count} expenses`);
  // Note: Client has no orgId, so skip

  console.log(`Done — orgId=${org.id}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
