"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
  requireAuth,
  canCreateRecords,
  canEditRecords,
  canDeleteRecords,
} from "@/lib/authorization";

const vendorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Vendor name must be at least 2 characters")
    .max(100, "Vendor name is too long"),

  shipName: z
    .string()
    .trim()
    .max(100, "Ship name is too long")
    .optional()
    .or(z.literal("")),

  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number is too long")
    .regex(/^[0-9+\-\s()]+$/, "Invalid phone number"),

  alternatePhone: z
    .string()
    .trim()
    .max(15, "Alternate phone number is too long")
    .regex(/^[0-9+\-\s()]+$/, "Invalid alternate phone number")
    .optional()
    .or(z.literal("")),

  location: z
    .string()
    .trim()
    .max(250, "Location is too long")
    .optional()
    .or(z.literal("")),

  address: z
    .string()
    .trim()
    .max(500, "Address is too long")
    .optional()
    .or(z.literal("")),

  notes: z
    .string()
    .trim()
    .max(1000, "Notes are too long")
    .optional()
    .or(z.literal("")),
});

type VendorInput = z.infer<typeof vendorSchema>;

type ErrorResponse = {
  success: false;
  error: string;
};

type ManagedBy = {
  id: string;
  name: string;
  role: string;
};

type VendorResponse = {
  success: true;
  vendor: {
    id: string;
    name: string;
    shipName: string | null;
    phone: string;
    alternatePhone: string | null;
    location: string | null;
    address: string | null;
    notes: string | null;
    managedById: string | null;
    managedBy: ManagedBy | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
};

type StatusResponse = {
  success: true;
  vendor: {
    id: string;
    isActive: boolean;
  };
};

type DeleteResponse = {
  success: true;
};

function normalizeVendorData(data: VendorInput) {
  return {
    name: data.name,
    shipName: data.shipName || null,
    phone: data.phone,
    alternatePhone: data.alternatePhone || null,
    location: data.location || null,
    address: data.address || null,
    notes: data.notes || null,
  };
}

/* =========================================================
   CREATE VENDOR
========================================================= */

export async function createVendor(
  data: VendorInput
): Promise<VendorResponse | ErrorResponse> {
  const session = await requireAuth();

  if (!session) {
    return {
      success: false,
      error: "Unauthorized.",
    };
  }

  if (!(await canCreateRecords())) {
    return {
      success: false,
      error: "You do not have permission to create vendors.",
    };
  }

  const parsed = vendorSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid vendor data.",
    };
  }

  try {
    const vendor = await prisma.vendor.create({
      data: {
        ...normalizeVendorData(parsed.data),

        // Automatically assign the logged-in user
        managedById: session.user.id,
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

    return {
      success: true,
      vendor: {
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
      },
    };
  } catch (error) {
    console.error("Create vendor error:", error);

    return {
      success: false,
      error: "Failed to create vendor.",
    };
  }
}

/* =========================================================
   UPDATE VENDOR
========================================================= */

export async function updateVendor(
  id: string,
  data: VendorInput
): Promise<VendorResponse | ErrorResponse> {
  const session = await requireAuth();

  if (!session) {
    return {
      success: false,
      error: "Unauthorized.",
    };
  }

  if (!(await canEditRecords())) {
    return {
      success: false,
      error: "You do not have permission to edit vendors.",
    };
  }

  if (!id) {
    return {
      success: false,
      error: "Vendor ID is required.",
    };
  }

  const parsed = vendorSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid vendor data.",
    };
  }

  try {
    const existingVendor = await prisma.vendor.findUnique({
      where: { id },
    });

    if (!existingVendor) {
      return {
        success: false,
        error: "Vendor not found.",
      };
    }

    const vendor = await prisma.vendor.update({
      where: { id },

      // IMPORTANT:
      // managedById is intentionally NOT updated here.
      // The original manager remains attached to the vendor.
      data: normalizeVendorData(parsed.data),

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

    return {
      success: true,
      vendor: {
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
      },
    };
  } catch (error) {
    console.error("Update vendor error:", error);

    return {
      success: false,
      error: "Failed to update vendor.",
    };
  }
}

/* =========================================================
   TOGGLE VENDOR STATUS
========================================================= */

export async function toggleVendorStatus(
  id: string
): Promise<StatusResponse | ErrorResponse> {
  const session = await requireAuth();

  if (!session) {
    return {
      success: false,
      error: "Unauthorized.",
    };
  }

  if (!(await canEditRecords())) {
    return {
      success: false,
      error: "You do not have permission to change vendor status.",
    };
  }

  if (!id) {
    return {
      success: false,
      error: "Vendor ID is required.",
    };
  }

  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id },
    });

    if (!vendor) {
      return {
        success: false,
        error: "Vendor not found.",
      };
    }

    const updatedVendor = await prisma.vendor.update({
      where: { id },
      data: {
        isActive: !vendor.isActive,
      },
    });

    return {
      success: true,
      vendor: {
        id: updatedVendor.id,
        isActive: updatedVendor.isActive,
      },
    };
  } catch (error) {
    console.error("Toggle vendor status error:", error);

    return {
      success: false,
      error: "Failed to update vendor status.",
    };
  }
}

/* =========================================================
   DELETE VENDOR
========================================================= */

export async function deleteVendor(
  id: string
): Promise<DeleteResponse | ErrorResponse> {
  const session = await requireAuth();

  if (!session) {
    return {
      success: false,
      error: "Unauthorized.",
    };
  }

  if (!(await canDeleteRecords())) {
    return {
      success: false,
      error: "You do not have permission to delete vendors.",
    };
  }

  if (!id) {
    return {
      success: false,
      error: "Vendor ID is required.",
    };
  }

  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id },
    });

    if (!vendor) {
      return {
        success: false,
        error: "Vendor not found.",
      };
    }

    await prisma.vendor.delete({
      where: { id },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Delete vendor error:", error);

    return {
      success: false,
      error: "Failed to delete vendor.",
    };
  }
}

/* =========================================================
   GET ACTIVE VENDORS
========================================================= */

type VendorListResponse =
  | {
      success: true;
      vendors: {
        id: string;
        name: string;
        shipName: string | null;
        phone: string;
        alternatePhone: string | null;
        location: string | null;
        address: string | null;
        notes: string | null;
        managedById: string | null;
        managedBy: ManagedBy | null;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
      }[];
    }
  | ErrorResponse;

export async function getActiveVendors(): Promise<VendorListResponse> {
  const session = await requireAuth();

  if (!session) {
    return {
      success: false,
      error: "Unauthorized.",
    };
  }

  try {
    const vendors = await prisma.vendor.findMany({
      where: {
        isActive: true,
      },

      orderBy: {
        createdAt: "asc",
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

    return {
      success: true,

      vendors: vendors.map((vendor) => ({
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
      })),
    };
  } catch (error) {
    console.error("Get vendors error:", error);

    return {
      success: false,
      error: "Failed to load vendors.",
    };
  }
}