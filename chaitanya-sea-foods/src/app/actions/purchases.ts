"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
  canCreateRecords,
  canEditRecords,
  requireAuth,
} from "@/lib/authorization";

/* =========================================================
   TYPES
========================================================= */

const purchaseTubSchema = z.object({
  productId: z.string().min(1),
  number: z.number().int().positive(),
  weight: z.number().nonnegative(),
});

const purchaseSchema = z.object({
  id: z.string().optional(),

  vendorId: z.string().min(1),

  purchaseDate: z.string().optional(),

  grossWeight: z.number().nonnegative(),

  netWeight: z.number().nonnegative(),

  netWeightOverridden: z.boolean().default(false),

  vendorCompleted: z.boolean().default(false),

  completed: z.boolean().default(false),

  tubs: z.array(purchaseTubSchema),
});

type PurchaseInput = z.infer<typeof purchaseSchema>;

/* =========================================================
   RESPONSE TYPES
========================================================= */

type ErrorResponse = {
  success: false;
  error: string;
};

type PurchaseResponse = {
  success: true;
  purchase: {
    id: string;
    purchaseDate: string;

    vendorId: string;
    vendorName: string;

    grossWeight: number;
    netWeight: number;
    netWeightOverridden: boolean;

    vendorCompleted: boolean;
    completed: boolean;

    createdAt: string;
    updatedAt: string;

    tubs: {
      id: string;
      purchaseId: string;
      productId: string;
      productName: string;
      grade: string;
      countPerKg: string;
      number: number;
      weight: number;
      createdAt: string;
    }[];
  };
};

/* =========================================================
   SERIALIZER
========================================================= */

function serializePurchase(purchase: {
  id: string;
  purchaseDate: Date;

  vendorId: string;
  vendor: {
    name: string;
  };

  grossWeight: number;
  netWeight: number;
  netWeightOverridden: boolean;

  vendorCompleted: boolean;
  completed: boolean;

  createdAt: Date;
  updatedAt: Date;

  tubs: {
    id: string;
    purchaseId: string;
    productId: string;
    product: {
      name: string;
      grade: string;
      countPerKg: string;
    };
    number: number;
    weight: number;
    createdAt: Date;
  }[];
}): PurchaseResponse["purchase"] {
  return {
    id: purchase.id,

    purchaseDate: purchase.purchaseDate.toISOString(),

    vendorId: purchase.vendorId,
    vendorName: purchase.vendor.name,

    grossWeight: purchase.grossWeight,
    netWeight: purchase.netWeight,
    netWeightOverridden: purchase.netWeightOverridden,

    vendorCompleted: purchase.vendorCompleted,
    completed: purchase.completed,

    createdAt: purchase.createdAt.toISOString(),
    updatedAt: purchase.updatedAt.toISOString(),

    tubs: purchase.tubs.map((tub) => ({
      id: tub.id,
      purchaseId: tub.purchaseId,

      productId: tub.productId,

      productName: tub.product.name,
      grade: tub.product.grade,
      countPerKg: tub.product.countPerKg,

      number: tub.number,
      weight: tub.weight,

      createdAt: tub.createdAt.toISOString(),
    })),
  };
}

/* =========================================================
   CREATE PURCHASE
========================================================= */

export async function createPurchase(
  data: PurchaseInput,
): Promise<PurchaseResponse | ErrorResponse> {
  try {
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
        error: "You do not have permission to create purchases.",
      };
    }

    const parsed = purchaseSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid purchase data.",
      };
    }

    const input = parsed.data;

    /* -----------------------------------------------------
       Verify vendor
    ----------------------------------------------------- */

    const vendor = await prisma.vendor.findUnique({
      where: {
        id: input.vendorId,
      },
    });

    if (!vendor) {
      return {
        success: false,
        error: "Vendor not found.",
      };
    }

    if (!vendor.isActive) {
      return {
        success: false,
        error: "Cannot create a purchase for an inactive vendor.",
      };
    }

    /* -----------------------------------------------------
       Verify products
    ----------------------------------------------------- */

    const productIds = [
      ...new Set(input.tubs.map((tub) => tub.productId)),
    ];

    if (productIds.length > 0) {
      const products = await prisma.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
      });

      if (products.length !== productIds.length) {
        return {
          success: false,
          error: "One or more products were not found.",
        };
      }

      const invalidProduct = products.find(
        (product) => product.vendorId !== input.vendorId,
      );

      if (invalidProduct) {
        return {
          success: false,
          error: "A product does not belong to the selected vendor.",
        };
      }
    }

    /* -----------------------------------------------------
       Create purchase
    ----------------------------------------------------- */

    const purchase = await prisma.purchase.create({
      data: {
        vendorId: input.vendorId,

        purchaseDate: input.purchaseDate
          ? new Date(input.purchaseDate)
          : new Date(),

        grossWeight: input.grossWeight,

        netWeight: input.netWeight,

        netWeightOverridden: input.netWeightOverridden,

        vendorCompleted: input.vendorCompleted,

        completed: input.completed,

        tubs: {
          create: input.tubs.map((tub) => ({
            productId: tub.productId,
            number: tub.number,
            weight: tub.weight,
          })),
        },
      },

      include: {
        vendor: true,

        tubs: {
          include: {
            product: true,
          },

          orderBy: {
            number: "asc",
          },
        },
      },
    });

    return {
      success: true,
      purchase: serializePurchase(purchase),
    };
  } catch (error) {
    console.error("createPurchase error:", error);

    return {
      success: false,
      error: "Failed to create purchase.",
    };
  }
}

/* =========================================================
   GET PURCHASE
========================================================= */

export async function getPurchase(
  id: string,
): Promise<PurchaseResponse | ErrorResponse> {
  try {
    const session = await requireAuth();

    if (!session) {
      return {
        success: false,
        error: "Unauthorized.",
      };
    }

    if (!id) {
      return {
        success: false,
        error: "Purchase ID is required.",
      };
    }

    const purchase = await prisma.purchase.findUnique({
      where: {
        id,
      },

      include: {
        vendor: true,

        tubs: {
          include: {
            product: true,
          },

          orderBy: {
            number: "asc",
          },
        },
      },
    });

    if (!purchase) {
      return {
        success: false,
        error: "Purchase not found.",
      };
    }

    return {
      success: true,
      purchase: serializePurchase(purchase),
    };
  } catch (error) {
    console.error("getPurchase error:", error);

    return {
      success: false,
      error: "Failed to load purchase.",
    };
  }
}

/* =========================================================
   UPDATE PURCHASE
   ADMIN ONLY
========================================================= */

export async function updatePurchase(
  data: PurchaseInput,
): Promise<PurchaseResponse | ErrorResponse> {
  try {
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
        error: "Only administrators can edit purchases.",
      };
    }

    if (!data.id) {
      return {
        success: false,
        error: "Purchase ID is required.",
      };
    }

    const parsed = purchaseSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid purchase data.",
      };
    }

    const input = parsed.data;

    /* -----------------------------------------------------
       Verify purchase
    ----------------------------------------------------- */

    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        id: input.id,
      },
    });

    if (!existingPurchase) {
      return {
        success: false,
        error: "Purchase not found.",
      };
    }

    /* -----------------------------------------------------
       Verify vendor
    ----------------------------------------------------- */

    const vendor = await prisma.vendor.findUnique({
      where: {
        id: input.vendorId,
      },
    });

    if (!vendor) {
      return {
        success: false,
        error: "Vendor not found.",
      };
    }

    /* -----------------------------------------------------
       Verify products
    ----------------------------------------------------- */

    const productIds = [
      ...new Set(input.tubs.map((tub) => tub.productId)),
    ];

    if (productIds.length > 0) {
      const products = await prisma.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
      });

      if (products.length !== productIds.length) {
        return {
          success: false,
          error: "One or more products were not found.",
        };
      }

      const invalidProduct = products.find(
        (product) => product.vendorId !== input.vendorId,
      );

      if (invalidProduct) {
        return {
          success: false,
          error: "A product does not belong to the selected vendor.",
        };
      }
    }

    /* -----------------------------------------------------
       Transaction
       
       Update purchase and replace tubs atomically.
    ----------------------------------------------------- */

    const purchase = await prisma.$transaction(async (tx) => {
      await tx.purchaseTub.deleteMany({
        where: {
          purchaseId: input.id!,
        },
      });

      return tx.purchase.update({
        where: {
          id: input.id!,
        },

        data: {
          vendorId: input.vendorId,

          purchaseDate: input.purchaseDate
            ? new Date(input.purchaseDate)
            : existingPurchase.purchaseDate,

          grossWeight: input.grossWeight,

          netWeight: input.netWeight,

          netWeightOverridden: input.netWeightOverridden,

          vendorCompleted: input.vendorCompleted,

          completed: input.completed,

          tubs: {
            create: input.tubs.map((tub) => ({
              productId: tub.productId,
              number: tub.number,
              weight: tub.weight,
            })),
          },
        },

        include: {
          vendor: true,

          tubs: {
            include: {
              product: true,
            },

            orderBy: {
              number: "asc",
            },
          },
        },
      });
    });

    return {
      success: true,
      purchase: serializePurchase(purchase),
    };
  } catch (error) {
    console.error("updatePurchase error:", error);

    return {
      success: false,
      error: "Failed to update purchase.",
    };
  }
}

/* =========================================================
   COMPLETE VENDOR PURCHASE
========================================================= */

export async function completeVendorPurchase(
  purchaseId: string,
): Promise<PurchaseResponse | ErrorResponse> {
  try {
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
        error: "You do not have permission to complete purchases.",
      };
    }

    if (!purchaseId) {
      return {
        success: false,
        error: "Purchase ID is required.",
      };
    }

    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        id: purchaseId,
      },
    });

    if (!existingPurchase) {
      return {
        success: false,
        error: "Purchase not found.",
      };
    }

    if (existingPurchase.vendorCompleted) {
      return {
        success: false,
        error: "Vendor purchase is already completed.",
      };
    }

    const purchase = await prisma.purchase.update({
      where: {
        id: purchaseId,
      },

      data: {
        vendorCompleted: true,
      },

      include: {
        vendor: true,

        tubs: {
          include: {
            product: true,
          },

          orderBy: {
            number: "asc",
          },
        },
      },
    });

    return {
      success: true,
      purchase: serializePurchase(purchase),
    };
  } catch (error) {
    console.error("completeVendorPurchase error:", error);

    return {
      success: false,
      error: "Failed to complete vendor purchase.",
    };
  }
}

/* =========================================================
   COMPLETE OVERALL PURCHASE
========================================================= */

export async function completePurchase(
  purchaseId: string,
): Promise<PurchaseResponse | ErrorResponse> {
  try {
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
        error: "You do not have permission to complete purchases.",
      };
    }

    if (!purchaseId) {
      return {
        success: false,
        error: "Purchase ID is required.",
      };
    }

    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        id: purchaseId,
      },
    });

    if (!existingPurchase) {
      return {
        success: false,
        error: "Purchase not found.",
      };
    }

    if (!existingPurchase.vendorCompleted) {
      return {
        success: false,
        error: "Complete the vendor purchase before completing the overall purchase.",
      };
    }

    if (existingPurchase.completed) {
      return {
        success: false,
        error: "Purchase is already completed.",
      };
    }

    const purchase = await prisma.purchase.update({
      where: {
        id: purchaseId,
      },

      data: {
        completed: true,
      },

      include: {
        vendor: true,

        tubs: {
          include: {
            product: true,
          },

          orderBy: {
            number: "asc",
          },
        },
      },
    });

    return {
      success: true,
      purchase: serializePurchase(purchase),
    };
  } catch (error) {
    console.error("completePurchase error:", error);

    return {
      success: false,
      error: "Failed to complete purchase.",
    };
  }
}

/* =========================================================
   DELETE PURCHASE
   ADMIN ONLY
========================================================= */

export async function deletePurchase(
  purchaseId: string,
): Promise<{ success: true } | ErrorResponse> {
  try {
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
        error: "Only administrators can delete purchases.",
      };
    }

    if (!purchaseId) {
      return {
        success: false,
        error: "Purchase ID is required.",
      };
    }

    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        id: purchaseId,
      },
    });

    if (!existingPurchase) {
      return {
        success: false,
        error: "Purchase not found.",
      };
    }

    await prisma.purchase.delete({
      where: {
        id: purchaseId,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("deletePurchase error:", error);

    return {
      success: false,
      error: "Failed to delete purchase.",
    };
  }
}