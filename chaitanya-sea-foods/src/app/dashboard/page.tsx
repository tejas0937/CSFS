import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/authorization";

export default async function DashboardPage() {
  const session = await requireAuth();

  if (!session) {
    redirect("/");
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">
        Dashboard
      </h1>

      <p className="mt-2 text-gray-600">
        Welcome, {session.user.name}
      </p>

      <p className="mt-1 text-sm text-gray-500">
        Role: {session.user.role}
      </p>
    </main>
  );
}