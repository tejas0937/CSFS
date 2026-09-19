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
    // =========================
    // ADMIN
    // =========================

    const adminPasswordHash = await bcrypt.hash(
      "ashish404",
      12
    );

    const admin = await prisma.user.upsert({
      where: {
        username: "admin_ashish",
      },

      update: {
        passwordHash: adminPasswordHash,
        name: "Admin - Ashish",
        role: "ADMIN",
        isActive: true,
      },

      create: {
        username: "admin_ashish",
        passwordHash: adminPasswordHash,
        name: "Admin - Ashish",
        role: "ADMIN",
        isActive: true,
      },
    });

    console.log(`Admin created: ${admin.username}`);

    // =========================
    // MANAGER
    // =========================

    const managerPasswordHash = await bcrypt.hash(
      "manager@123",
      12
    );

    const manager = await prisma.user.upsert({
      where: {
        username: "manager",
      },

      update: {
        passwordHash: managerPasswordHash,
        name: "Sea Foods Manager",
        role: "MANAGER",
        isActive: true,
      },

      create: {
        username: "manager",
        passwordHash: managerPasswordHash,
        name: "Sea Foods Manager",
        role: "MANAGER",
        isActive: true,
      },
    });

    console.log(`Manager created: ${manager.username}`);

    // =========================
    // VIEWER
    // =========================

    const viewerPasswordHash = await bcrypt.hash(
      "viewer@123",
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