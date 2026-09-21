"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

const initialVendors: Vendor[] = [
  {
    id: "vendor-a",
    name: "A",
    products: [
      {
        id: "a-prawns",
        name: "Prawns",
        grade: "Premium",
        countPerKg: "40",
        tubs: [
          {
            id: "a-prawns-t0",
            number: 0,
            weight: 12,
          },
          {
            id: "a-prawns-t1",
            number: 1,
            weight: 15,
          },
          {
            id: "a-prawns-t2",
            number: 2,
            weight: 18,
          },
          {
            id: "a-prawns-t3",
            number: 3,
            weight: 16,
          },
          {
            id: "a-prawns-t4",
            number: 4,
            weight: 20,
          },
        ],
      },
      {
        id: "a-fish",
        name: "Fish",
        grade: "A",
        countPerKg: "12",
        tubs: [
          {
            id: "a-fish-t0",
            number: 0,
            weight: 20,
          },
          {
            id: "a-fish-t1",
            number: 1,
            weight: 18,
          },
        ],
      },
    ],
  },
  {
    id: "vendor-b",
    name: "B",
    products: [
      {
        id: "b-crab",
        name: "Crab",
        grade: "B",
        countPerKg: "8",
        tubs: [
          {
            id: "b-crab-t0",
            number: 0,
            weight: 16,
          },
          {
            id: "b-crab-t1",
            number: 1,
            weight: 19,
          },
        ],
      },
      {
        id: "b-prawns",
        name: "Prawns",
        grade: "Premium",
        countPerKg: "35",
        tubs: [
          {
            id: "b-prawns-t0",
            number: 0,
            weight: 22,
          },
          {
            id: "b-prawns-t1",
            number: 1,
            weight: 18,
          },
        ],
      },
    ],
  },
  {
    id: "vendor-c",
    name: "C",
    products: [
      {
        id: "c-fish",
        name: "Fish",
        grade: "C",
        countPerKg: "15",
        tubs: [
          {
            id: "c-fish-t0",
            number: 0,
            weight: 24,
          },
          {
            id: "c-fish-t1",
            number: 1,
            weight: 20,
          },
        ],
      },
    ],
  },
  {
    id: "vendor-d",
    name: "D",
    products: [
      {
        id: "d-prawns",
        name: "Prawns",
        grade: "QD",
        countPerKg: "50",
        tubs: [
          {
            id: "d-prawns-t0",
            number: 0,
            weight: 15,
          },
          {
            id: "d-prawns-t1",
            number: 1,
            weight: 14,
          },
        ],
      },
    ],
  },
];

export default function DashboardShell({
  userName,
  role,
  purchaseDate,
}: DashboardShellProps) {
  const router = useRouter();

  const [vendors, setVendors] =
    useState<Vendor[]>(initialVendors);

  const [selectedVendorId, setSelectedVendorId] =
    useState(initialVendors[0]?.id ?? "");

  const [selectedProductId, setSelectedProductId] =
    useState(
      initialVendors[0]?.products[0]?.id ?? "",
    );

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

  const canCreate =
    role === "ADMIN" ||
    role === "MANAGER";

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

  const currentTubs =
    selectedProduct?.tubs ?? [];

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
      return 0;
    }

    return (
      Math.max(
        ...currentTubs.map(
          (tub) => tub.number,
        ),
      ) + 1
    );
  }, [currentTubs]);

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

  function cancelProduct(
    productId: string,
  ) {
    if (
      !selectedVendor ||
      workspaceFrozen
    ) {
      return;
    }

    const remainingProducts =
      selectedVendor.products.filter(
        (product) =>
          product.id !== productId,
      );

    if (
      remainingProducts.length ===
      0
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
                    remainingProducts,
                }
              : vendor,
        ),
    );

    if (
      selectedProductId ===
      productId
    ) {
      setSelectedProductId(
        remainingProducts[0].id,
      );
    }
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

  function saveCurrentProduct() {
    if (workspaceFrozen) {
      return;
    }

    // Prisma persistence will be connected here.
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

    setVendors(
      initialVendors,
    );

    const firstVendor =
      initialVendors[0];

    setSelectedVendorId(
      firstVendor?.id ?? "",
    );

    setSelectedProductId(
      firstVendor?.products[0]?.id ??
        "",
    );

    setManualNetWeight(false);
    setNetWeightOverride("");
    setTubWeight("");
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

            <a
              href="/api/auth/signout"
              className="ml-2 rounded-full border border-orange-200 px-4 py-2 text-sm font-bold text-orange-700 transition hover:border-orange-400 hover:bg-orange-50"
            >
              Logout
            </a>

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

              <a
                href="/api/auth/signout"
                className="mt-2 rounded-xl border border-orange-200 px-3 py-3 text-sm font-bold text-orange-700 hover:bg-orange-50"
              >
                Logout
              </a>

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
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-orange-200 bg-orange-50 text-xl font-bold text-orange-600 shadow-sm transition hover:scale-105 hover:bg-orange-100"
                      >
                        +
                      </button>
                    )}

                </div>

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
                        className="flex min-w-[68px] shrink-0 items-center justify-center rounded-xl text-3xl font-light text-slate-500 transition hover:bg-white hover:text-orange-500"
                      >
                        +
                      </button>
                    )}

                </div>

              </section>


              {/* PRODUCT LIST */}

              {selectedVendor && (
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

                            {!workspaceFrozen && (
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
                          className="flex min-w-[68px] shrink-0 items-center justify-center rounded-xl text-3xl font-light text-slate-500 hover:bg-white hover:text-orange-500"
                        >
                          +
                        </button>
                      )}

                  </div>

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
                          workspaceFrozen
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
                          workspaceFrozen
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
                          workspaceFrozen
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

              {selectedProduct && (
                <button
                  type="button"
                  disabled={
                    workspaceFrozen
                  }
                  onClick={
                    saveCurrentProduct
                  }
                  className="w-full rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Save Purchase Details
                </button>
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