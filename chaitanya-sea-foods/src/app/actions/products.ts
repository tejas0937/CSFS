"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
  requireAuth,
  canCreateRecords,
  canEditRecords,
  canDeleteRecords,
} from "@/lib/authorization";

const productSchema = z.object({
  vendorId: z
    .string()
    .trim()
    .min(1, "Vendor ID is required."),

  name: z
    .string()
    .trim()
    .min(1, "Product name is required.")
    .max(100, "Product name is too long."),

  grade: z
    .string()
    .trim()
    .min(1, "Grade is required.")
    .max(100, "Grade is too long."),

  countPerKg: z
    .string()
    .trim()
    .min(1, "Count per kg is required.")
    .max(50, "Count per kg is too long."),
});

type ProductInput = z.infer<typeof productSchema>;

type ErrorResponse = {
  success: false;
  error: string;
};

type SerializedProduct = {
  id: string;
  vendorId: string;
  name: string;
  grade: string;
  countPerKg: string;
  createdAt: string;
  updatedAt: string;
};

type ProductResponse =
  | {
      success: true;
      product: SerializedProduct;
    }
  | ErrorResponse;

type ProductListResponse =
  | {
      success: true;
      products: SerializedProduct[];
    }
  | ErrorResponse;

type DeleteResponse =
  | {
      success: true;
    }
  | ErrorResponse;

function serializeProduct(product: {
  id: string;
  vendorId: string;
  name: string;
  grade: string;
  countPerKg: string;
  createdAt: Date;
  updatedAt: Date;
}): SerializedProduct {
  return {
    id: product.id,
    vendorId: product.vendorId,
    name: product.name,
    grade: product.grade,
    countPerKg: product.countPerKg,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

/**
 * Get all products belonging to one vendor.
 */
export async function getProductsByVendor(
  vendorId: string
): Promise<ProductListResponse> {
  const session = await requireAuth();

  if (!session) {
    return {
      success: false,
      error: "Unauthorized.",
    };
  }

  if (!vendorId) {
    return {
      success: false,
      error: "Vendor ID is required.",
    };
  }

  try {
    const vendor = await prisma.vendor.findUnique({
      where: {
        id: vendorId,
      },
      select: {
        id: true,
      },
    });

    if (!vendor) {
      return {
        success: false,
        error: "Vendor not found.",
      };
    }

    const products = await prisma.product.findMany({
      where: {
        vendorId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return {
      success: true,
      products: products.map(serializeProduct),
    };
  } catch (error) {
    console.error("Get products by vendor error:", error);

    return {
      success: false,
      error: "Failed to load products.",
    };
  }
}

/**
 * Create a new product for a vendor.
 */
export async function createProduct(
  data: ProductInput
): Promise<ProductResponse> {
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
      error: "You do not have permission to create products.",
    };
  }

  const parsed = productSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]?.message ??
        "Invalid product data.",
    };
  }

  try {
    const vendor = await prisma.vendor.findUnique({
      where: {
        id: parsed.data.vendorId,
      },
      select: {
        id: true,
        isActive: true,
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
        error: "Cannot add a product to an inactive vendor.",
      };
    }

    const product = await prisma.product.create({
      data: {
        vendorId: parsed.data.vendorId,
        name: parsed.data.name,
        grade: parsed.data.grade,
        countPerKg: parsed.data.countPerKg,
      },
    });

    return {
      success: true,
      product: serializeProduct(product),
    };
  } catch (error) {
    console.error("Create product error:", error);

    return {
      success: false,
      error: "Failed to create product.",
    };
  }
}

/**
 * Update an existing product.
 */
export async function updateProduct(
  id: string,
  data: ProductInput
): Promise<ProductResponse> {
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
      error: "You do not have permission to edit products.",
    };
  }

  if (!id) {
    return {
      success: false,
      error: "Product ID is required.",
    };
  }

  const parsed = productSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]?.message ??
        "Invalid product data.",
    };
  }

  try {
    const existingProduct = await prisma.product.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        vendorId: true,
      },
    });

    if (!existingProduct) {
      return {
        success: false,
        error: "Product not found.",
      };
    }

    if (existingProduct.vendorId !== parsed.data.vendorId) {
      return {
        success: false,
        error: "Product cannot be moved to another vendor.",
      };
    }

    const product = await prisma.product.update({
      where: {
        id,
      },
      data: {
        name: parsed.data.name,
        grade: parsed.data.grade,
        countPerKg: parsed.data.countPerKg,
      },
    });

    return {
      success: true,
      product: serializeProduct(product),
    };
  } catch (error) {
    console.error("Update product error:", error);

    return {
      success: false,
      error: "Failed to update product.",
    };
  }
}

/**
 * Delete a product.
 *
 * Because Product -> Tub uses onDelete: Cascade,
 * deleting a product also deletes its tubs.
 */
export async function deleteProduct(
  id: string
): Promise<DeleteResponse> {
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
      error: "You do not have permission to delete products.",
    };
  }

  if (!id) {
    return {
      success: false,
      error: "Product ID is required.",
    };
  }

  try {
    const product = await prisma.product.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!product) {
      return {
        success: false,
        error: "Product not found.",
      };
    }

    await prisma.product.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Delete product error:", error);

    return {
      success: false,
      error: "Failed to delete product.",
    };
  }
}