"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";

import { requireAdmin } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

const userSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters.")
    .max(50, "Username is too long.")
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Username can contain letters, numbers, dots, underscores and hyphens."
    ),

  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name is too long."),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(100, "Password is too long."),

  role: z.enum(["ADMIN", "MANAGER", "VIEWER"]),
});

const updateUserSchema = z.object({
  id: z.string().min(1),

  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name is too long."),

  role: z.enum(["ADMIN", "MANAGER", "VIEWER"]),
});

const resetPasswordSchema = z.object({
  id: z.string().min(1),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(100, "Password is too long."),
});

const userIdSchema = z.object({
  id: z.string().min(1),
});

/*
 * Create User
 */
export async function createUserAction(formData: FormData) {
  const session = await requireAdmin();

  if (!session) {
    return {
      success: false,
      error: "Unauthorized.",
    };
  }

  const parsed = userSchema.safeParse({
    username: formData.get("username"),
    name: formData.get("name"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid user details.",
    };
  }

  const {
    username,
    name,
    password,
    role,
  } = parsed.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (existingUser) {
      return {
        success: false,
        error: "Username already exists.",
      };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        username,
        name,
        passwordHash,
        role,
        isActive: true,
      },
    });

    return {
      success: true,
      message: "User created successfully.",
    };
  } catch (error) {
    console.error("Create user error:", error);

    return {
      success: false,
      error: "Unable to create user.",
    };
  }
}

/*
 * Update User
 */
export async function updateUserAction(formData: FormData) {
  const session = await requireAdmin();

  if (!session) {
    return {
      success: false,
      error: "Unauthorized.",
    };
  }

  const parsed = updateUserSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid user details.",
    };
  }

  const {
    id,
    name,
    role,
  } = parsed.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!existingUser) {
      return {
        success: false,
        error: "User not found.",
      };
    }

    /*
     * Prevent the currently logged-in Admin
     * from accidentally changing their own role.
     */
    if (id === session.user.id && role !== "ADMIN") {
      return {
        success: false,
        error: "You cannot remove the Admin role from your own account.",
      };
    }

    await prisma.user.update({
      where: {
        id,
      },

      data: {
        name,
        role,
      },
    });

    return {
      success: true,
      message: "User updated successfully.",
    };
  } catch (error) {
    console.error("Update user error:", error);

    return {
      success: false,
      error: "Unable to update user.",
    };
  }
}

/*
 * Activate / Deactivate User
 */
export async function toggleUserStatusAction(formData: FormData) {
  const session = await requireAdmin();

  if (!session) {
    return {
      success: false,
      error: "Unauthorized.",
    };
  }

  const parsed = userIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid user.",
    };
  }

  const { id } = parsed.data;

  if (id === session.user.id) {
    return {
      success: false,
      error: "You cannot deactivate your own account.",
    };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!existingUser) {
      return {
        success: false,
        error: "User not found.",
      };
    }

    await prisma.user.update({
      where: {
        id,
      },

      data: {
        isActive: !existingUser.isActive,
      },
    });

    return {
      success: true,
      message: existingUser.isActive
        ? "User deactivated successfully."
        : "User activated successfully.",
    };
  } catch (error) {
    console.error("Toggle user status error:", error);

    return {
      success: false,
      error: "Unable to update user status.",
    };
  }
}

/*
 * Reset Password
 */
export async function resetUserPasswordAction(formData: FormData) {
  const session = await requireAdmin();

  if (!session) {
    return {
      success: false,
      error: "Unauthorized.",
    };
  }

  const parsed = resetPasswordSchema.safeParse({
    id: formData.get("id"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid password.",
    };
  }

  const {
    id,
    password,
  } = parsed.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!existingUser) {
      return {
        success: false,
        error: "User not found.",
      };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: {
        id,
      },

      data: {
        passwordHash,
      },
    });

    return {
      success: true,
      message: "Password reset successfully.",
    };
  } catch (error) {
    console.error("Reset password error:", error);

    return {
      success: false,
      error: "Unable to reset password.",
    };
  }
}

/*
 * Delete User
 */
export async function deleteUserAction(formData: FormData) {
  const session = await requireAdmin();

  if (!session) {
    return {
      success: false,
      error: "Unauthorized.",
    };
  }

  const parsed = userIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid user.",
    };
  }

  const { id } = parsed.data;

  if (id === session.user.id) {
    return {
      success: false,
      error: "You cannot delete your own account.",
    };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!existingUser) {
      return {
        success: false,
        error: "User not found.",
      };
    }

    await prisma.user.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
      message: "User deleted successfully.",
    };
  } catch (error) {
    console.error("Delete user error:", error);

    return {
      success: false,
      error: "Unable to delete user.",
    };
  }
}