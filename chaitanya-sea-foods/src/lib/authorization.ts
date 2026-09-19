import { auth } from "@/auth";

export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return session;
}

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  if (session.user.role !== "ADMIN") {
    return null;
  }

  return session;
}

export async function requireManager() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  if (
    session.user.role !== "ADMIN" &&
    session.user.role !== "MANAGER"
  ) {
    return null;
  }

  return session;
}

export async function canCreateRecords() {
  const session = await auth();

  if (!session?.user) {
    return false;
  }

  return (
    session.user.role === "ADMIN" ||
    session.user.role === "MANAGER"
  );
}

export async function canEditRecords() {
  const session = await auth();

  if (!session?.user) {
    return false;
  }

  return session.user.role === "ADMIN";
}

export async function canDeleteRecords() {
  const session = await auth();

  if (!session?.user) {
    return false;
  }

  return session.user.role === "ADMIN";
}