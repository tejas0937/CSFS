import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined");
  }

  const adapter = new PrismaPg({
    connectionString,
  });

  const prisma = new PrismaClient({
    adapter,
  });

  try {
    const adminPasswordHash = await bcrypt.hash(
      "ChangeMe123!",
      12
    );

    const admin = await prisma.user.upsert({
      where: {
        username: "admin",
      },

      update: {
        passwordHash: adminPasswordHash,
        name: "Chaitanya Admin",
        role: "ADMIN",
        isActive: true,
      },

      create: {
        username: "admin",
        passwordHash: adminPasswordHash,
        name: "Chaitanya Admin",
        role: "ADMIN",
        isActive: true,
      },
    });

    console.log(`Admin created: ${admin.username}`);

    const viewerPasswordHash = await bcrypt.hash(
      "Viewer123!",
      12
    );

    const viewer = await prisma.user.upsert({
      where: {
        username: "viewer",
      },

      update: {
        passwordHash: viewerPasswordHash,
        name: "Sea Foods Viewer",
        role: "VIEWER",
        isActive: true,
      },

      create: {
        username: "viewer",
        passwordHash: viewerPasswordHash,
        name: "Sea Foods Viewer",
        role: "VIEWER",
        isActive: true,
      },
    });

    console.log(`Viewer created: ${viewer.username}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});