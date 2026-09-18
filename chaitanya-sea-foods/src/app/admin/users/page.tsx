import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/authorization";

export default async function AdminUsersPage() {
  const session = await requireAdmin();

  if (!session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">
        User Management
      </h1>

      <p className="mt-2 text-gray-600">
        Welcome, {session.user.name}
      </p>

      <p className="mt-1 text-sm text-gray-500">
        Admin only area
      </p>
    </main>
  );
}