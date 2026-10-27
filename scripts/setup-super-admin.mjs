import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL must be set before running the super-admin setup.");
}

const emailInput = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.SUPERADMIN_PASSWORD;
const name = process.env.SUPERADMIN_NAME?.trim() || "Federation Super Admin";
const allowReassignment = process.env.SUPERADMIN_REPLACE_EXISTING === "true";

if (!emailInput || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
  throw new Error("Set SUPERADMIN_EMAIL to a valid email address.");
}
if (!password || password.trim().length < 12) {
  throw new Error("Set SUPERADMIN_PASSWORD to a password with at least 12 characters.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const superAdmins = await prisma.user.findMany({
    where: { role: "SUPER_ADMIN" },
    select: { id: true, email: true },
  });

  if (superAdmins.length > 1) {
    throw new Error("Multiple SUPER_ADMIN accounts exist. Resolve them manually before running this utility.");
  }

  const currentSuperAdmin = superAdmins[0];
  if (
    currentSuperAdmin &&
    currentSuperAdmin.email !== emailInput &&
    !allowReassignment
  ) {
    throw new Error(
      "A different SUPER_ADMIN already exists. Set SUPERADMIN_REPLACE_EXISTING=true only if you intend to reassign it.",
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email: emailInput } });
  const hashedPassword = await bcrypt.hash(password, 12);
  const permissions = [
    "MANAGE_MEETS",
    "MANAGE_MEMBERS",
    "MANAGE_RECORDS",
    "LIVE_SCORING",
    "CMS_PUBLISH",
  ];

  const updated = await prisma.$transaction(async (transaction) => {
    if (currentSuperAdmin && currentSuperAdmin.email !== emailInput) {
      await transaction.user.update({
        where: { id: currentSuperAdmin.id },
        data: { role: "ADMIN" },
      });
    }

    if (existingUser) {
      return transaction.user.update({
        where: { id: existingUser.id },
        data: {
          role: "SUPER_ADMIN",
          password: hashedPassword,
          name,
          isActive: true,
          permissions,
          mustChangePassword: true,
        },
        select: { id: true, email: true, name: true, role: true },
      });
    }

    return transaction.user.create({
      data: {
        email: emailInput,
        password: hashedPassword,
        name,
        role: "SUPER_ADMIN",
        isActive: true,
        permissions,
        mustChangePassword: true,
      },
      select: { id: true, email: true, name: true, role: true },
    });
  });

  console.log("Super-admin account is ready.");
  console.log(`Email: ${updated.email}`);
  console.log(`Role: ${updated.role}`);
  console.log("Password: set (not displayed)");
}

main()
  .catch((error) => {
    console.error("Super-admin setup failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
