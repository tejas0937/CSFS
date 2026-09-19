import { redirect } from "next/navigation";

import DashboardShell from "@/components/dashboard/DashboardShell";
import { requireAuth } from "@/lib/authorization";

export default async function DashboardPage() {
  const session = await requireAuth();

  if (!session) {
    redirect("/");
  }

  const purchaseDate = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date());

  return (
    <DashboardShell
      userName={session.user.name ?? session.user.username}
      role={session.user.role}
      purchaseDate={purchaseDate}
    />
  );
}