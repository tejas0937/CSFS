"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createVendor,
  getActiveVendors,
} from "@/app/actions/vendors";
import {
  createProduct,
  deleteProduct,
  getProductsByVendor,
  updateProduct,
} from "@/app/actions/products";

type Role = "ADMIN" | "MANAGER" | "VIEWER";

type Tub = {
  id: string;
  number: number;
  weight: number;
};

type Product = {
  id: string;
  name: string;
  grade: string;
  countPerKg: string;
  tubs: Tub[];
};

type Vendor = {
  id: string;
  name: string;
  products: Product[];
};

type DashboardShellProps = {
  userName: string;
  role: Role;
  purchaseDate: string;
};

const GRADE_OPTIONS = [
  "Premium",
  "A",
  "B",
  "C",
  "D",
  "Headless",
  "QD",
];

export default function DashboardShell({
  userName,
  role,
  purchaseDate,
}: DashboardShellProps) {
  const router = useRouter();

  const [vendors, setVendors] =
    useState<Vendor[]>([]);

  const [selectedVendorId, setSelectedVendorId] =
    useState("");

  const [selectedProductId, setSelectedProductId] =
    useState("");

  const [isLoadingVendors, setIsLoadingVendors] =
    useState(true);

  const [showAddVendorModal, setShowAddVendorModal] =
    useState(false);

  const [isAddingVendor, setIsAddingVendor] =
    useState(false);

  const [newVendorName, setNewVendorName] =
    useState("");

  const [newVendorContact, setNewVendorContact] =
    useState("");

  const [newVendorPhone, setNewVendorPhone] =
    useState("");

  const [newVendorEmail, setNewVendorEmail] =
    useState("");

  const [newVendorError, setNewVendorError] =
    useState("");

  const [tubWeight, setTubWeight] =
    useState("");

  const [manualNetWeight, setManualNetWeight] =
    useState(false);

  const [netWeightOverride, setNetWeightOverride] =
    useState("");

  const [purchaseCompleted, setPurchaseCompleted] =
    useState(false);

  const [completedVendors, setCompletedVendors] =
    useState<string[]>([]);

  const [showMenu, setShowMenu] =
    useState(false);

  const [isNavigatingToUsers, setIsNavigatingToUsers] =
    useState(false);

  const [showAddProductModal, setShowAddProductModal] =
    useState(false);

  const [isAddingProduct, setIsAddingProduct] =
    useState(false);

  const [newProductName, setNewProductName] =
    useState("");

  const [newProductGrade, setNewProductGrade] =
    useState(GRADE_OPTIONS[0]);

  const [newProductCountPerKg, setNewProductCountPerKg] =
    useState("");

  const [newProductError, setNewProductError] =
    useState("");

  const [isSavingProduct, setIsSavingProduct] =
    useState(false);

  const [productMessage, setProductMessage] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadVendors() {
      setIsLoadingVendors(true);

      try {
        const result = await getActiveVendors();

        if (cancelled) {
          return;
        }

        if (!result.success || result.vendors.length === 0) {
          setVendors([]);
          setSelectedVendorId("");
          setSelectedProductId("");
          return;
        }

        const databaseVendors: Vendor[] =
          await Promise.all(
            result.vendors.map(async (vendor) => {
              const productsResult =
                await getProductsByVendor(vendor.id);

              const products: Product[] =
                productsResult.success
                  ? productsResult.products.map((product) => ({
                      id: product.id,
                      name: product.name,
                      grade: product.grade,
                      countPerKg: product.countPerKg,
                      tubs: [],
                    }))
                  : [];

              return {
                id: vendor.id,
                name: vendor.name,
                products,
              };
            }),
          );

        if (cancelled) {
          return;
        }

        setVendors(databaseVendors);

        const firstVendor = databaseVendors[0];

        setSelectedVendorId(firstVendor?.id ?? "");
        setSelectedProductId(firstVendor?.products[0]?.id ?? "");
      } catch (error) {
        console.error("Load dashboard data error:", error);

        if (!cancelled) {
          setVendors([]);
          setSelectedVendorId("");
          setSelectedProductId("");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingVendors(false);
        }
      }
    }

    loadVendors();

    return () => {
      cancelled = true;
    };
  }, []);

  const canCreate =
    role === "ADMIN" ||
    role === "MANAGER";

  const canEditProducts = role === "ADMIN";

  const canOverrideNetWeight =
    role === "ADMIN";

  const selectedVendor = useMemo(
    () =>
      vendors.find(
        (vendor) =>
          vendor.id === selectedVendorId,
      ),
    [vendors, selectedVendorId],
  );

  const selectedProduct = useMemo(
    () =>
      selectedVendor?.products.find(
        (product) =>
          product.id === selectedProductId,
      ),
    [selectedVendor, selectedProductId],
  );

  const currentTubs = useMemo(
    () => selectedProduct?.tubs ?? [],
    [selectedProduct],
  );

  const selectedVendorCompleted =
    selectedVendor
      ? completedVendors.includes(
          selectedVendor.id,
        )
      : false;

  const workspaceFrozen =
    purchaseCompleted ||
    selectedVendorCompleted;

  const totalWeight =
    currentTubs.reduce(
      (total, tub) =>
        total + tub.weight,
      0,
    );

  const calculatedNetWeight =
    totalWeight * 0.95;

  const netWeight =
    manualNetWeight
      ? Number(
          netWeightOverride || 0,
        )
      : calculatedNetWeight;

  const nextTubNumber = useMemo(() => {
    if (currentTubs.length === 0) {
      return 1;
    }

    return (
      Math.max(
        ...currentTubs.map(
          (tub) => tub.number,
        ),
      ) + 1
    );
  }, [currentTubs]);

  async function handleAddVendor() {
    setNewVendorError("");

    if (!newVendorName.trim()) {
      setNewVendorError(
        "Vendor name is required.",
      );
      return;
    }

    if (!newVendorPhone.trim()) {
      setNewVendorError(
        "Phone number is required.",
      );
      return;
    }

    setIsAddingVendor(true);

    try {
      const result = await createVendor({
        name: newVendorName.trim(),
        contactPerson:
          newVendorContact.trim(),
        phone: newVendorPhone.trim(),
        alternatePhone: "",
        email: newVendorEmail.trim(),
        address: "",
        notes: "",
      });

      if (!result.success) {
        setNewVendorError(result.error);
        return;
      }

      const newVendor: Vendor = {
        id: result.vendor.id,
        name: result.vendor.name,
        products: [],
      };

      setVendors((currentVendors) => [
        ...currentVendors,
        newVendor,
      ]);

      setSelectedVendorId(newVendor.id);
      setSelectedProductId("");

      setNewVendorName("");
      setNewVendorContact("");
      setNewVendorPhone("");
      setNewVendorEmail("");
      setNewVendorError("");

      setShowAddVendorModal(false);
    } catch (error) {
      console.error(
        "Add vendor error:",
        error,
      );

      setNewVendorError(
        "Something went wrong while adding the vendor.",
      );
    } finally {
      setIsAddingVendor(false);
    }
  }

  function openAddProductModal() {
    if (!canCreate || workspaceFrozen) {
      return;
    }

    setNewProductName("");
    setNewProductGrade(GRADE_OPTIONS[0]);
    setNewProductCountPerKg("");
    setNewProductError("");
    setShowAddProductModal(true);
  }

  async function handleAddProduct() {
    setNewProductError("");
    setProductMessage("");

    if (!selectedVendor) {
      setNewProductError("Please select a vendor first.");
      return;
    }

    if (!newProductName.trim()) {
      setNewProductError("Product name is required.");
      return;
    }

    if (!newProductCountPerKg.trim()) {
      setNewProductError("Count per kg is required.");
      return;
    }

    setIsAddingProduct(true);

    try {
      const result = await createProduct({
        vendorId: selectedVendor.id,
        name: newProductName.trim(),
        grade: newProductGrade,
        countPerKg: newProductCountPerKg.trim(),
      });

      if (!result.success) {
        setNewProductError(result.error);
        return;
      }

      const newProduct: Product = {
        id: result.product.id,
        name: result.product.name,
        grade: result.product.grade,
        countPerKg: result.product.countPerKg,
        tubs: [],
      };

      setVendors((current) =>
        current.map((vendor) =>
          vendor.id === selectedVendor.id
            ? {
                ...vendor,
                products: [...vendor.products, newProduct],
              }
            : vendor,
        ),
      );

      setSelectedProductId(newProduct.id);
      setShowAddProductModal(false);
      setProductMessage("Product created successfully.");
    } catch (error) {
      console.error("Add product error:", error);
      setNewProductError(
        "Something went wrong while adding the product.",
      );
    } finally {
      setIsAddingProduct(false);
    }
  }

  function selectVendor(
    vendorId: string,
  ) {
    if (purchaseCompleted) {
      return;
    }

    const vendor =
      vendors.find(
        (item) =>
          item.id === vendorId,
      );

    if (!vendor) {
      return;
    }

    setSelectedVendorId(vendorId);

    setSelectedProductId(
      vendor.products[0]?.id ?? "",
    );

    setManualNetWeight(false);
    setNetWeightOverride("");
  }

  function cancelVendor(
    vendorId: string,
  ) {
    if (purchaseCompleted) {
      return;
    }

    const remainingVendors =
      vendors.filter(
        (vendor) =>
          vendor.id !== vendorId,
      );

    if (
      remainingVendors.length === 0
    ) {
      return;
    }

    setVendors(remainingVendors);

    if (
      selectedVendorId ===
      vendorId
    ) {
      const nextVendor =
        remainingVendors[0];

      setSelectedVendorId(
        nextVendor.id,
      );

      setSelectedProductId(
        nextVendor.products[0]?.id ??
          "",
      );
    }

    setCompletedVendors(
      (current) =>
        current.filter(
          (id) =>
            id !== vendorId,
        ),
    );
  }

  function selectProduct(
    productId: string,
  ) {
    if (workspaceFrozen) {
      return;
    }

    setSelectedProductId(
      productId,
    );

    setManualNetWeight(false);
    setNetWeightOverride("");
  }

  async function cancelProduct(
    productId: string,
  ) {
    if (
      !selectedVendor ||
      workspaceFrozen ||
      role !== "ADMIN"
    ) {
      return;
    }

    setProductMessage("");

    const result = await deleteProduct(productId);

    if (!result.success) {
      setProductMessage(result.error);
      return;
    }

    const remainingProducts = selectedVendor.products.filter(
      (product) => product.id !== productId,
    );

    setVendors((current) =>
      current.map((vendor) =>
        vendor.id === selectedVendor.id
          ? { ...vendor, products: remainingProducts }
          : vendor,
      ),
    );

    if (selectedProductId === productId) {
      setSelectedProductId(remainingProducts[0]?.id ?? "");
    }

    setProductMessage("Product deleted successfully.");
  }

  function updateProductName(
    name: string,
  ) {
    if (
      !selectedVendor ||
      !selectedProduct ||
      workspaceFrozen
    ) {
      return;
    }

    setVendors(
      (current) =>
        current.map(
          (vendor) =>
            vendor.id ===
            selectedVendor.id
              ? {
                  ...vendor,
                  products:
                    vendor.products.map(
                      (product) =>
                        product.id ===
                        selectedProduct.id
                          ? {
                              ...product,
                              name,
                            }
                          : product,
                    ),
                }
              : vendor,
        ),
    );
  }

  function updateGrade(
    grade: string,
  ) {
    if (
      !selectedVendor ||
      !selectedProduct ||
      workspaceFrozen
    ) {
      return;
    }

    setVendors(
      (current) =>
        current.map(
          (vendor) =>
            vendor.id ===
            selectedVendor.id
              ? {
                  ...vendor,
                  products:
                    vendor.products.map(
                      (product) =>
                        product.id ===
                        selectedProduct.id
                          ? {
                              ...product,
                              grade,
                            }
                          : product,
                    ),
                }
              : vendor,
        ),
    );
  }

  function updateCountPerKg(
    countPerKg: string,
  ) {
    if (
      !selectedVendor ||
      !selectedProduct ||
      workspaceFrozen
    ) {
      return;
    }

    setVendors(
      (current) =>
        current.map(
          (vendor) =>
            vendor.id ===
            selectedVendor.id
              ? {
                  ...vendor,
                  products:
                    vendor.products.map(
                      (product) =>
                        product.id ===
                        selectedProduct.id
                          ? {
                              ...product,
                              countPerKg,
                            }
                          : product,
                    ),
                }
              : vendor,
        ),
    );
  }

  function addTub() {
    if (
      !selectedVendor ||
      !selectedProduct ||
      workspaceFrozen
    ) {
      return;
    }

    const weight =
      Number(tubWeight);

    if (
      !Number.isFinite(weight) ||
      weight <= 0
    ) {
      return;
    }

    const newTub: Tub = {
      id: `${selectedProduct.id}-tub-${Date.now()}`,
      number: nextTubNumber,
      weight,
    };

    setVendors(
      (current) =>
        current.map(
          (vendor) =>
            vendor.id ===
            selectedVendor.id
              ? {
                  ...vendor,
                  products:
                    vendor.products.map(
                      (product) =>
                        product.id ===
                        selectedProduct.id
                          ? {
                              ...product,
                              tubs: [
                                ...product.tubs,
                                newTub,
                              ],
                            }
                          : product,
                    ),
                }
              : vendor,
        ),
    );

    if (manualNetWeight) {
      setNetWeightOverride(
        (
          Number(
            netWeightOverride || 0,
          ) +
          weight * 0.95
        ).toFixed(2),
      );
    }

    setTubWeight("");
  }

  function removeTub(
    tubId: string,
  ) {
    if (
      !selectedVendor ||
      !selectedProduct ||
      workspaceFrozen
    ) {
      return;
    }

    setVendors(
      (current) =>
        current.map(
          (vendor) =>
            vendor.id ===
            selectedVendor.id
              ? {
                  ...vendor,
                  products:
                    vendor.products.map(
                      (product) =>
                        product.id ===
                        selectedProduct.id
                          ? {
                              ...product,
                              tubs:
                                product.tubs.filter(
                                  (tub) =>
                                    tub.id !==
                                    tubId,
                                ),
                            }
                          : product,
                    ),
                }
              : vendor,
        ),
    );
  }

  function applyNetWeightOverride() {
    if (
      !canOverrideNetWeight ||
      workspaceFrozen ||
      !netWeightOverride
    ) {
      return;
    }

    const value =
      Number(netWeightOverride);

    if (
      !Number.isFinite(value) ||
      value < 0
    ) {
      return;
    }

    setManualNetWeight(true);
  }

  function resetNetWeight() {
    if (
      !canOverrideNetWeight ||
      workspaceFrozen
    ) {
      return;
    }

    setManualNetWeight(false);
    setNetWeightOverride("");
  }

  async function saveCurrentProduct() {
    if (
      workspaceFrozen ||
      !selectedVendor ||
      !selectedProduct ||
      !canEditProducts
    ) {
      return;
    }

    setIsSavingProduct(true);
    setProductMessage("");

    try {
      const result = await updateProduct(
        selectedProduct.id,
        {
          vendorId: selectedVendor.id,
          name: selectedProduct.name.trim(),
          grade: selectedProduct.grade.trim(),
          countPerKg: selectedProduct.countPerKg.trim(),
        },
      );

      if (!result.success) {
        setProductMessage(result.error);
        return;
      }

      setVendors((current) =>
        current.map((vendor) =>
          vendor.id === selectedVendor.id
            ? {
                ...vendor,
                products: vendor.products.map((product) =>
                  product.id === result.product.id
                    ? {
                        ...product,
                        name: result.product.name,
                        grade: result.product.grade,
                        countPerKg: result.product.countPerKg,
                      }
                    : product,
                ),
              }
            : vendor,
        ),
      );

      setProductMessage("Product details saved successfully.");
    } catch (error) {
      console.error("Save product error:", error);
      setProductMessage("Failed to save product details.");
    } finally {
      setIsSavingProduct(false);
    }
  }

  function completeVendor() {
    if (
      !selectedVendor ||
      purchaseCompleted
    ) {
      return;
    }

    if (
      completedVendors.includes(
        selectedVendor.id,
      )
    ) {
      return;
    }

    setCompletedVendors(
      (current) => [
        ...current,
        selectedVendor.id,
      ],
    );
  }

  function completePurchase() {
    if (purchaseCompleted) {
      return;
    }

    setPurchaseCompleted(true);
  }

  function createNewPurchase() {
    setPurchaseCompleted(false);
    setCompletedVendors([]);

    const firstVendor = vendors[0];

    setSelectedVendorId(firstVendor?.id ?? "");
    setSelectedProductId(firstVendor?.products[0]?.id ?? "");

    setManualNetWeight(false);
    setNetWeightOverride("");
    setTubWeight("");
    setProductMessage("");
  }

  function openUserManagement() {
    if (isNavigatingToUsers) {
      return;
    }

    setIsNavigatingToUsers(true);

    router.push("/admin/users/");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#fffaf5] text-slate-900">

      {/* ===================================================== */}
      {/* NAVBAR */}
      {/* ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-orange-100 bg-white/90 shadow-sm backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-10">

          <div className="min-w-0">

            <h1 className="truncate text-xs font-black tracking-wide text-amber-800 sm:text-sm lg:text-base">
              CHAITANYA SEA FOODS SYNDICATE
            </h1>

            <p className="hidden text-[10px] font-medium text-slate-500 sm:block">
              Business Management System
            </p>

          </div>

          <nav className="hidden items-center gap-1 lg:flex">

            <a
              href="#purchase"
              className="rounded-full bg-orange-50 px-4 py-2 text-sm font-bold text-orange-700 shadow-sm transition hover:bg-orange-100"
            >
              Purchase
            </a>

            <a
              href="#sell"
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-orange-50 hover:text-orange-700"
            >
              Sell
            </a>

            <a
              href="#expense"
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-orange-50 hover:text-orange-700"
            >
              Expense
            </a>

            <a
              href="#reports"
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-orange-50 hover:text-orange-700"
            >
              Reports
            </a>

            <button
              type="button"
              onClick={() => {
                router.push("/api/auth/signout");
              }}
              className="ml-2 rounded-full border border-orange-200 px-4 py-2 text-sm font-bold text-orange-700 transition hover:border-orange-400 hover:bg-orange-50"
            >
              Logout
            </button>

          </nav>

          <button
            type="button"
            onClick={() =>
              setShowMenu(
                (value) => !value,
              )
            }
            className="rounded-xl border border-orange-200 bg-orange-50 p-2.5 text-orange-700 shadow-sm transition hover:bg-orange-100 lg:hidden"
            aria-label="Toggle navigation"
          >

            {showMenu ? (
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}

          </button>

        </div>

        {showMenu && (
          <div className="border-t border-orange-100 bg-white px-4 py-4 shadow-lg lg:hidden">

            <div className="mb-3 rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 px-4 py-3">

              <p className="text-sm font-black text-slate-900">
                {userName}
              </p>

              <p className="mt-1 text-xs font-bold text-orange-700">
                {role}
              </p>

            </div>

            <nav className="grid gap-1">

              {[
                ["#purchase", "Purchase"],
                ["#sell", "Sell"],
                ["#expense", "Expense"],
                ["#reports", "Reports"],
              ].map(
                ([href, label]) => (
                  <a
                    key={href}
                    href={href}
                    onClick={() =>
                      setShowMenu(false)
                    }
                    className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-orange-50 hover:text-orange-700"
                  >
                    {label}
                  </a>
                ),
              )}

              <button
                type="button"
                onClick={() => {
                  router.push("/api/auth/signout");
                }}
                className="mt-2 w-full rounded-xl border border-orange-200 px-3 py-3 text-left text-sm font-bold text-orange-700 hover:bg-orange-50"
              >
                Logout
              </button>

            </nav>

          </div>
        )}

      </header>


      {/* ===================================================== */}
      {/* MAIN DASHBOARD */}
      {/* ===================================================== */}

      <section
        id="purchase"
        className="relative"
      >

        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_10%,rgba(251,146,60,0.10),transparent_28%),radial-gradient(circle_at_90%_60%,rgba(253,186,116,0.10),transparent_30%)]" />

        <div className="mx-auto max-w-7xl px-2 py-3 sm:px-6 lg:px-10 lg:py-6">

          {/* CURRENT PURCHASE */}

          <section className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-[0_12px_40px_rgba(120,53,15,0.08)]">

            <div className="relative overflow-hidden border-b border-orange-100 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 px-4 py-4 text-white">

              <div className="absolute right-[-30px] top-[-50px] h-32 w-32 rounded-full bg-white/10" />

              <div className="absolute bottom-[-50px] right-[20%] h-24 w-24 rounded-full bg-white/10" />

              <div className="relative flex items-center justify-between gap-3">

                <div>

                  <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.18em] backdrop-blur-sm">

                    <span className="h-1.5 w-1.5 rounded-full bg-white" />

                    Current Purchase

                  </div>

                  <h2 className="text-xl font-black tracking-tight">
                    Today&apos;s Purchase
                  </h2>

                </div>

                <div className="rounded-2xl border border-white/20 bg-white/15 px-3 py-2 text-right backdrop-blur-sm">

                  <p className="text-[9px] font-semibold uppercase tracking-wider text-orange-50">
                    Date
                  </p>

                  <p className="text-xs font-black">
                    {purchaseDate}
                  </p>

                </div>

              </div>

            </div>


            <div className="space-y-4 p-3 sm:p-5">

              {/* CURRENT VENDOR */}

              <section>

                <div className="mb-2 flex items-center justify-between">

                  <div>

                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-orange-500">
                      Step 01
                    </p>

                    <p className="text-sm font-black text-slate-800">
                      Current Vendor
                    </p>

                  </div>

                  {canCreate &&
                    !purchaseCompleted && (
                      <button
                        type="button"
                        onClick={() => {
                          setNewVendorError("");
                          setShowAddVendorModal(true);
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-orange-200 bg-orange-50 text-xl font-bold text-orange-600 shadow-sm transition hover:scale-105 hover:bg-orange-100"
                      >
                        +
                      </button>
                    )}

                </div>

                {isLoadingVendors ? (
                  <div className="flex min-h-[58px] items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 p-4 shadow-inner">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-orange-200 border-t-orange-500" />
                      Loading vendors...
                    </div>
                  </div>
                ) : (
                  <div className="flex overflow-x-auto rounded-2xl border border-sky-200 bg-sky-50 p-1 shadow-inner">

                  {vendors.map(
                    (vendor) => {

                      const active =
                        vendor.id ===
                        selectedVendorId;

                      const completed =
                        completedVendors.includes(
                          vendor.id,
                        );

                      return (
                        <div
                          key={vendor.id}
                          className={`mr-1 flex min-w-[74px] shrink-0 items-center overflow-hidden rounded-xl transition ${
                            active
                              ? "bg-white shadow-md ring-2 ring-orange-300"
                              : "hover:bg-white/70"
                          }`}
                        >

                          <button
                            type="button"
                            disabled={
                              purchaseCompleted
                            }
                            onClick={() =>
                              selectVendor(
                                vendor.id,
                              )
                            }
                            className={`flex-1 px-4 py-3 text-xs font-black ${
                              active
                                ? "text-orange-700"
                                : "text-slate-600"
                            }`}
                          >
                            Vendor{" "}
                            {vendor.name}

                            {completed && (
                              <span className="ml-1 text-green-600">
                                ✓
                              </span>
                            )}

                          </button>

                          {!completed &&
                            !purchaseCompleted && (
                              <button
                                type="button"
                                onClick={() =>
                                  cancelVendor(
                                    vendor.id,
                                  )
                                }
                                className="px-2 text-sm font-black text-slate-300 transition hover:text-red-500"
                              >
                                ×
                              </button>
                            )}

                        </div>
                      );
                    },
                  )}

                  {canCreate &&
                    !purchaseCompleted && (
                      <button
                        type="button"
                        onClick={() => {
                          setNewVendorError("");
                          setShowAddVendorModal(true);
                        }}
                        className="flex min-w-[68px] shrink-0 items-center justify-center rounded-xl text-3xl font-light text-slate-500 transition hover:bg-white hover:text-orange-500"
                      >
                        +
                      </button>
                    )}

                  </div>
                )}

              </section>


              {/* PRODUCT LIST */}

              {isLoadingVendors ? (
                <section className="rounded-2xl border border-pink-100 bg-pink-50/50 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-pink-200 border-t-pink-500" />
                    Loading products...
                  </div>
                </section>
              ) : selectedVendor ? (
                <section>

                  <div className="mb-2">

                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-orange-500">
                      Step 02
                    </p>

                    <div className="flex items-center justify-between">

                      <p className="text-sm font-black text-slate-800">
                        Product List
                      </p>

                      <span className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-bold text-orange-600">
                        Vendor{" "}
                        {selectedVendor.name}
                      </span>

                    </div>

                  </div>

                  <div className="flex overflow-x-auto rounded-2xl border border-pink-200 bg-pink-50 p-1 shadow-inner">

                    {selectedVendor.products.map(
                      (product) => {

                        const active =
                          product.id ===
                          selectedProductId;

                        return (
                          <div
                            key={product.id}
                            className={`mr-1 flex min-w-[105px] shrink-0 items-center overflow-hidden rounded-xl transition ${
                              active
                                ? "bg-white shadow-md ring-2 ring-pink-300"
                                : "hover:bg-white/70"
                            }`}
                          >

                            <button
                              type="button"
                              disabled={
                                workspaceFrozen
                              }
                              onClick={() =>
                                selectProduct(
                                  product.id,
                                )
                              }
                              className={`flex-1 px-4 py-3 text-xs font-black ${
                                active
                                  ? "text-pink-700"
                                  : "text-slate-600"
                              }`}
                            >
                              {product.name}
                            </button>

                            {!workspaceFrozen && role === "ADMIN" && (
                              <button
                                type="button"
                                onClick={() =>
                                  cancelProduct(
                                    product.id,
                                  )
                                }
                                className="px-2 text-sm font-black text-slate-300 hover:text-red-500"
                              >
                                ×
                              </button>
                            )}

                          </div>
                        );
                      },
                    )}

                    {canCreate &&
                      !workspaceFrozen && (
                        <button
                          type="button"
                          onClick={openAddProductModal}
                          className="flex min-w-[68px] shrink-0 items-center justify-center rounded-xl text-3xl font-light text-slate-500 hover:bg-white hover:text-orange-500"
                        >
                          +
                        </button>
                      )}

                  </div>

                </section>
              ) : null}


              {!isLoadingVendors && vendors.length === 0 && (
                <section className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
                  <p className="text-xs font-black text-slate-600">
                    No active vendors found.
                  </p>
                  {canCreate && (
                    <button
                      type="button"
                      onClick={() => {
                        setNewVendorError("");
                        setShowAddVendorModal(true);
                      }}
                      className="mt-3 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-orange-600"
                    >
                      Add First Vendor
                    </button>
                  )}
                </section>
              )}


              {/* ACTIVE PRODUCT */}

              {selectedProduct && (
                <section className="rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50/70 via-white to-amber-50/60 p-4 shadow-sm">

                  <div className="mb-4 flex items-center justify-between">

                    <div>

                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-orange-500">
                        Step 03
                      </p>

                      <p className="text-sm font-black text-slate-900">
                        Active Product
                      </p>

                    </div>

                    {selectedVendorCompleted && (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-[10px] font-black text-green-700">
                        Completed
                      </span>
                    )}

                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">

                    <div>

                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Product Name
                      </label>

                      <input
                        value={
                          selectedProduct.name
                        }
                        disabled={
                          workspaceFrozen || !canEditProducts
                        }
                        onChange={(event) =>
                          updateProductName(
                            event.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold shadow-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                      />

                    </div>

                    <div>

                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Grade
                      </label>

                      <select
                        value={
                          selectedProduct.grade
                        }
                        disabled={
                          workspaceFrozen || !canEditProducts
                        }
                        onChange={(event) =>
                          updateGrade(
                            event.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold shadow-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                      >
                        {GRADE_OPTIONS.map(
                          (grade) => (
                            <option
                              key={grade}
                              value={grade}
                            >
                              {grade}
                            </option>
                          ),
                        )}
                      </select>

                    </div>

                    <div>

                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Count / kg
                      </label>

                      <input
                        value={
                          selectedProduct.countPerKg
                        }
                        disabled={
                          workspaceFrozen || !canEditProducts
                        }
                        onChange={(event) =>
                          updateCountPerKg(
                            event.target.value,
                          )
                        }
                        placeholder="Example 40"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold shadow-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                      />

                    </div>

                  </div>

                </section>
              )}


              {/* TUB MANAGEMENT */}

              {selectedProduct && (
                <section>

                  <div className="mb-3 flex items-center justify-between">

                    <div>

                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-orange-500">
                        Step 04
                      </p>

                      <p className="text-sm font-black text-slate-900">
                        Tub Management
                      </p>

                    </div>

                    <div className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5">

                      <span className="text-[10px] font-black text-orange-700">
                        {currentTubs.length} Tubs
                      </span>

                    </div>

                  </div>


                  <div className="grid grid-cols-[132px_minmax(0,1fr)] gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">

                    {/* LEFT CONTROL PANEL */}

                    <div className="space-y-3">

                      <div className="rounded-3xl border-2 border-yellow-300 bg-gradient-to-b from-yellow-50 to-amber-50 p-3 shadow-[0_8px_25px_rgba(234,179,8,0.12)]">

                        <div className="mb-3">

                          <div className="mb-1.5 flex items-center justify-between">

                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                              Tub Number
                            </label>

                            <span className="rounded-full bg-yellow-200 px-2 py-0.5 text-[9px] font-black text-yellow-800">
                              AUTO
                            </span>

                          </div>

                          <div className="flex h-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white text-sm font-black text-slate-700 shadow-inner">
                            TN{" "}
                            {nextTubNumber}
                          </div>

                        </div>


                        <div>

                          <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-600">
                            Tub Weight
                          </label>

                          <div className="relative">

                            <input
                              value={tubWeight}
                              disabled={
                                workspaceFrozen
                              }
                              onChange={(
                                event,
                              ) =>
                                setTubWeight(
                                  event.target
                                    .value,
                                )
                              }
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              className="h-11 w-full rounded-xl border-2 border-slate-300 bg-white px-3 pr-8 text-center text-sm font-black outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                            />

                            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                              kg
                            </span>

                          </div>

                        </div>


                        <button
                          type="button"
                          disabled={
                            workspaceFrozen
                          }
                          onClick={addTub}
                          className="mt-3 w-full rounded-xl bg-red-500 px-3 py-2.5 text-xs font-black text-white shadow-md shadow-red-200 transition hover:bg-red-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Add Tub
                        </button>

                      </div>


                      {/* WEIGHT SUMMARY */}

                      <div className="rounded-3xl border-2 border-purple-300 bg-gradient-to-b from-purple-50 to-fuchsia-50 p-3 shadow-[0_8px_25px_rgba(168,85,247,0.10)]">

                        <div className="mb-3">

                          <p className="text-[9px] font-black uppercase tracking-wider text-purple-500">
                            Total Weight
                          </p>

                          <p className="mt-1 text-lg font-black text-purple-700">
                            {totalWeight.toFixed(
                              2,
                            )}
                            <span className="ml-1 text-[10px]">
                              kg
                            </span>
                          </p>

                        </div>

                        <div className="border-t border-purple-200 pt-3">

                          <p className="text-[9px] font-black uppercase tracking-wider text-purple-500">
                            Net Weight
                          </p>

                          <p className="mt-1 text-lg font-black text-purple-700">
                            {netWeight.toFixed(
                              2,
                            )}
                            <span className="ml-1 text-[10px]">
                              kg
                            </span>
                          </p>

                        </div>

                      </div>

                    </div>


                    {/* RIGHT TUB GRID */}

                    <div className="min-w-0">

                      <div className="mb-2 flex items-center justify-between">

                        <div>

                          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                            Tub Records
                          </p>

                          <p className="text-xs font-bold text-slate-600">
                            Vendor{" "}
                            {selectedVendor?.name}{" "}
                            →{" "}
                            {selectedProduct.name}
                          </p>

                        </div>

                        <span className="hidden rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black text-slate-500 sm:block">
                          Auto numbered
                        </span>

                      </div>


                      <div className="overflow-hidden rounded-2xl border-2 border-slate-800 bg-yellow-50 shadow-[0_8px_25px_rgba(15,23,42,0.08)]">

                        <div className="grid grid-cols-3 border-b-2 border-slate-800 bg-slate-900 text-white">

                          <div className="border-r border-slate-700 px-2 py-2 text-center text-[9px] font-black uppercase tracking-wider">
                            Tub
                          </div>

                          <div className="border-r border-slate-700 px-2 py-2 text-center text-[9px] font-black uppercase tracking-wider">
                            Weight
                          </div>

                          <div className="px-2 py-2 text-center text-[9px] font-black uppercase tracking-wider">
                            Action
                          </div>

                        </div>


                        {currentTubs.map(
                          (tub) => (
                            <div
                              key={tub.id}
                              className="grid grid-cols-3 border-b border-slate-800 last:border-b-0"
                            >

                              <div className="flex min-h-[58px] items-center justify-center border-r border-slate-800 bg-yellow-100 px-1">

                                <span className="text-xs font-black text-slate-800">
                                  TN{" "}
                                  {tub.number}
                                </span>

                              </div>


                              <div className="flex min-h-[58px] items-center justify-center border-r border-slate-800 bg-yellow-50 px-1">

                                <span className="text-xs font-bold text-slate-700">
                                  {tub.weight.toFixed(
                                    2,
                                  )}{" "}
                                  kg
                                </span>

                              </div>


                              <div className="flex min-h-[58px] items-center justify-center bg-yellow-50">

                                {!workspaceFrozen ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeTub(
                                        tub.id,
                                      )
                                    }
                                    className="rounded-lg px-3 py-1.5 text-xs font-black text-red-500 transition hover:bg-red-50 hover:text-red-700"
                                  >
                                    Remove
                                  </button>
                                ) : (
                                  <span className="text-[9px] font-bold text-slate-400">
                                    Locked
                                  </span>
                                )}

                              </div>

                            </div>
                          ),
                        )}


                        {currentTubs.length ===
                          0 && (
                          <div className="flex min-h-[180px] items-center justify-center bg-yellow-50 p-5 text-center">

                            <div>

                              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-200 text-lg">
                                +
                              </div>

                              <p className="text-xs font-black text-slate-600">
                                No tubs added
                              </p>

                              <p className="mt-1 text-[10px] text-slate-400">
                                Add the first tub
                                from the left panel
                              </p>

                            </div>

                          </div>
                        )}

                      </div>

                    </div>

                  </div>

                </section>
              )}


              {/* ADMIN NET WEIGHT */}

              {canOverrideNetWeight &&
                selectedProduct && (
                  <section className="rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4">

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">

                      <div className="flex-1">

                        <div className="mb-1 flex items-center gap-2">

                          <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[8px] font-black text-white">
                            ADMIN
                          </span>

                          <label className="text-[10px] font-black uppercase tracking-wider text-orange-700">
                            Net Weight Override
                          </label>

                        </div>

                        <input
                          value={
                            netWeightOverride
                          }
                          disabled={
                            workspaceFrozen
                          }
                          onChange={(
                            event,
                          ) =>
                            setNetWeightOverride(
                              event.target
                                .value,
                            )
                          }
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Enter net weight"
                          className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                        />

                      </div>

                      <div className="flex gap-2">

                        <button
                          type="button"
                          disabled={
                            workspaceFrozen
                          }
                          onClick={
                            applyNetWeightOverride
                          }
                          className="rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-black text-white shadow-sm hover:bg-orange-600 disabled:opacity-40"
                        >
                          Override
                        </button>

                        {manualNetWeight && (
                          <button
                            type="button"
                            disabled={
                              workspaceFrozen
                            }
                            onClick={
                              resetNetWeight
                            }
                            className="rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-xs font-black text-orange-700 hover:bg-orange-50"
                          >
                            Reset
                          </button>
                        )}

                      </div>

                    </div>

                    {manualNetWeight && (
                      <div className="mt-3 rounded-xl bg-orange-100 px-3 py-2">

                        <p className="text-[10px] font-bold text-orange-700">
                          Manual override active. Every
                          newly added tub contributes
                          95% of its gross weight to
                          the overridden baseline.
                        </p>

                      </div>
                    )}

                  </section>
                )}


              {/* SAVE */}

              {selectedProduct && canEditProducts && (
                <button
                  type="button"
                  disabled={
                    workspaceFrozen || isSavingProduct
                  }
                  onClick={
                    saveCurrentProduct
                  }
                  className="w-full rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isSavingProduct ? "Saving Product..." : "Save Product Details"}
                </button>
              )}

              {productMessage && (
                <div className="rounded-xl border border-orange-100 bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700">
                  {productMessage}
                </div>
              )}


              {/* COMPLETE VENDOR */}

              {selectedVendor && (
                <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                        Vendor Status
                      </p>

                      <p className="mt-1 text-sm font-black text-slate-800">
                        Vendor{" "}
                        {selectedVendor.name}
                      </p>

                    </div>

                    {selectedVendorCompleted ? (
                      <span className="inline-flex w-fit items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-xs font-black text-green-700">

                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">
                          ✓
                        </span>

                        Completed

                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={
                          purchaseCompleted
                        }
                        onClick={
                          completeVendor
                        }
                        className="rounded-xl bg-red-500 px-5 py-3 text-xs font-black text-white shadow-md shadow-red-100 transition hover:bg-red-600 disabled:opacity-40"
                      >
                        Complete Vendor
                      </button>
                    )}

                  </div>

                </section>
              )}

            </div>

          </section>


          {/* COMPLETE PURCHASE */}

          <section className="mt-4 overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm">

            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-orange-500">
                  Final Step
                </p>

                <h3 className="mt-1 text-lg font-black text-slate-900">
                  {purchaseCompleted
                    ? "Purchase Completed"
                    : "Complete Today's Purchase"}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Complete the purchase after all
                  vendor entries are finished.
                </p>

              </div>

              {purchaseCompleted ? (
                <div className="flex flex-wrap items-center gap-2">

                  <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-xs font-black text-green-700">

                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">
                      ✓
                    </span>

                    Completed

                  </span>

                  <button
                    type="button"
                    onClick={
                      createNewPurchase
                    }
                    className="rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-black text-white shadow-sm hover:bg-orange-600"
                  >
                    Create New Purchase
                  </button>

                </div>
              ) : (
                <button
                  type="button"
                  onClick={
                    completePurchase
                  }
                  className="rounded-xl bg-red-500 px-6 py-3 text-xs font-black text-white shadow-lg shadow-red-100 transition hover:bg-red-600"
                >
                  Complete Purchase
                </button>
              )}

            </div>

          </section>


          {/* SELL */}

          <section
            id="sell"
            className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                →
              </div>

              <div>

                <p className="text-[9px] font-black uppercase tracking-wider text-orange-500">
                  Sales
                </p>

                <h2 className="text-base font-black text-slate-900">
                  Sales Management
                </h2>

              </div>

            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              Sales management will be connected here.
            </p>

          </section>


          {/* EXPENSE */}

          <section
            id="expense"
            className="mt-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                ₹
              </div>

              <div>

                <p className="text-[9px] font-black uppercase tracking-wider text-orange-500">
                  Finance
                </p>

                <h2 className="text-base font-black text-slate-900">
                  Expense Management
                </h2>

              </div>

            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              Regular expenses and transport expenses
              will be connected here.
            </p>

          </section>


          {/* REPORTS */}

          <section
            id="reports"
            className="mt-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                ↗
              </div>

              <div>

                <p className="text-[9px] font-black uppercase tracking-wider text-orange-500">
                  Analytics
                </p>

                <h2 className="text-base font-black text-slate-900">
                  Business Reports
                </h2>

              </div>

            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              Purchase sales expense and supply chain
              reports will appear here.
            </p>

          </section>


          {/* MANAGE USERS */}

          {role === "ADMIN" && (
            <section className="mt-4">

              <button
                type="button"
                onClick={
                  openUserManagement
                }
                disabled={
                  isNavigatingToUsers
                }
                className="group flex w-full items-center justify-between rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-5 py-4 text-left shadow-sm transition hover:border-orange-300 hover:shadow-md disabled:cursor-wait disabled:opacity-80"
              >

                <div>

                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-orange-500">
                    Administration
                  </p>

                  <p className="mt-1 text-sm font-black text-orange-800">
                    Manage Users
                  </p>

                  <p className="mt-0.5 text-[10px] text-orange-600">
                    Manage employee portal access
                  </p>

                </div>


                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-md">

                  {isNavigatingToUsers ? (
                    <svg
                      className="h-5 w-5 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >

                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        className="stroke-white/30"
                        strokeWidth="3"
                      />

                      <path
                        d="M21 12a9 9 0 0 0-9-9"
                        className="stroke-white"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />

                    </svg>
                  ) : (
                    <span className="text-lg font-black transition group-hover:translate-x-1">
                      →
                    </span>
                  )}

                </div>

              </button>

            </section>
          )}

        </div>

      </section>



      {/* ===================================================== */}
      {/* ADD PRODUCT MODAL */}
      {/* ===================================================== */}

      {showAddProductModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-2xl">
            <div className="bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-5 text-white">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-orange-50">
                Add Product
              </p>
              <h2 className="mt-1 text-xl font-black">
                New Product
              </h2>
              <p className="mt-1 text-xs text-orange-50">
                Vendor {selectedVendor?.name ?? ""}
              </p>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Product Name
                </label>
                <input
                  autoFocus
                  value={newProductName}
                  onChange={(event) =>
                    setNewProductName(event.target.value)
                  }
                  placeholder="Example Prawns"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Grade
                  </label>
                  <select
                    value={newProductGrade}
                    onChange={(event) =>
                      setNewProductGrade(event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  >
                    {GRADE_OPTIONS.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Count / kg
                  </label>
                  <input
                    value={newProductCountPerKg}
                    onChange={(event) =>
                      setNewProductCountPerKg(event.target.value)
                    }
                    placeholder="Example 40"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </div>
              </div>

              {newProductError && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs font-bold text-red-600">
                  {newProductError}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  disabled={isAddingProduct}
                  onClick={() => setShowAddProductModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isAddingProduct}
                  onClick={handleAddProduct}
                  className="flex-1 rounded-xl bg-orange-500 px-4 py-3 text-xs font-black text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-wait disabled:opacity-50"
                >
                  {isAddingProduct ? "Adding..." : "Add Product"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* ADD VENDOR MODAL */}
      {/* ===================================================== */}

      {showAddVendorModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Add Vendor
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add a new vendor to the current purchase.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!isAddingVendor) {
                    setShowAddVendorModal(false);
                    setNewVendorError("");
                  }
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-5 px-6 py-6">

              {newVendorError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {newVendorError}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Vendor Name *
                </label>

                <input
                  type="text"
                  value={newVendorName}
                  onChange={(event) =>
                    setNewVendorName(event.target.value)
                  }
                  placeholder="Enter vendor name"
                  disabled={isAddingVendor}
                  autoFocus
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Contact Person
                </label>

                <input
                  type="text"
                  value={newVendorContact}
                  onChange={(event) =>
                    setNewVendorContact(event.target.value)
                  }
                  placeholder="Enter contact person"
                  disabled={isAddingVendor}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Phone *
                </label>

                <input
                  type="tel"
                  value={newVendorPhone}
                  onChange={(event) =>
                    setNewVendorPhone(event.target.value)
                  }
                  placeholder="Enter phone number"
                  disabled={isAddingVendor}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  value={newVendorEmail}
                  onChange={(event) =>
                    setNewVendorEmail(event.target.value)
                  }
                  placeholder="vendor@example.com"
                  disabled={isAddingVendor}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:bg-slate-50"
                />
              </div>

            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">

              <button
                type="button"
                onClick={() => {
                  if (!isAddingVendor) {
                    setShowAddVendorModal(false);
                    setNewVendorError("");
                  }
                }}
                disabled={isAddingVendor}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleAddVendor}
                disabled={isAddingVendor}
                className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAddingVendor ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Adding...
                  </span>
                ) : (
                  "Add Vendor"
                )}
              </button>

            </div>

          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* FOOTER */}
      {/* ===================================================== */}

      <footer className="mt-6 border-t border-slate-200 bg-slate-950 text-white">

        <div className="mx-auto max-w-7xl px-5 py-9 sm:px-8 lg:px-10">

          <div className="grid gap-8 md:grid-cols-2 md:items-center">

            <div>

              <h3 className="font-black tracking-wide">
                CHAITANYA SEA FOODS SYNDICATE
              </h3>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                Office No. V 990, APMC Market, Sector 19 Krushi
                Wholesale Mart, Turbhe, Navi Mumbai 400 703
              </p>

            </div>


            <div className="md:text-right">

              <p className="text-sm font-black text-orange-400">
                Contact
              </p>

              <p className="mt-2 text-sm text-slate-300">
                8108990550
              </p>

              <p className="text-sm text-slate-300">
                9595505404
              </p>

            </div>

          </div>


          <div className="mt-7 border-t border-slate-800 pt-5 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Chaitanya Sea Foods Syndicate.
          </div>

        </div>

      </footer>

    </main>
  );
}