import { requireAuth } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import VendorManagement from "@/components/admin/VendorManagement";

export default async function AdminVendorsPage() {
  const session = await requireAuth();

  if (!session) {
    return null;
  }

  const vendors = await prisma.vendor.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const serializedVendors = vendors.map((vendor) => ({
    id: vendor.id,
    name: vendor.name,
    contactPerson: vendor.contactPerson,
    phone: vendor.phone,
    alternatePhone: vendor.alternatePhone,
    email: vendor.email,
    address: vendor.address,
    notes: vendor.notes,
    isActive: vendor.isActive,
    createdAt: vendor.createdAt.toISOString(),
    updatedAt: vendor.updatedAt.toISOString(),
  }));

  return (
    <VendorManagement
      initialVendors={serializedVendors}
      userRole={session.user.role}
    />
  );
}