import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: "ADMIN" | "MANAGER" | "VIEWER";
    } & DefaultSession["user"];
  }

  interface User {
    username: string;
    role: "ADMIN" | "MANAGER" | "VIEWER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: "ADMIN" | "MANAGER" | "VIEWER";
  }
}