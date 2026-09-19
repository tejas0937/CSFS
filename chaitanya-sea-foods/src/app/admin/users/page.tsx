import { redirect } from "next/navigation";

import UserManagement from "@/components/admin/UserManagement";
import { requireAdmin } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const session = await requireAdmin();

  if (!session) {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "asc",
    },

    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  const serializedUsers = users.map((user) => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
  }));

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <UserManagement
          users={serializedUsers}
          currentUserId={session.user.id}
        />
      </div>
    </main>
  );
}