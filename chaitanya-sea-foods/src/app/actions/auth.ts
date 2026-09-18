"use server";

import { signIn } from "@/auth";

export async function loginAction(formData: FormData) {
  const username = formData.get("username");
  const password = formData.get("password");

  if (
    typeof username !== "string" ||
    typeof password !== "string"
  ) {
    return {
      success: false,
      error: "Invalid username or password.",
    };
  }

  try {
    await signIn("credentials", {
      username,
      password,
      redirectTo: "/dashboard",
    });

    return {
      success: true,
    };
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "type" in error &&
      error.type === "CredentialsSignin"
    ) {
      return {
        success: false,
        error: "Invalid username or password.",
      };
    }

    throw error;
  }
}