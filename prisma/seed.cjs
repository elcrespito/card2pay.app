// Plain CommonJS seed so it runs at container start with just @prisma/client
// and bcryptjs — no tsx/esbuild toolchain required in the runtime image.
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@card2pay.app").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "ChangeMe!2026";
  const name = process.env.ADMIN_NAME || "Card2pay Admin";

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN", status: "ACTIVE" },
    create: { email, name, passwordHash, role: "ADMIN", status: "ACTIVE" },
  });

  console.log(`Seeded admin user: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
