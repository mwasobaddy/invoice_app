import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const email = "kelvinramsiel@gmail.com";
  const user = await prisma.user.findUnique({ where: { email }, include: { memberships: { include: { org: true } } } });
  if (!user) {
    console.error("User not found");
    process.exit(1);
  }
  console.log(`Found ${user.email} with ${user.memberships.length} orgs:`, user.memberships.map(m => `${m.org.name} (${m.role})`).join(", "));
  const hasPersonal = user.memberships.some(m => m.org.name.toLowerCase().includes("personal"));
  if (hasPersonal) {
    console.log("Already has Personal");
    await prisma.$disconnect();
    return;
  }
  const personalName = user.name ? `${user.name.split(' ')[0]}'s Personal` : "Personal";
  const org = await prisma.org.create({ data: { name: personalName } });
  await prisma.membership.create({ data: { userId: user.id, orgId: org.id, role: "owner" } });
  console.log(`Created Personal org ${org.id} ${personalName} for ${email}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
