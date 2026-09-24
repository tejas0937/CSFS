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
    include: {
      managedBy: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });

  const serializedVendors = vendors.map((vendor) => ({
    id: vendor.id,
    name: vendor.name,
    shipName: vendor.shipName,
    phone: vendor.phone,
    alternatePhone: vendor.alternatePhone,
    location: vendor.location,
    address: vendor.address,
    notes: vendor.notes,
    managedById: vendor.managedById,

    managedBy: vendor.managedBy
      ? {
          id: vendor.managedBy.id,
          name: vendor.managedBy.name,
          role: vendor.managedBy.role,
        }
      : null,

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