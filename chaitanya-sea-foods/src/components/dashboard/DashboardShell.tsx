"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Role = "ADMIN" | "MANAGER" | "VIEWER";

type Tub = {
  id: string;
  number: string;
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
    name: "Vendor A",
    products: [
      {
        id: "a-prawns",
        name: "Prawns",
        grade: "Premium",
        countPerKg: "40",
        tubs: [
          {
            id: "a-prawns-t1",
            number: "TN01",
            weight: 18,
          },
          {
            id: "a-prawns-t2",
            number: "TN02",
            weight: 20,
          },
          {
            id: "a-prawns-t3",
            number: "TN03",
            weight: 17,
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
            id: "a-fish-t1",
            number: "TN01",
            weight: 25,
          },
          {
            id: "a-fish-t2",
            number: "TN02",
            weight: 21,
          },
        ],
      },
    ],
  },

  {
    id: "vendor-b",
    name: "Vendor B",
    products: [
      {
        id: "b-crab",
        name: "Crab",
        grade: "B",
        countPerKg: "8",
        tubs: [
          {
            id: "b-crab-t1",
            number: "TN01",
            weight: 16,
          },
          {
            id: "b-crab-t2",
            number: "TN02",
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
            id: "b-prawns-t1",
            number: "TN01",
            weight: 22,
          },
          {
            id: "b-prawns-t2",
            number: "TN02",
            weight: 18,
          },
        ],
      },
    ],
  },

  {
    id: "vendor-c",
    name: "Vendor C",
    products: [
      {
        id: "c-fish",
        name: "Fish",
        grade: "C",
        countPerKg: "15",
        tubs: [
          {
            id: "c-fish-t1",
            number: "TN01",
            weight: 24,
          },
          {
            id: "c-fish-t2",
            number: "TN02",
            weight: 20,
          },
        ],
      },
    ],
  },

  {
    id: "vendor-d",
    name: "Vendor D",
    products: [
      {
        id: "d-prawns",
        name: "Prawns",
        grade: "QD",
        countPerKg: "50",
        tubs: [
          {
            id: "d-prawns-t1",
            number: "TN01",
            weight: 15,
          },
          {
            id: "d-prawns-t2",
            number: "TN02",
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

  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);

  const [selectedVendorId, setSelectedVendorId] = useState(
    initialVendors[0]?.id ?? "",
  );

  const [selectedProductId, setSelectedProductId] = useState(
    initialVendors[0]?.products[0]?.id ?? "",
  );

  const [manualNetWeight, setManualNetWeight] = useState(false);
  const [netWeightOverride, setNetWeightOverride] = useState("");

  const [tubNumber, setTubNumber] = useState("");
  const [tubWeight, setTubWeight] = useState("");

  const [purchaseCompleted, setPurchaseCompleted] = useState(false);

  const [completedVendors, setCompletedVendors] = useState<string[]>([]);

  const [showMenu, setShowMenu] = useState(false);

  const canCreate = role === "ADMIN" || role === "MANAGER";
  const canOverrideNetWeight = role === "ADMIN";

  const selectedVendor = useMemo(
    () => vendors.find((vendor) => vendor.id === selectedVendorId),
    [vendors, selectedVendorId],
  );

  const selectedProduct = useMemo(
    () =>
      selectedVendor?.products.find(
        (product) => product.id === selectedProductId,
      ),
    [selectedVendor, selectedProductId],
  );

  const currentTubs = selectedProduct?.tubs ?? [];

  const selectedVendorCompleted = selectedVendor
    ? completedVendors.includes(selectedVendor.id)
    : false;

  const workspaceFrozen = purchaseCompleted || selectedVendorCompleted;

  const totalWeight = currentTubs.reduce(
    (total, tub) => total + tub.weight,
    0,
  );

  const calculatedNetWeight = totalWeight * 0.95;

  const netWeight = manualNetWeight
    ? Number(netWeightOverride || 0)
    : calculatedNetWeight;

  function selectVendor(vendorId: string) {
    if (purchaseCompleted) return;

    const vendor = vendors.find((item) => item.id === vendorId);

    if (!vendor) return;

    setSelectedVendorId(vendorId);

    const firstProduct = vendor.products[0];

    setSelectedProductId(firstProduct?.id ?? "");

    setManualNetWeight(false);
    setNetWeightOverride("");
  }

  function cancelVendor(vendorId: string) {
    if (purchaseCompleted) return;

    const remainingVendors = vendors.filter(
      (vendor) => vendor.id !== vendorId,
    );

    if (remainingVendors.length === 0) return;

    setVendors(remainingVendors);

    if (selectedVendorId === vendorId) {
      const nextVendor = remainingVendors[0];

      setSelectedVendorId(nextVendor.id);
      setSelectedProductId(nextVendor.products[0]?.id ?? "");
      setManualNetWeight(false);
      setNetWeightOverride("");
    }

    setCompletedVendors((current) =>
      current.filter((id) => id !== vendorId),
    );
  }

  function selectProduct(productId: string) {
    if (workspaceFrozen) return;

    setSelectedProductId(productId);
    setManualNetWeight(false);
    setNetWeightOverride("");
  }

  function cancelProduct(productId: string) {
    if (!selectedVendor || workspaceFrozen) return;

    const remainingProducts = selectedVendor.products.filter(
      (product) => product.id !== productId,
    );

    if (remainingProducts.length === 0) return;

    setVendors((current) =>
      current.map((vendor) =>
        vendor.id === selectedVendor.id
          ? {
              ...vendor,
              products: remainingProducts,
            }
          : vendor,
      ),
    );

    if (selectedProductId === productId) {
      setSelectedProductId(remainingProducts[0].id);
      setManualNetWeight(false);
      setNetWeightOverride("");
    }
  }

  function updateProductName(name: string) {
    if (!selectedVendor || !selectedProduct || workspaceFrozen) return;

    setVendors((current) =>
      current.map((vendor) =>
        vendor.id === selectedVendor.id
          ? {
              ...vendor,
              products: vendor.products.map((product) =>
                product.id === selectedProduct.id
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

  function updateGrade(grade: string) {
    if (!selectedVendor || !selectedProduct || workspaceFrozen) return;

    setVendors((current) =>
      current.map((vendor) =>
        vendor.id === selectedVendor.id
          ? {
              ...vendor,
              products: vendor.products.map((product) =>
                product.id === selectedProduct.id
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

  function updateCountPerKg(countPerKg: string) {
    if (!selectedVendor || !selectedProduct || workspaceFrozen) return;

    setVendors((current) =>
      current.map((vendor) =>
        vendor.id === selectedVendor.id
          ? {
              ...vendor,
              products: vendor.products.map((product) =>
                product.id === selectedProduct.id
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
      workspaceFrozen ||
      !tubNumber.trim() ||
      !tubWeight
    ) {
      return;
    }

    const weight = Number(tubWeight);

    if (!Number.isFinite(weight) || weight <= 0) return;

    const newTub: Tub = {
      id: `${selectedProduct.id}-${Date.now()}`,
      number: tubNumber.trim(),
      weight,
    };

    setVendors((current) =>
      current.map((vendor) =>
        vendor.id === selectedVendor.id
          ? {
              ...vendor,
              products: vendor.products.map((product) =>
                product.id === selectedProduct.id
                  ? {
                      ...product,
                      tubs: [...product.tubs, newTub],
                    }
                  : product,
              ),
            }
          : vendor,
      ),
    );

    if (manualNetWeight) {
      const additionalNetWeight = weight * 0.95;

      setNetWeightOverride(
        (Number(netWeightOverride || 0) + additionalNetWeight).toFixed(2),
      );
    }

    setTubNumber("");
    setTubWeight("");
  }

  function removeTub(tubId: string) {
    if (!selectedVendor || !selectedProduct || workspaceFrozen) return;

    setVendors((current) =>
      current.map((vendor) =>
        vendor.id === selectedVendor.id
          ? {
              ...vendor,
              products: vendor.products.map((product) =>
                product.id === selectedProduct.id
                  ? {
                      ...product,
                      tubs: product.tubs.filter(
                        (tub) => tub.id !== tubId,
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

    const value = Number(netWeightOverride);

    if (!Number.isFinite(value) || value < 0) return;

    setManualNetWeight(true);
  }

  function resetNetWeight() {
    if (!canOverrideNetWeight || workspaceFrozen) return;

    setManualNetWeight(false);
    setNetWeightOverride("");
  }

  function saveCurrentProduct() {
    if (workspaceFrozen) return;

    /*
      Backend persistence will be connected here.

      Current state is maintained locally so the dashboard
      can be completed before Prisma persistence is connected.
    */
  }

  function completeVendor() {
    if (!selectedVendor || purchaseCompleted) return;

    if (completedVendors.includes(selectedVendor.id)) return;

    setCompletedVendors((current) => [
      ...current,
      selectedVendor.id,
    ]);
  }

  function completePurchase() {
    if (purchaseCompleted) return;

    setPurchaseCompleted(true);
  }

  function createNewPurchase() {
    setPurchaseCompleted(false);
    setCompletedVendors([]);

    setVendors(initialVendors);

    const firstVendor = initialVendors[0];

    setSelectedVendorId(firstVendor?.id ?? "");
    setSelectedProductId(firstVendor?.products[0]?.id ?? "");

    setManualNetWeight(false);
    setNetWeightOverride("");
    setTubNumber("");
    setTubWeight("");
  }

  function openUserManagement() {
    router.push("/admin/users/");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-900">

      {/* ========================================================= */}
      {/* NAVBAR */}
      {/* ========================================================= */}

      <header className="sticky top-0 z-50 border-b border-orange-900 bg-white/90 backdrop-blur-md">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-10">

          {/* Brand */}

          <div className="min-w-0">
            <h1 className="truncate text-xs font-extrabold tracking-wide text-amber-800 sm:text-sm lg:text-base">
              CHAITANYA SEA FOODS SYNDICATE
            </h1>

            <p className="hidden text-[10px] font-medium text-slate-500 sm:block">
              Business Management System
            </p>
          </div>

          {/* Desktop Navigation */}

          <nav className="hidden items-center gap-1 lg:flex">

            <a
              href="#purchase"
              className="rounded-full bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"
            >
              Purchase
            </a>

            <a
              href="#sell"
              className="rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-orange-50 hover:text-orange-700"
            >
              Sell
            </a>

            <a
              href="#expense"
              className="rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-orange-50 hover:text-orange-700"
            >
              Expense
            </a>

            <a
              href="#reports"
              className="rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-orange-50 hover:text-orange-700"
            >
              Reports
            </a>

            <a
              href="/api/auth/signout"
              className="ml-2 rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-700 transition hover:border-orange-400 hover:bg-orange-50"
            >
              Logout
            </a>

          </nav>

          {/* Mobile Menu */}

          <button
            type="button"
            onClick={() => setShowMenu((value) => !value)}
            className="rounded-lg border border-orange-200 p-2 text-orange-700 transition hover:bg-orange-50 lg:hidden"
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

        {/* Mobile Menu */}

        {showMenu && (
          <div className="border-t border-orange-100 bg-white px-4 py-4 lg:hidden">

            <div className="mb-3 rounded-xl bg-orange-50 px-4 py-3">

              <p className="text-sm font-bold text-slate-900">
                {userName}
              </p>

              <p className="mt-0.5 text-xs font-semibold text-orange-700">
                {role}
              </p>

            </div>

            <nav className="grid gap-1">

              <a
                href="#purchase"
                onClick={() => setShowMenu(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-orange-700 hover:bg-orange-50"
              >
                Purchase
              </a>

              <a
                href="#sell"
                onClick={() => setShowMenu(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-orange-50"
              >
                Sell
              </a>

              <a
                href="#expense"
                onClick={() => setShowMenu(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-orange-50"
              >
                Expense
              </a>

              <a
                href="#reports"
                onClick={() => setShowMenu(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-orange-50"
              >
                Reports
              </a>

              <a
                href="/api/auth/signout"
                className="mt-2 rounded-lg border border-orange-200 px-3 py-3 text-sm font-semibold text-orange-700 hover:bg-orange-50"
              >
                Logout
              </a>

            </nav>

          </div>
        )}

      </header>


      {/* ========================================================= */}
      {/* DASHBOARD */}
      {/* ========================================================= */}

      <section className="relative isolate">

        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_15%,rgba(251,146,60,0.10),transparent_30%),radial-gradient(circle_at_90%_80%,rgba(148,163,184,0.10),transparent_35%)]" />

        <div className="mx-auto max-w-7xl px-3 py-3 sm:px-6 lg:px-10 lg:py-6">

          {/* ===================================================== */}
          {/* CURRENT PURCHASE */}
          {/* ===================================================== */}

          <section
            id="purchase"
            className="rounded-2xl border border-orange-600 bg-white shadow-sm"
          >

            {/* Purchase Header */}

            <div className="border-b border-orange-600 px-3 py-3 sm:px-4">

              <div className="flex items-center justify-between gap-3">

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-orange-600">
                    Current Purchase
                  </p>

                  <h2 className="text-lg font-extrabold text-slate-950 sm:text-xl">
                    Today&apos;s Purchase
                  </h2>

                </div>

                <div className="text-right">

                  <p className="text-[10px] font-semibold text-slate-400">
                    Date
                  </p>

                  <p className="text-xs font-bold text-slate-700">
                    {purchaseDate}
                  </p>

                </div>

              </div>

            </div>


            {/* Purchase Content */}

            <div className="space-y-4 p-3 sm:p-4">

              {/* ================================================= */}
              {/* CURRENT VENDOR */}
              {/* ================================================= */}

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Current Vendor
                    </p>

                    <p className="text-xs font-semibold text-slate-600">
                      Select vendor
                    </p>

                  </div>

                  {canCreate && !purchaseCompleted && (
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-orange-200 bg-orange-50 text-lg font-bold text-orange-600 transition hover:bg-orange-100"
                    >
                      +
                    </button>
                  )}

                </div>


                <div className="flex gap-2 overflow-x-auto pb-1">

                  {vendors.map((vendor) => {

                    const active =
                      vendor.id === selectedVendorId;

                    const completed =
                      completedVendors.includes(vendor.id);

                    return (
                      <div
                        key={vendor.id}
                        className={`flex shrink-0 items-center rounded-full border transition ${
                          active
                            ? "border-orange-400 bg-orange-50"
                            : "border-slate-400 bg-white"
                        }`}
                      >

                        <button
                          type="button"
                          disabled={purchaseCompleted}
                          onClick={() =>
                            selectVendor(vendor.id)
                          }
                          className={`px-4 py-2 text-xs font-bold ${
                            active
                              ? "text-orange-700"
                              : "text-slate-600"
                          }`}
                        >
                          {vendor.name}

                          {completed && (
                            <span className="ml-1 text-green-600">
                              ✓
                            </span>
                          )}
                        </button>

                        {!completed && !purchaseCompleted && (
                          <button
                            type="button"
                            onClick={() =>
                              cancelVendor(vendor.id)
                            }
                            className="pr-3 text-sm font-bold text-slate-400 hover:text-red-500"
                            aria-label={`Remove ${vendor.name}`}
                          >
                            ×
                          </button>
                        )}

                      </div>
                    );
                  })}

                </div>

              </div>


              {/* ================================================= */}
              {/* PRODUCT LIST */}
              {/* ================================================= */}

              {selectedVendor && (
                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <div>

                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ">
                        Product List
                      </p>

                      <p className="text-xs font-semibold text-slate-600">
                        {selectedVendor.name}
                      </p>

                    </div>

                    {canCreate &&
                      !workspaceFrozen && (
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-orange-200 bg-orange-50 text-lg font-bold text-orange-600 transition hover:bg-orange-300"
                        >
                          +
                        </button>
                      )}

                  </div>


                  <div className="flex gap-2 overflow-x-auto pb-1">

                    {selectedVendor.products.map(
                      (product) => {

                        const active =
                          product.id ===
                          selectedProductId;

                        return (
                          <div
                            key={product.id}
                            className={`flex shrink-0 items-center rounded-full border transition ${
                              active
                                ? "border-orange-400 bg-orange-50"
                                : "border-slate-400 bg-white"
                            }`}
                          >

                            <button
                              type="button"
                              disabled={workspaceFrozen}
                              onClick={() =>
                                selectProduct(
                                  product.id,
                                )
                              }
                              className={`px-4 py-2 text-xs font-bold ${
                                active
                                  ? "text-orange-700"
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
                                className="pr-3 text-sm font-bold text-slate-400 hover:text-red-500"
                                aria-label={`Remove ${product.name}`}
                              >
                                ×
                              </button>
                            )}

                          </div>
                        );
                      },
                    )}

                  </div>

                </div>
              )}


              {/* ================================================= */}
              {/* ACTIVE PRODUCT */}
              {/* ================================================= */}

              {selectedProduct && (
                <div className="rounded-xl border border-slate-400 bg-slate-50 p-3">

                  <div className="mb-3 flex items-center justify-between">

                    <div>

                      <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                        Active Product
                      </p>

                      <p className="text-sm font-extrabold text-slate-900">
                        {selectedProduct.name}
                      </p>

                    </div>

                    {selectedVendorCompleted && (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-[10px] font-bold text-green-700">
                        Completed
                      </span>
                    )}

                  </div>


                  {/* Product Name */}

                  <div className="grid gap-3 sm:grid-cols-3">

                    <div>

                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Product Name
                      </label>

                      <input
                        value={selectedProduct.name}
                        disabled={workspaceFrozen}
                        onChange={(event) =>
                          updateProductName(
                            event.target.value,
                          )
                        }
                        className="w-full rounded-lg border border-slate-400 bg-white px-3 py-2 text-sm font-semibold outline-none transition focus:border-orange-400"
                      />

                    </div>


                    {/* Grade */}

                    <div>

                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Grade
                      </label>

                      <select
                        value={selectedProduct.grade}
                        disabled={workspaceFrozen}
                        onChange={(event) =>
                          updateGrade(
                            event.target.value,
                          )
                        }
                        className="w-full rounded-lg border border-slate-400 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-orange-400"
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


                    {/* Count Per Kg */}

                    <div>

                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Count / kg
                      </label>

                      <input
                        value={
                          selectedProduct.countPerKg
                        }
                        disabled={workspaceFrozen}
                        onChange={(event) =>
                          updateCountPerKg(
                            event.target.value,
                          )
                        }
                        placeholder="Example 40"
                        className="w-full rounded-lg border border-slate-400 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-orange-400"
                      />

                    </div>

                  </div>

                </div>
              )}


              {/* ================================================= */}
              {/* TUBS */}
              {/* ================================================= */}

              {selectedProduct && (
                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <div>

                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {selectedVendor?.name} →{" "}
                        {selectedProduct.name}
                      </p>

                      <p className="text-sm font-extrabold text-slate-900">
                        Product Tubs
                      </p>

                    </div>

                    <span className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-bold text-orange-700">
                      {currentTubs.length} Tubs
                    </span>

                  </div>


                  {/* Existing Tubs */}

                  <div className="flex gap-2 overflow-x-auto pb-2">

                    {currentTubs.map((tub) => (
                      <div
                        key={tub.id}
                        className="flex shrink-0 items-center rounded-lg border border-slate-400 bg-white"
                      >

                        <div className="px-3 py-2">

                          <p className="text-xs font-extrabold text-slate-800">
                            {tub.number}
                          </p>

                          <p className="text-[10px] font-medium text-slate-400">
                            {tub.weight} kg
                          </p>

                        </div>

                        {!workspaceFrozen && (
                          <button
                            type="button"
                            onClick={() =>
                              removeTub(tub.id)
                            }
                            className="px-2 text-sm font-bold text-slate-400 hover:text-red-500"
                            aria-label={`Remove ${tub.number}`}
                          >
                            ×
                          </button>
                        )}

                      </div>
                    ))}

                  </div>


                  {/* Add Tub */}

                  {!workspaceFrozen && (
                    <div className="mt-2 grid grid-cols-[1fr_1fr_auto] gap-2">

                      <input
                        value={tubNumber}
                        onChange={(event) =>
                          setTubNumber(
                            event.target.value,
                          )
                        }
                        placeholder="Tub No."
                        className="min-w-0 rounded-lg border border-slate-400 px-3 py-2 text-xs font-semibold outline-none focus:border-orange-400"
                      />

                      <input
                        value={tubWeight}
                        onChange={(event) =>
                          setTubWeight(
                            event.target.value,
                          )
                        }
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Weight kg"
                        className="min-w-0 rounded-lg border border-slate-400 px-3 py-2 text-xs font-semibold outline-none focus:border-orange-400"
                      />

                      <button
                        type="button"
                        onClick={addTub}
                        className="rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-orange-600"
                      >
                        Add
                      </button>

                    </div>
                  )}

                </div>
              )}


              {/* ================================================= */}
              {/* WEIGHT SUMMARY */}
              {/* ================================================= */}

              {selectedProduct && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">

                  <div className="rounded-xl border border-slate-400 bg-white p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Gross Weight
                    </p>

                    <p className="mt-1 text-lg font-black text-slate-900">
                      {totalWeight.toFixed(2)}
                      <span className="ml-1 text-xs font-semibold text-slate-400">
                        kg
                      </span>
                    </p>
                  </div>


                  <div className="rounded-xl border border-slate-400 bg-white p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Default Net
                    </p>

                    <p className="mt-1 text-lg font-black text-slate-900">
                      {calculatedNetWeight.toFixed(2)}
                      <span className="ml-1 text-xs font-semibold text-slate-400">
                        kg
                      </span>
                    </p>
                  </div>


                  <div className="rounded-xl border border-orange-200 bg-orange-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                      Net Weight
                    </p>

                    <p className="mt-1 text-lg font-black text-orange-700">
                      {netWeight.toFixed(2)}
                      <span className="ml-1 text-xs font-semibold text-orange-500">
                        kg
                      </span>
                    </p>
                  </div>


                  <div className="rounded-xl border border-slate-400 bg-white p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Tubs
                    </p>

                    <p className="mt-1 text-lg font-black text-slate-900">
                      {currentTubs.length}
                    </p>
                  </div>

                </div>
              )}


              {/* ================================================= */}
              {/* ADMIN NET OVERRIDE */}
              {/* ================================================= */}

              {canOverrideNetWeight && selectedProduct && (
                <div className="rounded-xl border border-orange-200 bg-orange-100 p-3">

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">

                    <div className="flex-1">

                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-orange-700">
                        Admin Net Weight Override
                      </label>

                      <input
                        value={netWeightOverride}
                        disabled={workspaceFrozen}
                        onChange={(event) =>
                          setNetWeightOverride(
                            event.target.value,
                          )
                        }
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter net weight"
                        className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-orange-400"
                      />

                    </div>

                    <div className="flex gap-2">

                      <button
                        type="button"
                        disabled={workspaceFrozen}
                        onClick={applyNetWeightOverride}
                        className="rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Override
                      </button>

                      {manualNetWeight && (
                        <button
                          type="button"
                          disabled={workspaceFrozen}
                          onClick={resetNetWeight}
                          className="rounded-lg border border-orange-200 bg-white px-4 py-2 text-xs font-bold text-orange-700 hover:bg-orange-50"
                        >
                          Reset
                        </button>
                      )}

                    </div>

                  </div>

                  {manualNetWeight && (
                    <p className="mt-2 text-[10px] font-semibold text-orange-700">
                      Manual net weight is active. New tubs will add
                      95% of their gross weight to the overridden
                      baseline.
                    </p>
                  )}

                </div>
              )}


              {/* ================================================= */}
              {/* SAVE */}
              {/* ================================================= */}

              {selectedProduct && (
                <button
                  type="button"
                  disabled={workspaceFrozen}
                  onClick={saveCurrentProduct}
                  className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Save Purchase Details
                </button>
              )}


              {/* ================================================= */}
              {/* COMPLETE VENDOR */}
              {/* ================================================= */}

              {selectedVendor && (
                <div className="rounded-xl border border-slate-400 bg-white p-3">

                  <div className="flex items-center justify-between gap-3">

                    <div>

                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Vendor Completion
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {selectedVendor.name}
                      </p>

                    </div>

                    {selectedVendorCompleted ? (
                      <span className="rounded-full bg-green-100 px-4 py-2 text-xs font-bold text-green-700">
                        Completed
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={purchaseCompleted}
                        onClick={completeVendor}
                        className="rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Complete Vendor
                      </button>
                    )}

                  </div>

                </div>
              )}

            </div>

          </section>


          {/* ===================================================== */}
          {/* COMPLETE PURCHASE */}
          {/* ===================================================== */}

          <section className="mt-4 rounded-2xl border border-orange-400 bg-white p-3 shadow-sm sm:p-4">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                  Purchase Status
                </p>

                <h3 className="text-base font-extrabold text-slate-900">
                  {purchaseCompleted
                    ? "Purchase Completed"
                    : "Complete Today's Purchase"}
                </h3>

              </div>

              {purchaseCompleted ? (
                <div className="flex flex-wrap gap-2">

                  <span className="rounded-full bg-green-100 px-4 py-2 text-xs font-bold text-green-700">
                    Completed
                  </span>

                  <button
                    type="button"
                    onClick={createNewPurchase}
                    className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600"
                  >
                    Create New Purchase
                  </button>

                </div>
              ) : (
                <button
                  type="button"
                  onClick={completePurchase}
                  className="rounded-xl bg-red-500 px-5 py-3 text-xs font-bold text-white transition hover:bg-red-600"
                >
                  Complete Purchase
                </button>
              )}

            </div>

          </section>


          {/* ===================================================== */}
          {/* SELL */}
          {/* ===================================================== */}

          <section
            id="sell"
            className="mt-4 rounded-2xl border border-slate-400 bg-white p-4 shadow-sm"
          >

            <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
              Sell
            </p>

            <h2 className="mt-1 text-base font-extrabold text-slate-900">
              Sales Management
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Sales management will be connected here.
            </p>

          </section>


          {/* ===================================================== */}
          {/* EXPENSE */}
          {/* ===================================================== */}

          <section
            id="expense"
            className="mt-4 rounded-2xl border border-slate-400 bg-white p-4 shadow-sm"
          >

            <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
              Expense
            </p>

            <h2 className="mt-1 text-base font-extrabold text-slate-900">
              Expense Management
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Regular expenses and transport expenses will be
              connected here.
            </p>

          </section>


          {/* ===================================================== */}
          {/* REPORTS */}
          {/* ===================================================== */}

          <section
            id="reports"
            className="mt-4 rounded-2xl border border-slate-400 bg-white p-4 shadow-sm"
          >

            <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
              Reports
            </p>

            <h2 className="mt-1 text-base font-extrabold text-slate-900">
              Business Reports
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Purchase sales expense and supply chain reports
              will appear here.
            </p>

          </section>


          {/* ===================================================== */}
          {/* MANAGE USERS */}
          {/* ===================================================== */}

          {role === "ADMIN" && (
            <section className="mt-5">

              <button
                type="button"
                onClick={openUserManagement}
                className="w-full rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700 transition hover:border-orange-400 hover:bg-orange-100"
              >
                Manage Users
              </button>

            </section>
          )}

        </div>

      </section>


      {/* ========================================================= */}
      {/* FOOTER */}
      {/* ========================================================= */}

      <footer className="mt-6 border-t border-slate-200 bg-slate-950 text-white">

        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">

          <div className="grid gap-7 md:grid-cols-2 md:items-center">

            <div>

              <h3 className="font-bold">
                CHAITANYA SEA FOODS SYNDICATE
              </h3>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                Office No. V 990, APMC Market, Sector 19 Krushi
                Wholesale Mart, Turbhe, Navi Mumbai 400 703
              </p>

            </div>


            <div className="md:text-right">

              <p className="text-sm font-semibold text-orange-400">
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