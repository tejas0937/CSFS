export type Role = "ADMIN" | "MANAGER" | "VIEWER";

export type Tub = {
  id: string;
  number: number;
  weight: number;
};

export type Product = {
  id: string;
  name: string;
  grade: string;
  countPerKg: string;
  tubs: Tub[];
};

export type Vendor = {
  id: string;
  name: string;
  products: Product[];
};

export type DashboardShellProps = {
  userName: string;
  role: Role;
  purchaseDate: string;
};

export const GRADE_OPTIONS = [
  "Premium",
  "A",
  "B",
  "C",
  "D",
  "Headless",
  "QD",
] as const;
